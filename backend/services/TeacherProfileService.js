const TeacherProfile = require("../models/TeacherProfileModel");

// Create
async function createTeacherProfile(data) {
  return TeacherProfile.create(data);
}

// Read all
async function getAllTeacherProfiles() {
  return TeacherProfile.find().sort({ createdAt: -1 });
}

// Read one by ID
async function getTeacherProfileById(id) {
  return TeacherProfile.findById(id);
}

// Update
async function updateTeacherProfile(id, data) {
  return TeacherProfile.findByIdAndUpdate(id, data, { new: true });
}

// Delete
async function deleteTeacherProfile(id) {
  return TeacherProfile.findByIdAndDelete(id);
}

module.exports = {
  createTeacherProfile,
  getAllTeacherProfiles,
  getTeacherProfileById,
  updateTeacherProfile,
  deleteTeacherProfile
};
