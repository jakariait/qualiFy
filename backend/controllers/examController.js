const asyncHandler = require("express-async-handler");
const examService = require("../services/examService");

// Create exam
const createExam = asyncHandler(async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create exam", error: error.message });
  }
});

// Get all exams
const getAllExams = asyncHandler(async (req, res) => {
  try {
    const exams = await examService.getAllExams();
    const examsWithoutSubjects = exams.map((exam) => {
      const { subjects, ...examData } = exam.toObject ? exam.toObject() : exam;
      return examData;
    });
    res.status(200).json({
      message: "Exams retrieved successfully",
      exams: examsWithoutSubjects,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch exams", error: error.message });
  }
});

// Get exam by ID
const getExamById = asyncHandler(async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ message: "Exam retrieved successfully", exam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch exam", error: error.message });
  }
});

// Update exam
const updateExam = asyncHandler(async (req, res) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ message: "Exam updated successfully", exam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update exam", error: error.message });
  }
});

// Delete exam
const deleteExam = asyncHandler(async (req, res) => {
  try {
    const exam = await examService.deleteExam(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete exam", error: error.message });
  }
});

// Get exams by product ID
const getExamsByProductId = asyncHandler(async (req, res) => {
  try {
    const exams = await examService.getExamsByProductId(req.params.productId);
    const examsWithoutSubjects = exams.map((exam) => {
      const { subjects, ...examData } = exam.toObject ? exam.toObject() : exam;
      return examData;
    });
    res.status(200).json({
      message: "Exams retrieved successfully",
      exams: examsWithoutSubjects,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch exams", error: error.message });
  }
});

const getFreeExams = asyncHandler(async (req, res) => {
  try {
    const exams = await examService.getFreeExams();
    res
      .status(200)
      .json({ message: "Free exams retrieved successfully", exams });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch free exams", error: error.message });
  }
});

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getExamsByProductId,
  getFreeExams,
};
