const FreeClass = require("../models/FreeClassModel");

async function createFreeClass(data) {
  const freeClass = new FreeClass(data);
  return await freeClass.save();
}

async function getAllFreeClasses() {
  return await FreeClass.find().sort({ createdAt: -1 });
}

async function getFreeClassById(id) {
  return await FreeClass.findById(id);
}

async function updateFreeClass(id, data) {
  return await FreeClass.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function deleteFreeClass(id) {
  return await FreeClass.findByIdAndDelete(id);
}

module.exports = {
  createFreeClass,
  getAllFreeClasses,
  getFreeClassById,
  updateFreeClass,
  deleteFreeClass,
};
