const mongoose = require("mongoose");

const TeacherProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    teachersImg:{
      type: String
    },
    teacherUniversity:{
      type: String
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("TeacherProfile", TeacherProfileSchema);
