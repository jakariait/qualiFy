const examAttemptService = require("../services/examAttemptService");

class ExamAttemptController {
	// Start a new exam attempt
	async startExamAttempt(req, res) {
		try {
			const { examId } = req.params;
			const userId = req.user.id;

			const clientInfo = {
				ipAddress: req.ip || req.connection.remoteAddress,
				userAgent: req.get("User-Agent"),
				deviceInfo: req.get("User-Agent"),
			};

			const result = await examAttemptService.startExamAttempt(
				examId,
				userId,
				clientInfo
			);

			res.status(201).json({
				success: true,
				message: "Exam attempt started successfully",
				data: result,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
		}
	}

	async getAttemptStatus(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;
			const status = await examAttemptService.getAttemptStatus(attemptId, userId);
			res.status(200).json({ success: true, data: status });
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	  async submitAnswer(req, res) {
		try {
			const { attemptId } = req.params;
			const { subjectIndex, questionIndex, answer, timeSpent } = req.body;
			const userId = req.user.id;

			if (subjectIndex === undefined || questionIndex === undefined || !answer) {
				return res.status(400).json({
					success: false,
					message: "Missing required fields: subjectIndex, questionIndex, answer",
				});
			}

			const result = await examAttemptService.submitAnswer(
				attemptId,
				userId,
				subjectIndex,
				questionIndex,
				answer,
				timeSpent
			);

			res.status(200).json({
				success: true,
				message: "Answer submitted successfully",
				data: result,
			});
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

    async submitAllAnswers(req, res) {
        try {
            const { attemptId } = req.params;
            const { subjectIndex, answers } = req.body; // answers will be an array
            const userId = req.user.id;

            if (subjectIndex === undefined || !Array.isArray(answers)) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: subjectIndex, and answers array",
                });
            }

            const result = await examAttemptService.submitAllAnswers(
                attemptId,
                userId,
                subjectIndex,
                answers
            );

            res.status(200).json({
                success: true,
                message: "All answers submitted successfully",
                data: result,
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

	async completeSubject(req, res) {
		try {
			const { attemptId } = req.params;
			const { subjectIndex } = req.body;
			const userId = req.user.id;

			if (subjectIndex === undefined) {
				return res.status(400).json({
					success: false,
					message: "Missing required field: subjectIndex",
				});
			}

			const result = await examAttemptService.completeSubject(
				attemptId,
				userId,
				subjectIndex
			);

			res.status(200).json({
				success: true,
				message: "Subject completed successfully",
				data: result,
			});
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async submitExam(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;

			const result = await examAttemptService.submitExam(attemptId, userId);

			res.status(200).json({
				success: true,
				message: "Exam submitted successfully",
				data: result,
			});
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async getExamResults(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;

			const results = await examAttemptService.getExamResults(attemptId, userId);

			res.status(200).json({ success: true, data: results });
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async getUserAttempts(req, res) {
		try {
			const userId = req.user.id;
			const attempts = await examAttemptService.getUserAttempts(userId);
			res.status(200).json({ success: true, data: attempts });
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async syncTime(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;
			const timeInfo = await examAttemptService.syncTime(attemptId, userId);
			res.status(200).json({ success: true, data: timeInfo });
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async getCurrentExamQuestions(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;

			const attempt = await examAttemptService.getAttemptStatus(attemptId, userId);
			if (!attempt || attempt.status !== "in_progress") {
				return res.status(400).json({
					success: false,
					message: "No active exam attempt found",
				});
			}

			const exam = await require("../models/ExamModel").findById(attempt.exam.examId);
			if (!exam) {
				return res.status(404).json({ success: false, message: "Exam not found" });
			}

			const currentSubject = exam.subjects[attempt.currentSubject];
			if (!currentSubject) {
				return res.status(400).json({ success: false, message: "No current subject found" });
			}

			const questionsForUser = currentSubject.questions.map((q) => ({
				type: q.type,
				text: q.text,
				options: q.options,
				marks: q.marks,
				solution: q.solution,
			}));

			res.status(200).json({
				success: true,
				data: {
					attemptId: attempt.attemptId,
					currentSubject: attempt.currentSubject,
					subjectTitle: currentSubject.title,
					timeRemaining: attempt.timeRemaining,
					questions: questionsForUser,
					totalQuestions: currentSubject.questions.length,
				},
			});
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}

	async getAttemptProgress(req, res) {
		try {
			const { attemptId } = req.params;
			const userId = req.user.id;

			const attempt = await examAttemptService.getAttemptStatus(attemptId, userId);
			if (!attempt) {
				return res.status(404).json({ success: false, message: "Attempt not found" });
			}

			const examAttempt = await require("../models/ExamAttemptModel")
				.findOne({ _id: attemptId, userId })
				.populate("examId", "title description subjects");

			if (!examAttempt) {
				return res.status(404).json({ success: false, message: "Attempt not found" });
			}

			const progress = {
				attemptId: examAttempt._id,
				exam: examAttempt.examId,
				status: examAttempt.status,
				startTime: examAttempt.startTime,
				currentSubject: attempt.currentSubject,
				timeRemaining: attempt.timeRemaining,
				subjects: examAttempt.subjectAttempts.map((subject, index) => ({
					index: subject.subjectIndex,
					title: examAttempt.examId.subjects[index]?.title || `Subject ${index + 1}`,
					isCompleted: subject.isCompleted,
					timeLimitMin: subject.timeLimitMin,
					answeredQuestions: subject.answers.length,
					totalQuestions: examAttempt.examId.subjects[index]?.questions.length || 0,
				})),
			};

			res.status(200).json({ success: true, data: progress });
		} catch (error) {
			res.status(400).json({ success: false, message: error.message });
		}
	}
}

module.exports = new ExamAttemptController();
