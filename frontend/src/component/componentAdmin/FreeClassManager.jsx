import React, { useEffect, useState } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const API_BASE = import.meta.env.VITE_API_URL;

const FreeClassManager = () => {
  const { token } = useAuthAdminStore();

  const [freeClasses, setFreeClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [newUrl, setNewUrl] = useState("");
  const [editId, setEditId] = useState(null);
  const [editUrl, setEditUrl] = useState("");

  // Fetch all free classes on mount
  const fetchFreeClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/freeclass`);
      if (res.data.success) {
        setFreeClasses(res.data.data);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to fetch data",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeClasses();
  }, []);

  // Show snackbar
  const showMessage = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // Add new free class
  const handleAdd = async () => {
    if (!newUrl.trim()) {
      showMessage("Please enter a YouTube URL", "warning");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/freeclass`,
        { youtubeUrl: newUrl.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`, // pass your token here
          },
        },
      );

      if (res.data.success) {
        setFreeClasses((prev) => [res.data.data, ...prev]);
        setNewUrl("");
        showMessage("Free class added successfully", "success");
      } else {
        showMessage("Failed to add free class", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    }
  };

  // Delete free class
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/freeclass/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setFreeClasses((prev) => prev.filter((item) => item._id !== id));
        showMessage("Free class deleted successfully", "success");
      } else {
        showMessage("Failed to delete free class", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    }
  };

  // Start editing
  const startEdit = (id, url) => {
    setEditId(id);
    setEditUrl(url);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditUrl("");
  };

  // Save edit
  const saveEdit = async (id) => {
    if (!editUrl.trim()) {
      showMessage("URL cannot be empty", "warning");
      return;
    }
    try {
      const res = await axios.put(
        `${API_BASE}/freeclass/${id}`,
        {
          youtubeUrl: editUrl.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setFreeClasses((prev) =>
          prev.map((item) => (item._id === id ? res.data.data : item)),
        );
        cancelEdit();
        showMessage("Free class updated successfully", "success");
      } else {
        showMessage("Failed to update free class", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    }
  };

  return (
    <div className="p-4 shadow-lg rounded-lg  mx-auto space-y-4">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold ">
        Free Classes Manager
      </h1>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-grow bg-gray-50 px-3 py-2 focus:outline-none rounded"
        />
        <button
          onClick={handleAdd}
          className="primaryBgColor cursor-pointer accentTextColor px-4 rounded "
        >
          Add
        </button>
      </div>

      {/* Loading */}
      {loading && <div>Loading...</div>}

      {/* List */}
      {!loading && freeClasses.length === 0 && (
        <div>No free classes found.</div>
      )}

      <ul className="space-y-4">
        {freeClasses.map(({ _id, youtubeUrl }) => (
          <li
            key={_id}
            className="bg-gray-50 p-3 rounded flex items-center justify-between"
          >
            {editId === _id ? (
              <>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="flex-grow focus:outline-none px-2 py-1 rounded mr-2"
                />
                <button
                  onClick={() => saveEdit(_id)}
                  className="text-green-600 cursor-pointer mr-2 "
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-gray-600 cursor-pointer "
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all flex-grow"
                >
                  {youtubeUrl}
                </a>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(_id, youtubeUrl)}
                    className="text-yellow-600 cursor-pointer "
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(_id)}
                    className="text-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FreeClassManager;
