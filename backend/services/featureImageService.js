const FeatureImageModel = require("../models/FeatureImageModel");

// Create a new feature image
const createFeatureImage = async (title, imgSrc, link = "") => {
  return await FeatureImageModel.create({ title, imgSrc, link });
};

// Get all feature images
const getAllFeatureImages = async () => {
  return await FeatureImageModel.find().select("-createdAt -updatedAt");
};

// Get a single feature image by ID
const getFeatureImageById = async (id) => {
  const featureImage = await FeatureImageModel.findById(id);
  if (!featureImage) {
    throw new Error("Feature image not found");
  }
  return featureImage;
};

// Update a feature image
const updateFeatureImage = async (id, title, imgSrc, link) => {
  // Prepare the update data
  const updateData = {};

  if (title) {
    updateData.title = title;
  }
  if (imgSrc) {
    updateData.imgSrc = imgSrc; // Store only the filename
  }
  if (link !== undefined) {
    updateData.link = link;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No data provided for update");
  }

  const updatedFeatureImage = await FeatureImageModel.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedFeatureImage) {
    throw new Error("Feature image not found");
  }

  return updatedFeatureImage;
};

// Delete a feature image
const deleteFeatureImage = async (id) => {
  const deletedFeatureImage = await FeatureImageModel.findByIdAndDelete(id);
  if (!deletedFeatureImage) {
    throw new Error("Feature image not found");
  }
  return deletedFeatureImage;
};

module.exports = {
  createFeatureImage,
  getAllFeatureImages,
  getFeatureImageById,
  updateFeatureImage,
  deleteFeatureImage,
};
