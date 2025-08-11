const FreeResourceModel = require("../models/FreeResourceModel");

// Create a new free resource
const createFreeResource = async (data) => {
  const resource = new FreeResourceModel(data);
  return await resource.save();
};

// Get all free resources
const getAllFreeResources = async () => {
  return await FreeResourceModel.find();
};

// Get free resource by ID
const getFreeResourceById = async (id) => {
  const resource = await FreeResourceModel.findById(id);
  if (!resource) {
    throw new Error("Free resource not found");
  }
  return resource;
};

// Update free resource
const updateFreeResource = async (id, data) => {
  const updatedResource = await FreeResourceModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!updatedResource) {
    throw new Error("Free resource not found");
  }
  return updatedResource;
};

// Delete free resource
const deleteFreeResource = async (id) => {
  const deletedResource = await FreeResourceModel.findByIdAndDelete(id);
  if (!deletedResource) {
    throw new Error("Free resource not found");
  }
  return deletedResource;
};

module.exports = {
  createFreeResource,
  getAllFreeResources,
  getFreeResourceById,
  updateFreeResource,
  deleteFreeResource,
};
