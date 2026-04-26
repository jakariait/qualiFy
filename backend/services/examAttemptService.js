const ExamAttempt = require("../models/ExamAttemptModel");
const Exam = require("../models/ExamModel");
const Result = require("../models/Result");
const User = require("../models/UserModel");

// Fetch exam from MongoDB directly (skip Redis cache for exam attempts to ensure fresh data)
async function fetchExam(examId) {
  return Exam.findById(examId).lean();
}

class ExamAttemptService {
  // Start a new exam attempt
  async startExamAttempt(examId, userId, clientInfo = {}) {
    try {
      // Check if user already has an attempt for this exam
      const existingAttempt = await ExamAttempt.findOne({
        examId,
        userId,
        status: "in_progress",
      });
      if (existingAttempt) {
        throw new Error(
          "User already has an in-progress attempt for this exam",
        );
      }

      // Get exam details
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Exam not found");
      }

      if (exam.status !== "published") {
        throw new Error("Exam is not available for attempts");
      }

      // Create subject attempts
      const subjectAttempts = exam.subjects.map((subject, index) => ({
        subjectIndex: index,
        startTime: index === 0 ? new Date() : null,
        timeLimitMin: subject.timeLimitMin || 0,
        isCompleted: false,
        answers: [],
      }));

      // Create exam attempt
      const examAttempt = new ExamAttempt({
        examId,
        userId,
        startTime: new Date(),
        status: "in_progress",
        subjectAttempts,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceInfo: clientInfo.deviceInfo,
      });

      await examAttempt.save();

      // Create initial result record with empty question results (lazy load later)
      const result = new Result({
        attemptId: examAttempt._id,
        examId,
        userId,
        questionResults: [],
      });

      await result.save();

      return {
        attemptId: examAttempt._id,
        exam: {
          title: exam.title,
          description: exam.description,
          subjects: exam.subjects.map((subject, index) => ({
            index,
            title: subject.title,
            timeLimitMin: subject.timeLimitMin,
            questionCount: subject.questions.length,
          })),
        },
        currentSubject: 0,
        timeRemaining: subjectAttempts[0]?.timeLimitMin * 60 || 0, // in seconds
      };
    } catch (error) {
      throw error;
    }
  }

  // Get current exam attempt status
  async getAttemptStatus(attemptId, userId) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) throw new Error("Attempt not found");
      const exam = await fetchExam(attempt.examId);

      const currentSubject = attempt.getCurrentSubjectAttempt();
      const timeRemaining = attempt.getTimeRemainingForCurrentSubject();
      let currentSubjectIndex = currentSubject?.subjectIndex;
      if (currentSubjectIndex === undefined && attempt.status === "in_progress") {
        currentSubjectIndex = 0;
      }

      // Only return questions for the current subject (for performance)
      const subjects = exam.subjects.map((sub, idx) => ({
        ...sub,
        questions: idx === currentSubjectIndex ? sub.questions : [],
      }));

      return {
        attemptId: attempt._id,
        status: attempt.status,
        currentSubject: currentSubjectIndex ?? null,
        timeRemaining,
        totalSubjects: attempt.subjectAttempts.length,
        completedSubjects: attempt.subjectAttempts.filter((s) => s.isCompleted).length,
        exam: { ...exam, subjects },
      };
    } catch (error) {
      throw error;
    }
  }

  // Submit answer for a question
  async submitAnswer(
    attemptId,
    userId,
    subjectIndex,
    questionIndex,
    answer,
    timeSpent = 0,
    answerFile = null,
  ) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) {
        throw new Error("Attempt not found");
      }

      if (attempt.status !== "in_progress") {
        throw new Error("Exam is not in progress");
      }

      // Check if subject is still active
      const subjectAttempt = attempt.subjectAttempts.find(
        (s) => s.subjectIndex === subjectIndex,
      );
      if (!subjectAttempt || subjectAttempt.isCompleted) {
        throw new Error("Subject is not available for answering");
      }

      // Check time limit
      if (subjectAttempt.timeLimitMin > 0) {
        const elapsed = (new Date() - subjectAttempt.startTime) / 1000 / 60;
        if (elapsed >= subjectAttempt.timeLimitMin) {
          throw new Error("Time limit exceeded for this subject");
        }
      }

      // Update or add answer
      const existingAnswerIndex = subjectAttempt.answers.findIndex(
        (a) => a.questionIndex === questionIndex,
      );

      if (existingAnswerIndex >= 0) {
        subjectAttempt.answers[existingAnswerIndex].answer = answer;
        subjectAttempt.answers[existingAnswerIndex].timeSpent = timeSpent;
        if (answerFile) {
          subjectAttempt.answers[existingAnswerIndex].answerFile = answerFile;
        }
      } else {
        subjectAttempt.answers.push({
          questionIndex,
          subjectIndex,
          answer,
          timeSpent,
          answerFile,
        });
      }

      await attempt.save();

      return {
        success: true,
        timeRemaining: attempt.getTimeRemainingForCurrentSubject(),
      };
    } catch (error) {
      throw error;
    }
  }

  async submitAllAnswers(attemptId, userId, subjectIndex, answers) {
    try {
      // 1. Fetch attempt + result in parallel; exam comes from Redis cache
      const [attempt, result] = await Promise.all([
        ExamAttempt.findOne({ _id: attemptId, userId }),
        Result.findOne({ attemptId }),
      ]);
      if (!attempt) throw new Error("Attempt not found");
      if (attempt.status !== "in_progress") throw new Error("Exam is not in progress");
      if (!result) throw new Error("Result not found for the attempt");
      const exam = await fetchExam(attempt.examId);

      const subjectAttempt = attempt.subjectAttempts.find(
        (s) => s.subjectIndex === subjectIndex,
      );
      if (!subjectAttempt) throw new Error("Subject not found");

      // 2. Grace period for timed-out subjects
      if (subjectAttempt.isCompleted) {
        const timeSinceCompletion = Date.now() - (subjectAttempt.endTime || Date.now());
        if (timeSinceCompletion > 10000) {
          throw new Error("Subject is not available for answering as it was completed some time ago.");
        }
      }

      // 3. Build O(1) lookup maps
      const questionResultMap = new Map();
      result.questionResults.forEach((qr) => {
        if (qr.subjectIndex === subjectIndex) questionResultMap.set(qr.questionIndex, qr);
      });
      const existingAnswerMap = new Map(
        subjectAttempt.answers.map((a, i) => [a.questionIndex, i]),
      );

      const subject = exam.subjects[subjectIndex];

      // 4. Process all answers in memory
      for (const { questionIndex, answer, type } of answers) {
        const existingIdx = existingAnswerMap.get(questionIndex);
        if (existingIdx !== undefined) {
          subjectAttempt.answers[existingIdx].answer = answer;
        } else {
          subjectAttempt.answers.push({ questionIndex, subjectIndex, answer, timeSpent: 0 });
        }

        // Lazy create question result if not exists
        let questionResult = questionResultMap.get(questionIndex);
        if (!questionResult && subject?.questions?.[questionIndex]) {
          const question = subject.questions[questionIndex];
          // Include userAnswer directly so Mixed type is set before the push
          result.questionResults.push({
            questionIndex,
            subjectIndex,
            questionType: question.type,
            questionText: question.text,
            correctAnswer: question.correctAnswers,
            maxMarks: question.marks,
            userAnswer: answer,
            isCorrect: null,
            marksObtained: 0,
            timeSpent: 0,
          });
          // Use the Mongoose subdocument reference for subsequent grading logic
          questionResult = result.questionResults[result.questionResults.length - 1];
          questionResultMap.set(questionIndex, questionResult);
        }

        if (questionResult) {
          questionResult.userAnswer = answer;
          const question = subject?.questions?.[questionIndex];
          if (question) {
            if (questionResult.questionType === "mcq-single") {
              const correctOptionIndex = questionResult.correctAnswer?.[0];
              const correctOptionText = question.options?.[correctOptionIndex];
              questionResult.isCorrect = answer === correctOptionText;
              questionResult.marksObtained = questionResult.isCorrect ? questionResult.maxMarks : 0;
            } else if (questionResult.questionType === "mcq-multiple") {
              const userAnswers = Array.isArray(answer) ? [...answer].sort() : [];
              const correctOptionTexts = (questionResult.correctAnswer || []).map((i) => question.options?.[i]).filter(Boolean).sort();
              questionResult.isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctOptionTexts);
              questionResult.marksObtained = questionResult.isCorrect ? questionResult.maxMarks : 0;
            }
          }
        }
      }

      // Mark as modified so Mongoose persists Mixed-type field changes
      attempt.markModified("subjectAttempts");
      result.markModified("questionResults");

      // 5. Save both documents in parallel
      await Promise.all([attempt.save(), result.save()]);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async submitAndAdvance(attemptId, userId, subjectIndex, answers) {
    try {
      // 1. Fetch attempt + result in parallel
      const [attempt, result] = await Promise.all([
        ExamAttempt.findOne({ _id: attemptId, userId }),
        Result.findOne({ attemptId }),
      ]);
      if (!attempt) throw new Error("Attempt not found");
      if (attempt.status !== "in_progress") throw new Error("Exam is not in progress");
      if (!result) throw new Error("Result not found for the attempt");
      const exam = await fetchExam(attempt.examId);
      if (!exam) throw new Error("Exam not found");

      const subjectAttempt = attempt.subjectAttempts.find(
        (s) => s.subjectIndex === subjectIndex,
      );
      if (!subjectAttempt) throw new Error("Subject not found");

      // 2. Build O(1) lookup maps
      const questionResultMap = new Map();
      result.questionResults.forEach((qr) => {
        if (qr.subjectIndex === subjectIndex) questionResultMap.set(qr.questionIndex, qr);
      });
      const existingAnswerMap = new Map(
        subjectAttempt.answers.map((a, i) => [a.questionIndex, i]),
      );

      const subject = exam.subjects[subjectIndex];

      // 3. Process all answers in memory
      for (const { questionIndex, answer } of answers) {
        const existingIdx = existingAnswerMap.get(questionIndex);
        if (existingIdx !== undefined) {
          subjectAttempt.answers[existingIdx].answer = answer;
        } else {
          subjectAttempt.answers.push({ questionIndex, subjectIndex, answer, timeSpent: 0 });
        }

        // Lazy create question result if not exists
        let questionResult = questionResultMap.get(questionIndex);
        if (!questionResult && subject?.questions?.[questionIndex]) {
          const question = subject.questions[questionIndex];
          // Include userAnswer directly so Mixed type is set before the push
          result.questionResults.push({
            questionIndex,
            subjectIndex,
            questionType: question.type,
            questionText: question.text,
            correctAnswer: question.correctAnswers,
            maxMarks: question.marks,
            userAnswer: answer,
            isCorrect: null,
            marksObtained: 0,
            timeSpent: 0,
          });
          // Use the Mongoose subdocument reference for subsequent grading logic
          questionResult = result.questionResults[result.questionResults.length - 1];
          questionResultMap.set(questionIndex, questionResult);
        }

        if (questionResult) {
          questionResult.userAnswer = answer;
          const question = subject?.questions?.[questionIndex];
          if (question) {
            if (questionResult.questionType === "mcq-single") {
              const correctOptionIndex = questionResult.correctAnswer?.[0];
              const correctOptionText = question.options?.[correctOptionIndex];
              questionResult.isCorrect = answer === correctOptionText;
              questionResult.marksObtained = questionResult.isCorrect ? questionResult.maxMarks : 0;
            } else if (questionResult.questionType === "mcq-multiple") {
              const userAnswers = Array.isArray(answer) ? [...answer].sort() : [];
              const correctOptionTexts = (questionResult.correctAnswer || []).map((i) => question.options?.[i]).filter(Boolean).sort();
              questionResult.isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctOptionTexts);
              questionResult.marksObtained = questionResult.isCorrect ? questionResult.maxMarks : 0;
            }
          }
        }
      }

      // Mark questionResults as modified so Mongoose persists Mixed-type field changes
      result.markModified("questionResults");

      // 4. Mark current subject complete and start next
      subjectAttempt.isCompleted = true;
      subjectAttempt.endTime = new Date();
      subjectAttempt.timeRemaining = 0;

      const nextSubjectAttempt = attempt.subjectAttempts.find((s) => !s.isCompleted);
      if (nextSubjectAttempt) nextSubjectAttempt.startTime = new Date();

      // Mark as modified so Mongoose persists Mixed-type field changes
      attempt.markModified("subjectAttempts");
      result.markModified("questionResults");

      // 5. Save both documents in parallel
      await Promise.all([attempt.save(), result.save()]);

      // 6. Return new status directly — caller skips a separate fetchExamStatus request
      const currentSubjectIndex = nextSubjectAttempt ? nextSubjectAttempt.subjectIndex : null;
      const timeRemaining = attempt.getTimeRemainingForCurrentSubject();

      return {
        success: true,
        newStatus: {
          attemptId: attempt._id,
          status: attempt.status,
          currentSubject: currentSubjectIndex,
          timeRemaining,
          totalSubjects: attempt.subjectAttempts.length,
          completedSubjects: attempt.subjectAttempts.filter((s) => s.isCompleted).length,
          exam,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Complete a subject
  async completeSubject(attemptId, userId, subjectIndex) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) {
        throw new Error("Attempt not found");
      }

      const subjectAttempt = attempt.subjectAttempts.find(
        (s) => s.subjectIndex === subjectIndex,
      );
      if (!subjectAttempt || subjectAttempt.isCompleted) {
        throw new Error("Subject is not available for completion");
      }

      subjectAttempt.isCompleted = true;
      subjectAttempt.endTime = new Date();
      subjectAttempt.timeRemaining = 0;

      await attempt.save();

      // Check if all subjects are completed
      const allCompleted = attempt.subjectAttempts.every((s) => s.isCompleted);
      if (allCompleted) {
        await this.completeExam(attempt);
      }

      return {
        success: true,
        allSubjectsCompleted: allCompleted,
        nextSubject: allCompleted
          ? null
          : attempt.getCurrentSubjectAttempt()?.subjectIndex,
      };
    } catch (error) {
      throw error;
    }
  }

  // Submit exam manually
  async submitExam(attemptId, userId) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) {
        throw new Error("Attempt not found");
      }

      if (attempt.status !== "in_progress") {
        throw new Error("Exam is not in progress");
      }

      await this.completeExam(attempt);

      return {
        success: true,
        attemptId: attempt._id,
      };
    } catch (error) {
      throw error;
    }
  }

  // Handle timeout automatically
  async handleTimeout(attempt) {
    console.log(
      `Auto-advancing subject due to syncTime timeout for attempt ${attempt._id}`,
    );
    // Reuse the advanceSubject logic to ensure consistent state transitions.
    await this.advanceSubject(attempt._id, attempt.userId);
  }

  // Complete exam and generate results
  async completeExam(attempt) {
    console.log(`[completeExam] Called for attempt ${attempt._id}`);
    const endTime = new Date();
    const duration = (endTime - attempt.startTime) / 1000;

    const updatedAttempt = await ExamAttempt.findOneAndUpdate(
      { _id: attempt._id, status: { $ne: "completed" } },
      {
        $set: {
          status: "completed",
          endTime: endTime,
          totalDuration: duration,
        },
      },
      { new: true },
    );

    if (!updatedAttempt) {
      console.log(
        `[completeExam] Attempt ${attempt._id} was already completed by another process.`,
      );
      return;
    }

    const result = await Result.findOne({ attemptId: updatedAttempt._id });
    if (result) {
      if (!result.submittedAt) {
        result.autoGradeMCQs();
        result.submittedAt = new Date();
        await result.save();
      }
    }
  }

  // Get exam results
  async getExamResults(attemptId, userId) {
    try {
      const attempt = await ExamAttempt.findOne({
        _id: attemptId,
        userId,
      }).populate("examId");

      const result = await Result.findOne({ attemptId }).populate(
        "examId",
        "title description subjects",
      );

      if (!attempt || !result) {
        throw new Error("Results not found");
      }

      return {
        attempt: {
          id: attempt._id,
          status: attempt.status,
          startTime: attempt.startTime,
          endTime: attempt.endTime,
          totalDuration: attempt.totalDuration,
        },
        result: {
          totalMarks: result.totalMarks,
          obtainedMarks: result.obtainedMarks,
          percentage: result.percentage,
          status: result.status,
          mcqResults: {
            correct: result.mcqCorrectCount,
            wrong: result.mcqWrongCount,
            total: result.mcqTotalCount,
          },
          pendingReview: result.pendingReviewCount,
          questionResults: result.questionResults,
        },
        exam: attempt.examId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Create question results for initial result record
  createQuestionResults(exam, attemptId) {
    const questionResults = [];

    exam.subjects.forEach((subject, subjectIndex) => {
      subject.questions.forEach((question, questionIndex) => {
        questionResults.push({
          questionIndex,
          subjectIndex,
          questionType: question.type,
          questionText: question.text,
          correctAnswer: question.correctAnswers,
          maxMarks: question.marks,
          userAnswer: null,
          isCorrect: null,
          marksObtained: 0,
          timeSpent: 0,
        });
      });
    });

    return questionResults;
  }

  // Update result when answer is submitted
  async updateResult(
    attemptId,
    subjectIndex,
    questionIndex,
    answer,
    timeSpent,
  ) {
    const result = await Result.findOne({ attemptId });
    if (!result) return;

    const attempt = await ExamAttempt.findById(attemptId).populate("examId"); // Fetch attempt to get exam details
    if (!attempt || !attempt.examId) return;

    const exam = attempt.examId;
    const subject = exam.subjects[subjectIndex];
    const question = subject.questions[questionIndex];

    const questionResult = result.questionResults.find(
      (q) =>
        q.subjectIndex === subjectIndex && q.questionIndex === questionIndex,
    );

    if (questionResult) {
      questionResult.userAnswer = answer;
      questionResult.timeSpent = timeSpent;

      // Auto-grade MCQ questions
      if (questionResult.questionType === "mcq-single") {
        // Correct answer is stored as an array of indices, e.g., [0] for the first option
        // User answer is the text of the selected option
        const correctOptionIndex = questionResult.correctAnswer[0]; // Assuming single correct answer
        const correctOptionText = question.options[correctOptionIndex];

        questionResult.isCorrect = answer === correctOptionText;
        questionResult.marksObtained = questionResult.isCorrect
          ? questionResult.maxMarks
          : 0;
      } else if (questionResult.questionType === "mcq-multiple") {
        // For multiple choice, answer is an array of selected option texts
        // Correct answer is an array of indices
        const userAnswers = Array.isArray(answer) ? answer.sort() : [];
        const correctOptionTexts = questionResult.correctAnswer
          .map((index) => question.options[index])
          .sort();

        questionResult.isCorrect =
          JSON.stringify(userAnswers) === JSON.stringify(correctOptionTexts);
        questionResult.marksObtained = questionResult.isCorrect
          ? questionResult.maxMarks
          : 0;
      }
      // For other question types (short, image), isCorrect and marksObtained remain null/0
      // unless there's a specific grading logic for them.

      await result.save();
    }
  }

  // Get all attempts for a user
  async getUserAttempts(userId) {
    try {
      const attempts = await ExamAttempt.find({ userId })
        .populate("examId", "title description")
        .sort({ createdAt: -1 });

      return attempts.map((attempt) => ({
        id: attempt._id,
        exam: attempt.examId,
        status: attempt.status,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        totalDuration: attempt.totalDuration,
        percentage: attempt.percentage,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get all attempts for an exam (admin)
  async getExamAttempts(examId) {
    try {
      const attempts = await ExamAttempt.find({ examId })
        .populate("userId", "name email")
        .populate("examId", "title description")
        .sort({ createdAt: -1 });

      return attempts;
    } catch (error) {
      throw error;
    }
  }

  // Sync time with server
  async syncTime(attemptId, userId) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) {
        throw new Error("Attempt not found");
      }

      const currentSubject = attempt.getCurrentSubjectAttempt();
      if (!currentSubject) {
        return { timeRemaining: 0, status: "completed" };
      }

      const timeRemaining = attempt.getTimeRemainingForCurrentSubject();

      return {
        timeRemaining,
        status: attempt.status,
        currentSubject: currentSubject.subjectIndex,
      };
    } catch (error) {
      throw error;
    }
  }

  async advanceSubject(attemptId, userId) {
    try {
      const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
      if (!attempt) throw new Error("Attempt not found");
      if (attempt.status !== "in_progress") throw new Error("Exam is not in progress");

      const currentSubjectAttempt = attempt.getCurrentSubjectAttempt();
      if (!currentSubjectAttempt) throw new Error("No active subject to advance from.");

      // Guard against race conditions from rapid successive calls
      const subjectUptime = (Date.now() - currentSubjectAttempt.startTime) / 1000;
      if (subjectUptime < 3 && currentSubjectAttempt.subjectIndex > 0) {
        return { success: true, message: "Subject already advanced." };
      }

      currentSubjectAttempt.isCompleted = true;
      currentSubjectAttempt.endTime = new Date();
      currentSubjectAttempt.timeRemaining = 0;

      const nextSubjectAttempt = attempt.subjectAttempts.find((s) => !s.isCompleted);
      if (nextSubjectAttempt) nextSubjectAttempt.startTime = new Date();

      await attempt.save();
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ExamAttemptService();