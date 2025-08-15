const ExamAttempt = require("../models/ExamAttemptModel");
const Exam = require("../models/ExamModel");
const Result = require("../models/Result");
const User = require("../models/UserModel");

class ExamAttemptService {
	// Start a new exam attempt
	async startExamAttempt(examId, userId, clientInfo = {}) {
		try {
			// Check if user already has an attempt for this exam
			const existingAttempt = await ExamAttempt.findOne({ examId, userId });
			if (existingAttempt) {
				throw new Error("User already has an attempt for this exam");
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
			const attempt = await ExamAttempt.findOne({
				_id: attemptId,
				userId,
			}).populate("examId", "title description subjects");

			if (!attempt) {
				throw new Error("Attempt not found");
			}

			// Check for timeout
			if (attempt.autoSubmitOnTimeout && attempt.isTimedOut()) {
				await this.handleTimeout(attempt);
			}

			const currentSubject = attempt.getCurrentSubjectAttempt();
			const timeRemaining = attempt.getTimeRemainingForCurrentSubject();

			return {
				attemptId: attempt._id,
				status: attempt.status,
				currentSubject: currentSubject?.subjectIndex || null,
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
		timeSpent = 0
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
			} else {
				subjectAttempt.answers.push({
					questionIndex,
					subjectIndex,
					answer,
					timeSpent,
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
			}).populate("examId", "title description subjects");

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

		const questionResult = result.questionResults.find(
			(q) =>
				q.subjectIndex === subjectIndex && q.questionIndex === questionIndex
		);

		if (questionResult) {
			questionResult.userAnswer = answer;
			questionResult.timeSpent = timeSpent;

			// Auto-grade MCQ questions
			if (questionResult.questionType === "mcq-single") {
				if (
					Array.isArray(answer) &&
					Array.isArray(questionResult.correctAnswer)
				) {
					const userAnswers = answer.sort();
					const correctAnswers = questionResult.correctAnswer.sort();

					questionResult.isCorrect =
						JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
					questionResult.marksObtained = questionResult.isCorrect
						? questionResult.maxMarks
						: 0;
				}
			}

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
}

module.exports = new ExamAttemptService();
