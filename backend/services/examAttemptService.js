const ExamAttempt = require("../models/ExamAttemptModel");
const Exam = require("../models/ExamModel");
const Result = require("../models/Result");
const User = require("../models/UserModel");

class ExamAttemptService {
	// Start a new exam attempt
	async startExamAttempt(examId, userId, clientInfo = {}) {
		try {
			// Check if user already has an attempt for this exam
		        const existingAttempt = await ExamAttempt.findOne({ examId, userId, status: 'in_progress' });
		if (existingAttempt) {
			throw new Error("User already has an in-progress attempt for this exam");
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
				startTime: new Date(),
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

			// Create initial result record
			const result = new Result({
				attemptId: examAttempt._id,
				examId,
				userId,
				questionResults: this.createQuestionResults(exam, examAttempt._id),
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
            console.log(`[getAttemptStatus] Fetching status for attemptId: ${attemptId}`);
			const attempt = await ExamAttempt.findOne({
				_id: attemptId,
				userId,
			}).populate("examId");

			if (!attempt) {
                console.log(`[getAttemptStatus] Attempt not found for attemptId: ${attemptId}`);
				throw new Error("Attempt not found");
			}

            console.log(`[getAttemptStatus] Raw attempt status: ${attempt.status}`);

			// Check for timeout
			if (attempt.autoSubmitOnTimeout && attempt.isTimedOut()) {
                console.log(`[getAttemptStatus] Attempt timed out. Handling timeout.`);
				await this.handleTimeout(attempt);
			}

			const currentSubject = attempt.getCurrentSubjectAttempt();
            console.log(`[getAttemptStatus] Current subject from getCurrentSubjectAttempt(): ${currentSubject?.subjectIndex}, isCompleted: ${currentSubject?.isCompleted}`);

			const timeRemaining = attempt.getTimeRemainingForCurrentSubject();
            let currentSubjectIndex = currentSubject?.subjectIndex;

            if (currentSubjectIndex === undefined && attempt.status === 'in_progress') {
                currentSubjectIndex = 0;
            }
            console.log(`[getAttemptStatus] Returning currentSubjectIndex: ${currentSubjectIndex}`);

			return {
				attemptId: attempt._id,
				status: attempt.status,
				currentSubject: currentSubjectIndex ?? null,
				timeRemaining,
				totalSubjects: attempt.subjectAttempts.length,
				completedSubjects: attempt.subjectAttempts.filter((s) => s.isCompleted)
					.length,
				exam: attempt.examId,
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
		answerFile = null
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
				(s) => s.subjectIndex === subjectIndex
			);
			if (!subjectAttempt || subjectAttempt.isCompleted) {
				throw new Error("Subject is not available for answering");
			}

			// Check time limit
			if (subjectAttempt.timeLimitMin > 0) {
				const elapsed = (new Date() - subjectAttempt.startTime) / 1000 / 60;
				if (elapsed >= subjectAttempt.timeLimitMin) {
					await this.handleTimeout(attempt);
					throw new Error("Time limit exceeded for this subject");
				}
			}

			// Update or add answer
			const existingAnswerIndex = subjectAttempt.answers.findIndex(
				(a) => a.questionIndex === questionIndex
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

			// Update result
			await this.updateResult(
				attemptId,
				subjectIndex,
				questionIndex,
				answer,
				timeSpent
			);

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
            const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
            if (!attempt) {
                throw new Error("Attempt not found");
            }

            if (attempt.status !== "in_progress") {
                throw new Error("Exam is not in progress");
            }

            const subjectAttempt = attempt.subjectAttempts.find(
                (s) => s.subjectIndex === subjectIndex
            );
            if (!subjectAttempt || subjectAttempt.isCompleted) {
                throw new Error("Subject is not available for answering");
            }

            // Iterate through the answers array and update/add each answer
            for (const submittedAnswer of answers) {
                const { questionIndex, answer, type } = submittedAnswer;

                const existingAnswerIndex = subjectAttempt.answers.findIndex(
                    (a) => a.questionIndex === questionIndex
                );

                if (existingAnswerIndex >= 0) {
                    subjectAttempt.answers[existingAnswerIndex].answer = answer;
                    // timeSpent is not passed from frontend for batch submission, so we don't update it here
                } else {
                    subjectAttempt.answers.push({
                        questionIndex,
                        subjectIndex,
                        answer,
                        timeSpent: 0, // Default to 0 for batch submission
                    });
                }

                // Update result for each answer
                await this.updateResult(
                    attemptId,
                    subjectIndex,
                    questionIndex,
                    answer,
                    0 // timeSpent is 0 for batch submission
                );
            }

            await attempt.save();

            return { success: true };
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
				(s) => s.subjectIndex === subjectIndex
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
		if (attempt.handleTimeout()) {
			await attempt.save();
			await this.completeExam(attempt);
		}
	}

	// Complete exam and generate results
	async completeExam(attempt) {
		attempt.status = "completed";
		attempt.endTime = new Date();
		attempt.totalDuration = (attempt.endTime - attempt.startTime) / 1000;

		await attempt.save();

		// Auto-grade MCQs and generate results
		const result = await Result.findOne({ attemptId: attempt._id });
		if (result) {
			result.autoGradeMCQs();
			result.submittedAt = new Date();
			await result.save();
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
				"title description subjects"
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
		timeSpent
	) {
		const result = await Result.findOne({ attemptId });
		if (!result) return;

		const attempt = await ExamAttempt.findById(attemptId).populate('examId'); // Fetch attempt to get exam details
		if (!attempt || !attempt.examId) return;

		const exam = attempt.examId;
		const subject = exam.subjects[subjectIndex];
		const question = subject.questions[questionIndex];


		const questionResult = result.questionResults.find(
			(q) =>
				q.subjectIndex === subjectIndex && q.questionIndex === questionIndex
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

				questionResult.isCorrect = (answer === correctOptionText);
				questionResult.marksObtained = questionResult.isCorrect
					? questionResult.maxMarks
					: 0;
			} else if (questionResult.questionType === "mcq-multiple") {
                // For multiple choice, answer is an array of selected option texts
                // Correct answer is an array of indices
                const userAnswers = Array.isArray(answer) ? answer.sort() : [];
                const correctOptionTexts = questionResult.correctAnswer.map(index => question.options[index]).sort();

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

			// Check for timeout
			if (timeRemaining <= 0) {
				await this.handleTimeout(attempt);
				return { timeRemaining: 0, status: "timeout" };
			}

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
            console.log(`[advanceSubject] Attempting to advance subject for attemptId: ${attemptId}, userId: ${userId}`);
            const attempt = await ExamAttempt.findOne({ _id: attemptId, userId });
            if (!attempt) {
                console.log(`[advanceSubject] Attempt not found for attemptId: ${attemptId}`);
                throw new Error("Attempt not found");
            }

            console.log(`[advanceSubject] Attempt found. Status: ${attempt.status}`);
            if (attempt.status !== "in_progress") {
                console.log(`[advanceSubject] Exam not in progress. Status: ${attempt.status}`);
                throw new Error("Exam is not in progress");
            }

            const currentSubjectAttempt = attempt.getCurrentSubjectAttempt();
            console.log(`[advanceSubject] Current subject before advance: ${currentSubjectAttempt?.subjectIndex}, isCompleted: ${currentSubjectAttempt?.isCompleted}`);

            if (!currentSubjectAttempt) {
                console.log(`[advanceSubject] No active subject to advance from.`);
                throw new Error("No active subject to advance from.");
            }

            // Mark the current subject as completed
            currentSubjectAttempt.isCompleted = true;
            currentSubjectAttempt.endTime = new Date();
            currentSubjectAttempt.timeRemaining = 0; // Ensure time remaining is 0 for completed subject
            console.log(`[advanceSubject] Marked subject ${currentSubjectAttempt.subjectIndex} as completed.`);

            // Save the attempt to persist the completion of the current subject
            await attempt.save();
            console.log(`[advanceSubject] Attempt saved after marking current subject completed. Attempt object after save: ${JSON.stringify(attempt.subjectAttempts)}`);

            // Check if there's a next subject
            const nextSubjectAttempt = attempt.getCurrentSubjectAttempt();
            console.log(`[advanceSubject] Next subject found: ${nextSubjectAttempt?.subjectIndex}`);

            if (nextSubjectAttempt) {
                // If there's a next subject, update its start time to now
                // This effectively "starts" the timer for the next subject
                nextSubjectAttempt.startTime = new Date();
                await attempt.save(); // Save again to update the next subject's start time
                console.log(`[advanceSubject] Attempt saved after updating next subject ${nextSubjectAttempt.subjectIndex} start time.`);
            } else {
                // If no next subject, all subjects are completed, so complete the exam
                console.log(`[advanceSubject] No next subject. Calling completeExam.`);
                await this.completeExam(attempt);
            }

            console.log(`[advanceSubject] Subject advanced successfully.`);
            return { success: true };
        } catch (error) {
            console.error(`[advanceSubject] Error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ExamAttemptService();
