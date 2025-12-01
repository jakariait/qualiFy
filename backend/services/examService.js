const Exam = require("../models/ExamModel");

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
  const exam = await Exam.findById(id);
  if (!exam) {
    return null;
  }

  // Update exam properties based on data
  // This will trigger the pre('save') hook when exam.save() is called
  Object.assign(exam, data);

  await exam.save();
  return exam;
};

const deleteExam = async (id) => {
  return Exam.findByIdAndDelete(id);
};

const getExamsByProductId = async (productId) => {
  return Exam.find({
    productIds: productId,
    status: "published",
  }).sort({ createdAt: -1 });
};

const getFreeExams = async () => {
  return Exam.find({ isFree: true, status: "published" })
    .select("-subjects")
    .sort({
      createdAt: -1,
    });
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getExamsByProductId,
  getFreeExams,
};
