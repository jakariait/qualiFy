const teacherProfileService = require("../services/TeacherProfileService");

// Create
async function create(req, res) {
  try {
    let payload = { ...req.body };

    // Require teachersImg file on create
    if (req.files && req.files.teachersImg && req.files.teachersImg.length > 0) {
      payload.teachersImg = req.files.teachersImg[0].filename;
    } else {
      return res.status(400).json({
        success: false,
        message: "Teacher image (teachersImg) file is required for creation",
      });
    }

    const teacher = await teacherProfileService.createTeacherProfile(payload);
    res.status(201).json({
      success: true,
      message: "Teacher profile created successfully",
      data: teacher,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `Failed to create teacher profile: ${err.message}`,
    });
  }
}

// Get all
async function getAll(req, res) {
  try {
    const teachers = await teacherProfileService.getAllTeacherProfiles();
    res.status(200).json({
      success: true,
      message: teachers.length
        ? "Teacher profiles retrieved successfully"
        : "No teacher profiles found",
      data: teachers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error fetching teacher profiles: ${err.message}`,
    });
  }
}

// Get one
async function getById(req, res) {
  try {
    const teacher = await teacherProfileService.getTeacherProfileById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `Teacher profile with ID ${req.params.id} not found`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Teacher profile retrieved successfully",
      data: teacher,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error retrieving teacher profile: ${err.message}`,
    });
  }
}

// Update
async function update(req, res) {
  try {
    let payload = { ...req.body };

    // Replace teachersImg if a new one is uploaded
    if (req.files && req.files.teachersImg && req.files.teachersImg.length > 0) {
      payload.teachersImg = req.files.teachersImg[0].filename;
    }

    const teacher = await teacherProfileService.updateTeacherProfile(req.params.id, payload);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `Teacher profile with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully",
      data: teacher,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `Failed to update teacher profile: ${err.message}`,
    });
  }
}

// Delete
async function remove(req, res) {
  try {
    const teacher = await teacherProfileService.deleteTeacherProfile(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `Teacher profile with ID ${req.params.id} not found`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Teacher profile deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to delete teacher profile: ${err.message}`,
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
