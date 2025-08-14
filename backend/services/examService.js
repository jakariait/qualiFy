const Exam = require('../models/ExamModel');

const createExam = async (data) => {
  const exam = new Exam(data);
  await exam.save();
  return exam;
};

const getAllExams = async () => {
  return Exam.find().sort({ createdAt: -1 });
};

const getExamById = async (id) => {
  return Exam.findById(id);
};

const updateExam = async (id, data) => {
  return Exam.findByIdAndUpdate(id, data, { new: true });
};

const deleteExam = async (id) => {
  return Exam.findByIdAndDelete(id);
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
};
