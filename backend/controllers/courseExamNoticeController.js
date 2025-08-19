const courseExamNoticeService = require("../services/courseExamNoticeService");

exports.createNotice = async (req, res) => {
  try {
    const notice = await courseExamNoticeService.createNotice(req.body);
    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllNotices = async (req, res) => {
  try {
    const notices = await courseExamNoticeService.getAllNotices();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const notice = await courseExamNoticeService.getNoticeById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNoticeByProductId = async (req, res) => {
  try {
    const notices = await courseExamNoticeService.getNoticeByProductId(
      req.params.productId,
    );
    if (!notices || notices.length === 0) {
      return res.status(404).json({ message: "No notices found for this product" });
    }
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const notice = await courseExamNoticeService.updateNotice(req.params.id, req.body);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const notice = await courseExamNoticeService.deleteNotice(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
