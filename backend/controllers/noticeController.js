const noticeService = require("../services/noticeService");

const createNotice = async (req, res) => {
  try {
    const notice = await noticeService.createNotice(req.body);
    res.status(201).json({ message: "Notice created successfully", notice });
  } catch (error) {
    res.status(500).json({ message: "Error creating notice", error: error.message });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const notices = await noticeService.getAllNotices();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const notice = await noticeService.getNoticeById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notice", error: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await noticeService.updateNotice(req.params.id, req.body);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice updated successfully", notice });
  } catch (error) {
    res.status(500).json({ message: "Error updating notice", error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await noticeService.deleteNotice(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notice", error: error.message });
  }
};

const getActiveNotices = async (req, res) => {
  try {
    const notices = await noticeService.getActiveNotices();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active notices", error: error.message });
  }
};

// ✅ Export all as module.exports
module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getActiveNotices,
};
