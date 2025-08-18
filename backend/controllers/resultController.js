const Result = require("../models/Result");
const ExamAttempt = require("../models/ExamAttemptModel");
const Exam = require("../models/ExamModel");
const resultService = require("../services/resultService");

class ResultController {
  // Get all results for a specific exam
  async getResultsByExamId(req, res) {
    try {
      const { examId } = req.params;
      const results = await resultService.getResultsByExamId(examId);
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all results for admin review
  async getAllResults(req, res) {
    try {
      const { page = 1, limit = 10, status, examId } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (examId) filter.examId = examId;

      const results = await Result.find(filter)
        .populate("userId", "name email fullName")
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
        .populate("userId", "name email fullName")
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
          q.questionIndex === questionIndex && q.subjectIndex === subjectIndex,
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

  // Update marks for a question
  async updateMarks(req, res) {
    try {
      const { resultId } = req.params;
      const { questionIndex, subjectIndex, marksObtained } = req.body;
      const adminId = req.admin.id;

      if (
        questionIndex === undefined ||
        subjectIndex === undefined ||
        marksObtained === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
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
          q.questionIndex === questionIndex && q.subjectIndex === subjectIndex,
      );

      if (!questionResult) {
        return res.status(404).json({
          success: false,
          message: "Question not found in result",
        });
      }

      // Update question result
      questionResult.marksObtained = Number(marksObtained);
      questionResult.isCorrect = Number(marksObtained) > 0;
      questionResult.reviewedBy = adminId;
      questionResult.reviewedAt = new Date();

      // Recalculate total marks
      result.obtainedMarks = result.questionResults.reduce(
        (acc, cur) => acc + (cur.marksObtained || 0),
        0,
      );
      result.percentage = (result.obtainedMarks / result.totalMarks) * 100;

      const pendingReviewCount = result.questionResults.filter(
        (q) => q.isCorrect === null,
      ).length;
      result.pendingReviewCount = pendingReviewCount;

      await result.save();

      await result.populate([
        { path: "userId", select: "name email fullName" },
        { path: "examId", select: "title description subjects" },
        {
          path: "attemptId",
          select: "startTime endTime status totalDuration",
        },
      ]);

      res.status(200).json({
        success: true,
        message: "Marks updated successfully",
        data: result,
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
        (q) => q.isCorrect === null,
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

  // Get result by userId and examId
  async getResultByUserAndExam(req, res) {
    try {
      const { userId, examId } = req.params;

      if (!userId || !examId) {
        return res.status(400).json({
          success: false,
          message: "Missing userId or examId",
        });
      }

      const result = await Result.findOne({ userId, examId })
        .populate("userId", "name email fullName")
        .populate("examId", "title description subjects")
        .populate("attemptId", "startTime endTime status totalDuration");

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Result not found for this user and exam",
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
}

module.exports = new ResultController();
