const CourseExamNotice = require("../models/CourseExamNoticeModel");

exports.createNotice = async (noticeData) => {
  const notice = new CourseExamNotice(noticeData);
  return await notice.save();
};

exports.getAllNotices = async () => {
  return await CourseExamNotice.find();
};

exports.getNoticeById = async (id) => {
  return await CourseExamNotice.findById(id);
};

exports.getNoticeByProductId = async (productId) => {
  return await CourseExamNotice.find({ productId: productId });
};

exports.updateNotice = async (id, noticeData) => {
  return await CourseExamNotice.findByIdAndUpdate(id, noticeData, { new: true });
};

exports.deleteNotice = async (id) => {
  return await CourseExamNotice.findByIdAndDelete(id);
};
