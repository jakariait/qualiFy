import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Editor } from "primereact/editor";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const API_URL = `${import.meta.env.VITE_API_URL}/notices`;

const NoticeManager = () => {
  const { token } = useAuthAdminStore();
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // ✅ Fetch Notices
  const fetchNotices = async () => {
    try {
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotices();
    }
  }, [token]);

  // ✅ Add Notice
  const addNotice = async () => {
    if (!newNotice.trim()) return;
    try {
      await axios.post(
        API_URL,
        { description: newNotice },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewNotice("");
      fetchNotices();
    } catch (error) {
      console.error("Error adding notice", error);
    }
  };

  // ✅ Update Notice
  const updateNotice = async (id) => {
    try {
      await axios.put(
        `${API_URL}/${id}`,
        { description: editText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditId(null);
      setEditText("");
      fetchNotices();
    } catch (error) {
      console.error("Error updating notice", error);
    }
  };

  // ✅ Delete Notice
  const deleteNotice = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice", error);
    }
  };

  // ✅ Toggle Active Status
  const toggleActive = async (id, isActive) => {
    try {
      await axios.put(
        `${API_URL}/${id}`,
        { isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotices();
    } catch (error) {
      console.error("Error toggling active status", error);
    }
  };

  return (
    <div className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Notice For All Users
      </h1>

      {/* Add New Notice */}
      <div className="mb-8 p-4  rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 primaryTextColor">
          Add New Notice
        </h2>
        <Editor
          value={newNotice}
          onTextChange={(e) => setNewNotice(e.htmlValue)}
          style={{ height: "220px" }}
          placeholder="Enter new notice..."
          theme="snow"
        />
        <div className="flex justify-center mt-4">
          <button
            onClick={addNotice}
            className="primaryBgColor accentTextColor cursor-pointer font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Add Notice
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
          Current Notices
        </h1>
        {notices.map((notice) => (
          <div
            key={notice._id}
            className="p-4  rounded-lg shadow-sm bg-gray-50"
          >
            {editId === notice._id ? (
              <div className="flex flex-col items-center gap-4">
                <Editor
                  value={editText}
                  onTextChange={(e) => setEditText(e.htmlValue)}
                  style={{ height: "180px", width: "100%" }}
                  theme="snow"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => updateNotice(notice._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition cursor-pointer duration-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition cursor-pointer duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-full p-2 rounded ${
                    notice.isActive ? "bg-white" : "bg-gray-200 text-gray-500"
                  }`}
                  dangerouslySetInnerHTML={{ __html: notice.description }}
                />
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => toggleActive(notice._id, notice.isActive)}
                    className={`p-2 rounded-full cursor-pointer transition duration-300 ${
                      notice.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {notice.isActive ? (
                      <CheckCircle size={22} />
                    ) : (
                      <XCircle size={22} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditId(notice._id);
                      setEditText(notice.description);
                    }}
                    className="p-2 rounded-full cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 transition duration-300"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => deleteNotice(notice._id)}
                    className="p-2 rounded-full cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 transition duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeManager;