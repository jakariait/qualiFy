const Result = require("../models/Result");
const ExamAttempt = require("../models/ExamAttemptModel");
const Exam = require("../models/ExamModel");

class ResultController {
	// Get all results for admin review
	async getAllResults(req, res) {
		try {
			const { page = 1, limit = 10, status, examId } = req.query;

			const filter = {};
			if (status) filter.status = status;
			if (examId) filter.examId = examId;

			const results = await Result.find(filter)
				.populate("userId", "name email")
				.populate("examId", "title description")
				.populate("attemptId", "startTime endTime status")
				.sort({ createdAt: -1 })
				.limit(limit * 1)
				.skip((page - 1) * limit);

			const total = await Result.countDocuments(filter);

			res.status(200).json({
				success: true,
				data: {
					results,
					totalPages: Math.ceil(total / limit),
					currentPage: page,
					total,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Get specific result for review
	async getResultById(req, res) {
		try {
			const { resultId } = req.params;

			const result = await Result.findById(resultId)
				.populate("userId", "name email")
				.populate("examId", "title description subjects")
				.populate("attemptId", "startTime endTime status totalDuration");

			if (!result) {
				return res.status(404).json({
					success: false,
					message: "Result not found",
				});
			}

			res.status(200).json({
				success: true,
				data: result,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Review and grade a question
	async reviewQuestion(req, res) {
		try {
			const { resultId } = req.params;
			const {
				questionIndex,
				subjectIndex,
				isCorrect,
				marksObtained,
				adminFeedback,
			} = req.body;
			const adminId = req.admin.id;

			if (questionIndex === undefined || subjectIndex === undefined) {
				return res.status(400).json({
					success: false,
					message: "Missing required fields: questionIndex, subjectIndex",
				});
			}

			const result = await Result.findById(resultId);
			if (!result) {
				return res.status(404).json({
					success: false,
					message: "Result not found",
				});
			}

			const questionResult = result.questionResults.find(
				(q) =>
					q.questionIndex === questionIndex && q.subjectIndex === subjectIndex
			);

			if (!questionResult) {
				return res.status(404).json({
					success: false,
					message: "Question not found in result",
				});
			}

			// Update question result
			questionResult.isCorrect = isCorrect;
			questionResult.marksObtained =
				marksObtained || (isCorrect ? questionResult.maxMarks : 0);
			questionResult.adminFeedback = adminFeedback || "";
			questionResult.reviewedBy = adminId;
			questionResult.reviewedAt = new Date();

			await result.save();

			res.status(200).json({
				success: true,
				message: "Question reviewed successfully",
				data: {
					questionIndex,
					subjectIndex,
					isCorrect,
					marksObtained: questionResult.marksObtained,
					adminFeedback: questionResult.adminFeedback,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Review multiple questions at once
	async reviewMultipleQuestions(req, res) {
		try {
			const { resultId } = req.params;
			const { reviews } = req.body; // Array of { questionIndex, subjectIndex, isCorrect, marksObtained, adminFeedback }
			const adminId = req.admin.id;

			if (!Array.isArray(reviews) || reviews.length === 0) {
				return res.status(400).json({
					success: false,
					message: "Reviews array is required",
				});
			}

			const result = await Result.findById(resultId);
			if (!result) {
				return res.status(404).json({
					success: false,
					message: "Result not found",
				});
			}

			const updatedQuestions = [];

			for (const review of reviews) {
				const {
					questionIndex,
					subjectIndex,
					isCorrect,
					marksObtained,
					adminFeedback,
				} = review;

				const questionResult = result.questionResults.find(
					(q) =>
						q.questionIndex === questionIndex && q.subjectIndex === subjectIndex
				);

				if (questionResult) {
					questionResult.isCorrect = isCorrect;
					questionResult.marksObtained =
						marksObtained || (isCorrect ? questionResult.maxMarks : 0);
					questionResult.adminFeedback = adminFeedback || "";
					questionResult.reviewedBy = adminId;
					questionResult.reviewedAt = new Date();

					updatedQuestions.push({
						questionIndex,
						subjectIndex,
						isCorrect,
						marksObtained: questionResult.marksObtained,
					});
				}
			}

			await result.save();

			res.status(200).json({
				success: true,
				message: `${updatedQuestions.length} questions reviewed successfully`,
				data: updatedQuestions,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Finalize result (mark as complete)
	async finalizeResult(req, res) {
		try {
			const { resultId } = req.params;
			const adminId = req.admin.id;

			const result = await Result.findById(resultId);
			if (!result) {
				return res.status(404).json({
					success: false,
					message: "Result not found",
				});
			}

			// Check if all questions are reviewed
			const unreviewedQuestions = result.questionResults.filter(
				(q) => q.isCorrect === null
			);
			if (unreviewedQuestions.length > 0) {
				return res.status(400).json({
					success: false,
					message: `Cannot finalize: ${unreviewedQuestions.length} questions still need review`,
				});
			}

			result.status = "finalized";
			result.finalizedAt = new Date();
			result.finalizedBy = adminId;

			await result.save();

			res.status(200).json({
				success: true,
				message: "Result finalized successfully",
				data: {
					resultId: result._id,
					status: result.status,
					finalizedAt: result.finalizedAt,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Get pending review questions for a result
	async getPendingReviewQuestions(req, res) {
		try {
			const { resultId } = req.params;

			const result = await Result.findById(resultId).populate(
				"examId",
				"title description subjects"
			);

			if (!result) {
				return res.status(404).json({
					success: false,
					message: "Result not found",
				});
			}

			const pendingQuestions = result.questionResults
				.filter((q) => q.isCorrect === null)
				.map((q) => ({
					questionIndex: q.questionIndex,
					subjectIndex: q.subjectIndex,
					questionType: q.questionType,
					questionText: q.questionText,
					userAnswer: q.userAnswer,
					correctAnswer: q.correctAnswer,
					maxMarks: q.maxMarks,
					timeSpent: q.timeSpent,
				}));

			res.status(200).json({
				success: true,
				data: {
					resultId: result._id,
					exam: result.examId,
					pendingQuestions,
					totalPending: pendingQuestions.length,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Get result statistics
	async getResultStatistics(req, res) {
		try {
			const { examId } = req.query;

			const filter = {};
			if (examId) filter.examId = examId;

			const stats = await Result.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: null,
						totalResults: { $sum: 1 },
						avgPercentage: { $avg: "$percentage" },
						avgMarks: { $avg: "$obtainedMarks" },
						totalMarks: { $sum: "$totalMarks" },
						totalObtainedMarks: { $sum: "$obtainedMarks" },
						pendingReview: {
							$sum: {
								$cond: [{ $eq: ["$status", "pending_manual_review"] }, 1, 0],
							},
						},
						finalized: {
							$sum: { $cond: [{ $eq: ["$status", "finalized"] }, 1, 0] },
						},
					},
				},
			]);

			const mcqStats = await Result.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: null,
						totalMCQ: { $sum: "$mcqTotalCount" },
						correctMCQ: { $sum: "$mcqCorrectCount" },
						wrongMCQ: { $sum: "$mcqWrongCount" },
					},
				},
			]);

			const result = {
				overall: stats[0] || {
					totalResults: 0,
					avgPercentage: 0,
					avgMarks: 0,
					totalMarks: 0,
					totalObtainedMarks: 0,
					pendingReview: 0,
					finalized: 0,
				},
				mcq: mcqStats[0] || {
					totalMCQ: 0,
					correctMCQ: 0,
					wrongMCQ: 0,
				},
			};

			// Calculate percentages
			if (result.overall.totalResults > 0) {
				result.overall.avgPercentage =
					Math.round(result.overall.avgPercentage * 100) / 100;
				result.overall.avgMarks =
					Math.round(result.overall.avgMarks * 100) / 100;
			}

			if (result.mcq.totalMCQ > 0) {
				result.mcq.accuracyPercentage =
					Math.round(
						(result.mcq.correctMCQ / result.mcq.totalMCQ) * 100 * 100
					) / 100;
			}

			res.status(200).json({
				success: true,
				data: result,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}

	// Export results to CSV
	async exportResults(req, res) {
		try {
			const { examId } = req.query;

			const filter = {};
			if (examId) filter.examId = examId;

			const results = await Result.find(filter)
				.populate("userId", "name email")
				.populate("examId", "title")
				.populate("attemptId", "startTime endTime totalDuration");

			// Create CSV data
			const csvData = results.map((result) => ({
				"Student Name": result.userId?.name || "N/A",
				"Student Email": result.userId?.email || "N/A",
				"Exam Title": result.examId?.title || "N/A",
				"Total Marks": result.totalMarks,
				"Obtained Marks": result.obtainedMarks,
				Percentage: result.percentage,
				Status: result.status,
				"MCQ Correct": result.mcqCorrectCount,
				"MCQ Wrong": result.mcqWrongCount,
				"Pending Review": result.pendingReviewCount,
				"Start Time": result.attemptId?.startTime,
				"End Time": result.attemptId?.endTime,
				"Duration (seconds)": result.attemptId?.totalDuration,
			}));

			res.status(200).json({
				success: true,
				data: csvData,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	}
}

module.exports = new ResultController();
