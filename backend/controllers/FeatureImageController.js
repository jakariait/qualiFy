const featureImageService = require("../services/featureImageService");

// Controller for creating a feature image
const createFeatureImage = async (req, res) => {
  try {
    const { title, link } = req.body;

    if (!req.files || !req.files.imgSrc) {
      throw new Error("Image file is required");
    }

    const imgSrc = req.files.imgSrc[0].filename;

    const newFeatureImage = await featureImageService.createFeatureImage(
      title,
      imgSrc,
      link
    );

    res.status(201).json({
      success: true,
      message: "Feature image created successfully",
      data: newFeatureImage,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller for getting all feature images
const getAllFeatureImages = async (req, res) => {
  try {
    const featureImages = await featureImageService.getAllFeatureImages();
    res.status(200).json({
      success: true,
      message: "Feature images retrieved successfully",
      data: featureImages,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller for getting a feature image by ID
const getFeatureImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const featureImage = await featureImageService.getFeatureImageById(id);

    res.status(200).json({
      success: true,
      message: "Feature image retrieved successfully",
      data: featureImage,
    });
  } catch (error) {
    if (error.message === "Feature image not found") {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

// Controller for updating a feature image
const updateFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link } = req.body;
    let imgSrc = req.body.imgSrc;

    // If a new file is uploaded, overwrite imgSrc with filename
    if (req.files && req.files.imgSrc) {
      imgSrc = req.files.imgSrc[0].filename;
    }

    const updatedFeatureImage = await featureImageService.updateFeatureImage(
      id,
      title,
      imgSrc,
      link
    );

    res.status(200).json({
      success: true,
      message: "Feature image updated successfully",
      data: updatedFeatureImage,
    });
  } catch (error) {
    if (
      error.message === "Feature image not found" ||
      error.message === "No data provided for update"
    ) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Controller for deleting a feature image
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await featureImageService.deleteFeatureImage(id);

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "Feature image not found") {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = {
  createFeatureImage,
  getAllFeatureImages,
  getFeatureImageById,
  updateFeatureImage,
  deleteFeatureImage,
};
