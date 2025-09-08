const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notice", noticeSchema);
