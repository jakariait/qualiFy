const Notice = require("../models/NoticeModel");

// ✅ Create Notice
const createNotice = async (data) => {
  const notice = new Notice(data);
  return await notice.save();
};

// ✅ Get All Notices
const getAllNotices = async () => {
  return await Notice.find().sort({ createdAt: -1 });
};

// ✅ Get Notice By ID
const getNoticeById = async (id) => {
  return await Notice.findById(id);
};

// ✅ Update Notice
const updateNotice = async (id, data) => {
  return await Notice.findByIdAndUpdate(id, data, { new: true });
};

// ✅ Delete Notice
const deleteNotice = async (id) => {
  return await Notice.findByIdAndDelete(id);
};

// ✅ Get Only Active Notices
const getActiveNotices = async () => {
  return await Notice.find({ isActive: true }).sort({ createdAt: -1 });
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getActiveNotices,
};
