const StudentReviewModel = require("../models/StudentReviewModel");

// Create Carousel

const createStudentReview = async (imgSrc) => {
  return await StudentReviewModel.create({ imgSrc });
};

// Get All Carousel

const getAllStudentReview = async () => {
  return await StudentReviewModel.find();
};

// Delete Carousel

const deleteStudentReview = async (id) => {
  return await StudentReviewModel.findByIdAndDelete(id);
};

module.exports = {
  createStudentReview,
  getAllStudentReview,
  deleteStudentReview,
};
