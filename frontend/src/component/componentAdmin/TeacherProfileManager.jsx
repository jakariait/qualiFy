import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AuthAdminStore from "../../store/AuthAdminStore.js";

const API_BASE = import.meta.env.VITE_API_URL + "/teacher";

const TeacherProfilesCRUD = () => {

  const { token } = AuthAdminStore();


  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [form, setForm] = useState({
    name: "",
    title: "",
    bio: "",
    teacherUniversity: "",
    teachersImg: "", // existing filename string
    imageFile: null, // new image file
  });

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      if (res.data.success) setTeachers(res.data.data);
      else setError("Failed to fetch teachers");
    } catch (err) {
      setError(err.message || "Error fetching teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Open dialogs
  const openAddDialog = () => {
    setEditingTeacher(null);
    setForm({
      name: "",
      title: "",
      bio: "",
      teacherUniversity: "",
      teachersImg: "",
      imageFile: null,
    });
    setOpenDialog(true);
  };

  const openEditDialog = (teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name || "",
      title: teacher.title || "",
      bio: teacher.bio || "",
      teacherUniversity: teacher.teacherUniversity || "",
      teachersImg: teacher.teachersImg || "",
      imageFile: null,
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setForm((f) => ({ ...f, imageFile: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Save teacher: POST or PUT with multipart/form-data
  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("title", form.title);
      formData.append("bio", form.bio);
      formData.append("teacherUniversity", form.teacherUniversity);

      // If new image file selected, append it, else don't (backend can keep old image)
      if (form.imageFile) {
        formData.append("teachersImg", form.imageFile);
      }

      let res;
      if (editingTeacher) {
        res = await axios.put(`${API_BASE}/${editingTeacher._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

      } else {
        res = await axios.post(API_BASE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

      }

      if (res.data.success) {
        setOpenDialog(false);
        fetchTeachers();
      } else {
        alert("Failed to save teacher: " + res.data.message);
      }
    } catch (err) {
      alert(
        "Error saving teacher: " + (err.response?.data?.message || err.message),
      );
    }
  };

  // Delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeachers();
    } catch (err) {
      alert(
        "Error deleting teacher: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold ">
        Instructor Profiles
      </h1>
      <button
        onClick={openAddDialog}
        className="mb-4 px-4 py-2 primaryBgColor accentTextColor cursor-pointer rounded hover:bg-blue-700"
      >
        Add New Teacher
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4 grid gap-4 grid-cols-2">
        {teachers.map((t) => (
          <div
            key={t._id}
            className="flex items-center justify-between shadow rounded p-3"
          >
            <div className="flex items-center gap-4">
              {t.teachersImg && (
                <img
                  src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${t.teachersImg}`}
                  alt={t.name}
                  className="w-16 h-16 object-cover rounded-full border"
                />
              )}
              <div>
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-sm">{t.title}</p>
                <p className="text-sm italic">{t.teacherUniversity}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEditDialog(t)}
                className="px-3 py-1 bg-green-600 text-white cursor-pointer rounded hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(t._id)}
                className="px-3 py-1 bg-red-600 text-white cursor-pointer rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <span>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</span>
          <IconButton onClick={() => setOpenDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="University"
            name="teacherUniversity"
            value={form.teacherUniversity}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />

          <div className="mt-4">
            <label className="block mb-1 font-semibold">Profile Image</label>
            {form.teachersImg && !form.imageFile && (
              <img
                src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${form.teachersImg}`}
                alt="Current"
                className="w-24 h-24 object-cover rounded mb-2"
              />
            )}
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingTeacher ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherProfilesCRUD;
