const Prebook = require("../models/PrebookModel");

exports.createPrebook = async (data) => {
  const { userId, productId } = data;
  const existingPrebook = await Prebook.findOne({ userId, productId });
  if (existingPrebook) {
    throw new Error("Only one pre-book allowed per user per product.");
  }
  return Prebook.create(data);
};

exports.getAllPrebooks = async () => {
  const [prebooks, count] = await Promise.all([
    Prebook.find()
      .populate("productId", "name type thumbnailImage slug")
      .populate("userId")
      .sort({ createdAt: -1 }),
    Prebook.countDocuments(),
  ]);
  return { prebooks, count };
};

exports.getPrebookById = async (id) => {
  return Prebook.findById(id)
    .populate("productId", "name type thumbnailImage slug")
    .populate("userId");
};

exports.getPrebooksByUser = async (userId) => {
  const [prebooks, count] = await Promise.all([
    Prebook.find({ userId })
      .populate("productId", "name type thumbnailImage slug")
      .sort({ createdAt: -1 }),
    Prebook.countDocuments({ userId }),
  ]);
  return { prebooks, count };
};

exports.getPrebooksByProductId = async (productId) => {
  const [prebooks, count] = await Promise.all([
    Prebook.find({ productId })
      .populate("productId", "name type thumbnailImage slug")
      .populate("userId")
      .sort({ createdAt: -1 }),
    Prebook.countDocuments({ productId }),
  ]);
  return { prebooks, count };
};

exports.updatePrebook = async (id, data) => {
  return Prebook.findByIdAndUpdate(id, data, { new: true });
};

exports.deletePrebook = async (id) => {
  return Prebook.findByIdAndDelete(id);
};
