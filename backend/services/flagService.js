const FlagModel = require("../models/FlagModel");

// Create a new flag
const createFlag = async (data) => {
  return await FlagModel.create(data);
};


// Get all flags
const getAllFlags = async () => {
  return await FlagModel.find();
};

// Get a flag by ID
const getFlagById = async (id) => {
  return await FlagModel.findById(id);
};

// Update a flag by ID
const updateFlag = async (id, data) => {
  return await FlagModel.findByIdAndUpdate(id, data, { new: true });
};

// Delete a flag by ID
const deleteFlag = async (id) => {
  return await FlagModel.findByIdAndDelete(id);
};

module.exports = {
  createFlag,
  getAllFlags,
  getFlagById,
  updateFlag,
  deleteFlag,
};
