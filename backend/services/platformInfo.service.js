const PlatformInfo = require("../models/PlatformInfoModel");

async function getPlatformInfo() {
  return await PlatformInfo.findOne({});
}

async function updatePlatformInfo(data, file) {
  if (file) {
    data.platformThumbnail = file.filename; // Save the filename in DB
  }

  return await PlatformInfo.findOneAndUpdate(
    {},
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
}

module.exports = {
  getPlatformInfo,
  updatePlatformInfo,
};
