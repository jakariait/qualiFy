import React, { useState } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const API_BASE = `${import.meta.env.VITE_API_URL}/resources`;

const FreeResourceUpload = ({ token , onUploadSuccess}) => {
  const [form, setForm] = useState({
    name: "",
    universityName: "",
    resourcePdf: null,
    resourceThumbnailImage: null,
    thumbnailImage: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageInfo, setMessageInfo] = useState({
    open: false,
    severity: "info",
    message: "",
  });
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const universities = ["NSU", "BRAC", "IUB", "AIUB", "EWU"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "resourceThumbnailImage") {
        setThumbnailPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      universityName: "",
      resourcePdf: null,
      resourceThumbnailImage: null,
      thumbnailImage: null,
    });
    setThumbnailPreview(null);
    setFileInputKey(Date.now());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("universityName", form.universityName);
      formData.append("resourcePdf", form.resourcePdf);
      formData.append("resourceThumbnailImage", form.resourceThumbnailImage);

      const res = await axios.post(API_BASE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessageInfo({
        open: true,
        severity: "success",
        message: res.data.message || "Resource uploaded successfully!",
      });
      resetForm();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Error uploading resource:", error);
      setMessageInfo({
        open: true,
        severity: "error",
        message:
          error.response?.data?.message ||
          "Failed to upload resource. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setMessageInfo((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="shadow rounded-lg p-3 max-w-lg mx-auto">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Add Free Resource
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full bg-gray-100 px-3 py-2 rounded"
        />

        <select
          name="universityName"
          value={form.universityName}
          onChange={handleChange}
          required
          className="w-full bg-gray-100 px-3 py-2 rounded"
        >
          <option value="">Select University</option>
          {universities.map((uni) => (
            <option key={uni} value={uni}>
              {uni}
            </option>
          ))}
        </select>

        {/* PDF Upload */}
        <div>
          <label className="block mb-1 font-medium">Resource PDF</label>
          <input
            key={`pdf-${fileInputKey}`}
            type="file"
            name="resourcePdf"
            accept="application/pdf"
            onChange={handleChange}
            required
          />
        </div>

        {/* Thumbnail Upload with Preview */}
        <div>
          <label className="block mb-1 font-medium">Thumbnail Image</label>

          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          ) : (
            form.thumbnailImage && (
              <img
                src={`${import.meta.env.VITE_API_URL.replace(
                  "/api",
                  "",
                )}/uploads/${form.thumbnailImage}`}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )
          )}

          <input
            key={`thumb-${fileInputKey}`}
            type="file"
            name="resourceThumbnailImage"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full primaryBgColor cursor-pointer accentTextColor py-2 rounded "
        >
          {loading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>

      <Snackbar
        open={messageInfo.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={messageInfo.severity}
          sx={{ width: "100%" }}
        >
          {messageInfo.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FreeResourceUpload;
