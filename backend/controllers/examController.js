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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { exams, total, totalPages } = await examService.getAllExams(page, limit);
    const examsWithoutSubjects = exams.map((exam) => {
      const { subjects, ...examData } = exam.toObject ? exam.toObject() : exam;
      return examData;
    });
    res.status(200).json({
      message: "Exams retrieved successfully",
      exams: examsWithoutSubjects,
      total,
      page,
      limit,
      totalPages,
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
    const options = {
      subjectsPage: parseInt(req.query.subjectsPage) || 1,
      subjectsLimit: parseInt(req.query.subjectsLimit) || 3,
      questionsPage: parseInt(req.query.questionsPage) || 1,
      questionsLimit: parseInt(req.query.questionsLimit) || 10,
    };
    const exam = await examService.getExamById(req.params.id, options);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ message: "Exam retrieved successfully", exam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch exam", error: error.message });
  }
});

// Get more subjects for exam
const getMoreSubjects = asyncHandler(async (req, res) => {
  try {
    const options = {
      subjectsPage: parseInt(req.query.subjectsPage) || 1,
      subjectsLimit: parseInt(req.query.subjectsLimit) || 3,
      questionsPage: parseInt(req.query.questionsPage) || 1,
      questionsLimit: parseInt(req.query.questionsLimit) || 10,
    };
    const subjects = await examService.getSubjectsByExamId(
      req.params.id,
      options.subjectsPage,
      options.subjectsLimit,
      options.questionsPage,
      options.questionsLimit
    );
    res.status(200).json({ message: "Subjects retrieved successfully", subjects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects", error: error.message });
  }
});

// Get more questions for a subject
const getSubjectQuestions = asyncHandler(async (req, res) => {
  try {
    const subjectIndex = parseInt(req.query.subjectIndex) || 0;
    const questionsPage = parseInt(req.query.questionsPage) || 1;
    const questionsLimit = parseInt(req.query.questionsLimit) || 10;
    
    const result = await examService.getSubjectQuestions(
      req.params.id,
      subjectIndex,
      questionsPage,
      questionsLimit
    );
    if (!result) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json({ message: "Questions retrieved successfully", ...result });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { exams, total, totalPages } = await examService.getExamsByProductId(
      req.params.productId,
      page,
      limit,
    );
    res.status(200).json({
      message: "Exams retrieved successfully",
      exams,
      total,
      page,
      limit,
      totalPages,
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
  getMoreSubjects,
  getSubjectQuestions,
  updateExam,
  deleteExam,
  getExamsByProductId,
  getFreeExams,
};
