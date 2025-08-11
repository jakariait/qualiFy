const mongoose = require("mongoose");

const FreeResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    resourcePdf: { type: String, required: true },
    resourceThumbnailImage: { type: String },
    universityName: {
      type: String,
      enum: ["NSU", "BRAC", "IUB", "AIUB", "EWU"],
      required: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FreeResourceModel = mongoose.model("FreeResource", FreeResourceSchema);

module.exports = FreeResourceModel;
