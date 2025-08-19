import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { Trash2, Eye, Plus, Pencil } from "lucide-react";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import { Editor } from "primereact/editor";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

const CourseExamNoticeManager = () => {
  const { token } = useAuthAdminStore();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [editingNotice, setEditingNotice] = useState(null); // { _id, description }
  const [updatedNoticeText, setUpdatedNoticeText] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allProducts = res.data.data || [];
        const filteredProducts = allProducts.filter(
          (product) => product.type !== "book",
        );
        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setSnackbar({
          open: true,
          message: "Failed to fetch products.",
          severity: "error",
        });
      }
    };
    fetchProducts();
  }, [token]);

  // Fetch notices for a product
  const fetchNotices = async (productId) => {
    try {
      setSelectedProductId(productId);
      const res = await axios.get(
        `${API_URL}/admin/course-exam-notices/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotices(res.data || []);
    } catch (err) {
      console.error("Error fetching notices:", err);
      setNotices([]); // Clear notices on error
      setSnackbar({
        open: true,
        message: "Failed to fetch notices.",
        severity: "error",
      });
    }
  };

  // Add a notice
  const handleAddNotice = async () => {
    if (!newNotice.trim() || !selectedProductId) return;
    try {
      await axios.post(
        `${API_URL}/course-exam-notices`,
        {
          productId: selectedProductId,
          description: newNotice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewNotice("");
      fetchNotices(selectedProductId);
      setSnackbar({
        open: true,
        message: "Notice added successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error adding notice:", err);
      setSnackbar({
        open: true,
        message: "Failed to add notice.",
        severity: "error",
      });
    }
  };

  // Delete a notice
  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return;
    try {
      await axios.delete(`${API_URL}/course-exam-notices/${noticeToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotices(selectedProductId);
      setSnackbar({
        open: true,
        message: "Notice deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting notice:", err);
      setSnackbar({
        open: true,
        message: "Failed to delete notice.",
        severity: "error",
      });
    } finally {
      setDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  // Edit a notice
  const handleEditClick = (notice) => {
    setEditingNotice(notice);
    setUpdatedNoticeText(notice.description);
  };

  const handleCancelEdit = () => {
    setEditingNotice(null);
    setUpdatedNoticeText("");
  };

  const handleUpdateNotice = async () => {
    if (!updatedNoticeText.trim() || !editingNotice) return;
    try {
      await axios.put(
        `${API_URL}/course-exam-notices/${editingNotice._id}`,
        {
          description: updatedNoticeText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEditingNotice(null);
      setUpdatedNoticeText("");
      fetchNotices(selectedProductId);
      setSnackbar({
        open: true,
        message: "Notice updated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating notice:", err);
      setSnackbar({
        open: true,
        message: "Failed to update notice.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteClick = (id) => {
    setNoticeToDelete(id);
    setDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setNoticeToDelete(null);
  };

  return (
    <div className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Notice For Course and Exam
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product._id} className="p-4 rounded space-y-2 shadow">
            <div className="font-semibold">
              {product.name || "Unnamed Product"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotices(product._id)}
                className="primaryBgColor accentTextColor cursor-pointer px-4 py-2  rounded flex items-center gap-1"
              >
                View And Add Notices
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedProductId && (
        <div className="mt-8">
          <h3 className="text-lg primaryTextColor font-bold mb-2">
            Notices for{" "}
            {products.find((p) => p._id === selectedProductId)?.name}
          </h3>
          <div className="space-y-4">
            {notices.length === 0 && <p>No notices found.</p>}
            {notices.map((notice) => (
              <div key={notice._id} className="shadow p-4 rounded space-y-2">
                {editingNotice && editingNotice._id === notice._id ? (
                  // Editing UI
                  <div className="flex flex-col gap-2">
                    <Editor
                      value={updatedNoticeText}
                      onTextChange={(e) => setUpdatedNoticeText(e.htmlValue)}
                      style={{ height: "260px", marginBottom: "1rem" }}
                      theme="snow"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateNotice}
                        className="primaryBgColor accentTextColor cursor-pointer px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-400 cursor-pointer text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display UI
                  <div className="flex justify-between items-start">
                    <div
                      className="text-sm text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(notice.description),
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(notice)}
                        className="text-blue-600 cursor-pointer"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(notice._id)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 items-stretch">
              <Editor
                value={newNotice}
                onTextChange={(e) => setNewNotice(e.htmlValue)}
                style={{ height: "260px", marginBottom: "1rem" }}
                theme="snow"
              />
              <button
                onClick={handleAddNotice}
                className="primaryBgColor accentTextColor px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={dialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this notice? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteNotice} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CourseExamNoticeManager;
