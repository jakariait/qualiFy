import React, { useState, useEffect } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const API_BASE = import.meta.env.VITE_API_URL;

const PlatformInfoUpdate = () => {
  const { token } = useAuthAdminStore();

  const [formData, setFormData] = useState({
    mainTitle: "",
    subTitle: "",
    description: "",
    students: "",
    successRate: "",
    courses: "",
    trustedBy: [],
  });
  const [platformThumbnailPreview, setPlatformThumbnailPreview] = useState(null);
  const [platformThumbnailFile, setPlatformThumbnailFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // Snackbar state for messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success", // success | error | info | warning
    message: "",
  });

  // Fetch platform info on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/platform`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setFormData({
            mainTitle: data.mainTitle || "",
            subTitle: data.subTitle || "",
            description: data.description || "",
            students: data.students || "",
            successRate: data.successRate || "",
            courses: data.courses || "",
            trustedBy: Array.isArray(data.trustedBy) && data.trustedBy.length > 0 ? data.trustedBy : [],
          });
          if (data.platformThumbnail) {
            setPlatformThumbnailPreview(
              `${API_BASE.replace("/api", "")}/uploads/${data.platformThumbnail}`
            );
          }
        }
      })
      .catch(() => {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to fetch platform info.",
        });
      });
  }, []);

  // Generic input change for text inputs
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Change handler for trustedBy array inputs
  const handleTrustedByChange = (index, value) => {
    const updatedTrustedBy = [...formData.trustedBy];
    updatedTrustedBy[index] = value;
    setFormData((prev) => ({ ...prev, trustedBy: updatedTrustedBy }));
  };

  // Add new trustedBy input field
  const addTrustedBy = () => {
    setFormData((prev) => ({
      ...prev,
      trustedBy: [...prev.trustedBy, ""],
    }));
  };

  // Remove trustedBy input field by index
  const removeTrustedBy = (index) => {
    setFormData((prev) => {
      const updated = [...prev.trustedBy];
      updated.splice(index, 1);
      return { ...prev, trustedBy: updated };
    });
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlatformThumbnailFile(file);
      setPlatformThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler - sends form data with image and trustedBy array
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all fields except trustedBy normally
      Object.entries(formData).forEach(([key, val]) => {
        if (key === "trustedBy") {
          val.forEach((item) => data.append("trustedBy[]", item));
        } else {
          data.append(key, val);
        }
      });

      // Append image file if selected
      if (platformThumbnailFile) {
        data.append("platformThumbnail", platformThumbnailFile);
      }

      const res = await axios.put(`${API_BASE}/platform`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setSnackbar({
          open: true,
          severity: "success",
          message: "Platform info updated successfully.",
        });
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to update platform info.",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="p-4 shadow rounded-lg max-w-4xl mx-auto">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Update Platform Info
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Main Title</label>
          <input
            name="mainTitle"
            type="text"
            required
            value={formData.mainTitle}
            onChange={handleChange}
            className="w-full bg-gray-100 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Sub Title</label>
          <input
            name="subTitle"
            type="text"
            required
            value={formData.subTitle}
            onChange={handleChange}
            className="w-full bg-gray-100 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-100 rounded px-3 py-2 resize-y"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Students</label>
            <input
              name="students"
              type="text"
              required
              value={formData.students}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Success Rate</label>
            <input
              name="successRate"
              type="text"
              required
              value={formData.successRate}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Courses</label>
            <input
              name="courses"
              type="text"
              required
              value={formData.courses}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Platform Thumbnail */}
        <div>
          <label className="block font-semibold mb-1">Platform Thumbnail</label>
          {platformThumbnailPreview && (
            <img
              src={platformThumbnailPreview}
              alt="Platform Thumbnail"
              className="mb-3 max-h-40 object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
          />
        </div>

        {/* Trusted By - dynamic inputs */}
        <div>
          <label className="block font-semibold mb-1">Trusted By</label>
          <div className="space-y-2">
            {formData.trustedBy.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleTrustedByChange(index, e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2"
                  placeholder={`Trusted By #${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeTrustedBy(index)}
                  className="text-red-600 font-bold px-2"
                  aria-label={`Remove trusted by #${index + 1}`}
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTrustedBy}
              className="mt-2 primaryBgColor accentTextColor px-4 py-1 rounded"
            >
              + Add Trusted By
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={loading}
            className="primaryBgColor cursor-pointer accentTextColor px-3 py-3 rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PlatformInfoUpdate;
