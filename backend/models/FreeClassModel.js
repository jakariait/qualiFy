const mongoose = require("mongoose");

const FreeClassSchema = new mongoose.Schema(
  {
    youtubeUrl: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FreeClass", FreeClassSchema);
