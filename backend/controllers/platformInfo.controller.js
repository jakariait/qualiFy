const platformInfoService = require("../services/platformInfo.service");

async function getPlatformInfo(req, res) {
  try {
    const info = await platformInfoService.getPlatformInfo();
    if (!info) {
      return res.status(404).json({ success: false, error: "No platform info found" });
    }
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updatePlatformInfo(req, res) {
  try {
    const data = req.body;

    // Capture file like previewPdf example
    if (req.files?.platformThumbnail) {
      data.platformThumbnail = req.files.platformThumbnail[0].filename;
    }

    const updatedInfo = await platformInfoService.updatePlatformInfo(data);
    res.json({ success: true, data: updatedInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


module.exports = {
  getPlatformInfo,
  updatePlatformInfo,
};
