const prebookService = require("../services/prebookService");

exports.createPrebook = async (req, res) => {
  try {
    const prebook = await prebookService.createPrebook(req.body);
    res.status(201).json({
      success: true,
      message: "Prebook created successfully",
      data: prebook,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllPrebooks = async (req, res) => {
  try {
    const { prebooks, count } = await prebookService.getAllPrebooks();
    res.status(200).json({
      success: true,
      count: count,
      data: prebooks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrebookById = async (req, res) => {
  try {
    const prebook = await prebookService.getPrebookById(req.params.id);
    if (!prebook) {
      return res
        .status(404)
        .json({ success: false, message: "Prebook not found" });
    }
    res.status(200).json({ success: true, data: prebook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrebooksByUser = async (req, res) => {
  try {
    const { prebooks, count } = await prebookService.getPrebooksByUser(
      req.params.userId
    );
    res.status(200).json({
      success: true,
      count: count,
      data: prebooks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrebooksByProductId = async (req, res) => {
  try {
    const { prebooks, count } = await prebookService.getPrebooksByProductId(
      req.params.productId
    );
    res.status(200).json({
      success: true,
      count: count,
      data: prebooks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrebookCountByProductId = async (req, res) => {
  try {
    const count = await prebookService.countPrebooksByProductId(
      req.params.productId
    );
    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePrebook = async (req, res) => {
  try {
    const updated = await prebookService.updatePrebook(
      req.params.id,
      req.body
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Prebook not found" });
    }
    res.status(200).json({
      success: true,
      message: "Prebook updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePrebook = async (req, res) => {
  try {
    const deleted = await prebookService.deletePrebook(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Prebook not found" });
    }
    res.status(200).json({ success: true, message: "Prebook deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
