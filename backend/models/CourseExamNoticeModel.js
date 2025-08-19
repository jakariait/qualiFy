const mongoose = require("mongoose");

const courseExamNoticeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // or "Course"/"Exam" depending on your collection
    required: true
  },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CourseExamNotice", courseExamNoticeSchema);
