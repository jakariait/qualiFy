const freeResourceService = require("../services/freeResourceService");

// Create a new free resource
const createFreeResource = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files?.resourcePdf) {
      data.resourcePdf = req.files.resourcePdf[0].filename;
    }
    if (req.files?.resourceThumbnailImage) {
      data.resourceThumbnailImage = req.files.resourceThumbnailImage[0].filename;
    }

    const newResource = await freeResourceService.createFreeResource(data);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: newResource,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all free resources
const getAllFreeResources = async (req, res) => {
  try {
    const resources = await freeResourceService.getAllFreeResources();

    if (!resources || resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No free resources found.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Free resources retrieved successfully.",
      data: resources,
    });
  } catch (error) {
    console.error("Error fetching free resources:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch free resources. Please try again later.",
      error: error.message,
    });
  }
};
// Get free resource by ID
const getFreeResourceById = async (req, res) => {
  try {
    const resource = await freeResourceService.getFreeResourceById(req.params.id);
    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Update free resource
const updateFreeResource = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files?.resourcePdf) {
      data.resourcePdf = req.files.resourcePdf[0].filename;
    }
    if (req.files?.resourceThumbnailImage) {
      data.resourceThumbnailImage = req.files.resourceThumbnailImage[0].filename;
    }

    const updatedResource = await freeResourceService.updateFreeResource(req.params.id, data);

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updatedResource,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete free resource
const deleteFreeResource = async (req, res) => {
  try {
    await freeResourceService.deleteFreeResource(req.params.id);
    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFreeResource,
  getAllFreeResources,
  getFreeResourceById,
  updateFreeResource,
  deleteFreeResource,
};
