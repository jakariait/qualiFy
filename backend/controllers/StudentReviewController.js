const StudentReviewService = require("../services/StudentReviewService");

const createStudentReview = async (req, res) => {
  try {
    if (!req.files || !req.files.imgSrc) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const fileName = req.files.imgSrc[0].filename; // Store only file name
    const carousel = await StudentReviewService.createStudentReview(fileName);

    res.status(201).json(carousel);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const getAllStudentReview = async (req, res) => {
  try {
    const carousels = await StudentReviewService.getAllStudentReview();
    return res.status(200).json(carousels);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteByIdStudentReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCarousel = await StudentReviewService.deleteStudentReview(id);
    if (!deletedCarousel) {
      return res.status(404).json({ message: "Student Review not found" });
    }
    return res.status(200).json({ message: "Student Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudentReview,
  getAllStudentReview,
  deleteByIdStudentReview,
};
