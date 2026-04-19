const Exam = require("../models/ExamModel");

const createExam = async (data) => {
  const exam = new Exam(data);
  await exam.save();
  return exam;
};

const getAllExams = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [exams, total] = await Promise.all([
    Exam.find().select("-subjects").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Exam.countDocuments(),
  ]);
  return { exams, total, page, limit, totalPages: Math.ceil(total / limit) };
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
  })
    .select("-subjects")
    .sort({ createdAt: -1 });
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
