const mongoose = require("mongoose");

const PlatformInfoSchema = new mongoose.Schema(
  {
    mainTitle: { type: String, required: true },
    subTitle: { type: String, required: true },
    description: { type: String, required: true },

    students: { type: String, required: true },
    successRate: { type: String, required: true },
    courses: { type: String, required: true },

    platformThumbnail: { type: String, required: true },

    trustedBy: [
      { type: String, required: true },
    ],
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("PlatformInfo", PlatformInfoSchema);
