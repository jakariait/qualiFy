const mongoose = require("mongoose");

const RetakePermissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

RetakePermissionSchema.index({ examId: 1, userId: 1 });

module.exports = mongoose.model("RetakePermission", RetakePermissionSchema);