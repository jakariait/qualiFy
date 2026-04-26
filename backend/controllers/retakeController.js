const RetakePermission = require("../models/RetakePermissionModel");

class RetakeController {
  // Grant retake permission to a user for an exam
  async grantRetake(req, res) {
    try {
      const { examId, userId } = req.body;
      if (!examId || !userId) {
        return res.status(400).json({ success: false, message: "examId and userId are required." });
      }

      const existing = await RetakePermission.findOne({ examId, userId, used: false });
      if (existing) {
        return res.status(400).json({ success: false, message: "Retake permission already granted for this user." });
      }

      const permission = await RetakePermission.create({
        examId,
        userId,
        grantedBy: req.admin?.id,
      });

      res.status(201).json({ success: true, message: "Retake permission granted.", data: permission });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Revoke an unused retake permission
  async revokeRetake(req, res) {
    try {
      const { permissionId } = req.params;
      const permission = await RetakePermission.findByIdAndDelete(permissionId);
      if (!permission) {
        return res.status(404).json({ success: false, message: "Permission not found." });
      }
      res.status(200).json({ success: true, message: "Retake permission revoked." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // List retake permissions for an exam (admin)
  async getRetakePermissions(req, res) {
    try {
      const { examId } = req.params;
      const permissions = await RetakePermission.find({ examId })
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get unused retake permissions for the current user (user-facing)
  async getUserRetakePermissions(req, res) {
    try {
      const userId = req.user.id;
      const permissions = await RetakePermission.find({ userId, used: false })
        .select("examId")
        .lean();
      // Return as a set of examIds the user can retake
      const retakeExamIds = permissions.map((p) => String(p.examId));
      res.status(200).json({ success: true, data: retakeExamIds });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RetakeController();