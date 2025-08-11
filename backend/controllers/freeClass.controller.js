const freeClassService = require("../services/freeClass.service");

async function createFreeClass(req, res) {
  try {
    const { youtubeUrl } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ success: false, error: "youtubeUrl is required" });
    }
    const freeClass = await freeClassService.createFreeClass({ youtubeUrl });
    res.status(201).json({ success: true, data: freeClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getAllFreeClasses(req, res) {
  try {
    const freeClasses = await freeClassService.getAllFreeClasses();
    res.json({ success: true, data: freeClasses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getFreeClassById(req, res) {
  try {
    const freeClass = await freeClassService.getFreeClassById(req.params.id);
    if (!freeClass) {
      return res.status(404).json({ success: false, error: "FreeClass not found" });
    }
    res.json({ success: true, data: freeClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateFreeClass(req, res) {
  try {
    const updated = await freeClassService.updateFreeClass(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "FreeClass not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteFreeClass(req, res) {
  try {
    const deleted = await freeClassService.deleteFreeClass(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "FreeClass not found" });
    }
    res.json({ success: true, message: "FreeClass deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createFreeClass,
  getAllFreeClasses,
  getFreeClassById,
  updateFreeClass,
  deleteFreeClass,
};
