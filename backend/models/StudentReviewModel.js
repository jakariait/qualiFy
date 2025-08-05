const mongoose = require("mongoose");

const DataSchema = mongoose.Schema(
  {
    imgSrc: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const StudentReviewModel = mongoose.model("StudentReview", DataSchema);

module.exports = StudentReviewModel;
