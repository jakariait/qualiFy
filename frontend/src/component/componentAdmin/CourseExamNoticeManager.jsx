import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { Trash2, Eye, Plus, Pencil } from "lucide-react";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const API_URL = "http://localhost:5050/api";

const CourseExamNoticeManager = () => {
  const { token } = useAuthAdminStore();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [editingNotice, setEditingNotice] = useState(null); // { _id, description }
  const [updatedNoticeText, setUpdatedNoticeText] = useState("");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
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
    } catch (err) {
      console.error("Error adding notice:", err);
    }
  };

  // Delete a notice
  const handleDeleteNotice = async (id) => {
    try {
      await axios.delete(`${API_URL}/course-exam-notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotices(selectedProductId);
    } catch (err) {
      console.error("Error deleting notice:", err);
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
    } catch (err) {
      console.error("Error updating notice:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">All Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded p-4 space-y-2 shadow"
          >
            <div className="font-semibold">
              {product.name || "Unnamed Product"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotices(product._id)}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <Eye size={16} /> View Notices
              </button>
              <button
                onClick={() => setSelectedProductId(product._id)}
                className="text-green-600 hover:underline flex items-center gap-1"
              >
                <Plus size={16} /> Add Notice
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProductId && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">
            Notices for selected product
          </h3>
          <div className="space-y-4">
            {notices.length === 0 && <p>No notices found.</p>}
            {notices.map((notice) => (
              <div key={notice._id} className="border p-4 rounded space-y-2">
                {editingNotice && editingNotice._id === notice._id ? (
                  // Editing UI
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={updatedNoticeText}
                      onChange={(e) => setUpdatedNoticeText(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                      rows="4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateNotice}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
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
                        className="text-blue-600"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <input
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                placeholder="Enter notice HTML"
                className="border rounded px-3 py-2 w-full"
              />
              <button
                onClick={handleAddNotice}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseExamNoticeManager;
