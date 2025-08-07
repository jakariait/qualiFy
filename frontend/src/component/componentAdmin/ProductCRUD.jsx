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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Upload } from "lucide-react";

import ModulesEditor from "./ModulesEditor";

const API_BASE = import.meta.env.VITE_API_URL + "/products";

const ProductCRUD = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "book",
    longDesc: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    finalPrice: "",
    finalDiscount: 0,
    finalStock: 0,
    author: "",
    publisher: "",
    instructors: [],
    lessons: "",
    enrolledStudents: "",
    duration: "",
    quizzes: "",
    classStartDate: "",
    thumbnailImage: "",
    previewPdf: "",
    thumbnailFile: null,
    previewPdfFile: null,
  });

  const [modules, setModules] = useState([]);

  // State for showing preview of uploaded thumbnail image
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      if (res.data.success) setProducts(res.data.data);
      else setError("Failed to fetch products");
    } catch (err) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update thumbnail preview when thumbnailFile changes
    if (form.thumbnailFile) {
      const objectUrl = URL.createObjectURL(form.thumbnailFile);
      setThumbnailPreview(objectUrl);

      // Cleanup memory when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setThumbnailPreview("");
    }
  }, [form.thumbnailFile]);

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      type: "book",
      longDesc: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      finalPrice: "",
      finalDiscount: 0,
      finalStock: 0,
      author: "",
      publisher: "",
      instructors: [],
      lessons: "",
      enrolledStudents: "",
      duration: "",
      quizzes: "",
      classStartDate: "",
      thumbnailImage: "",
      previewPdf: "",
      thumbnailFile: null,
      previewPdfFile: null,
    });
    setModules([]);
    setOpenDialog(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      type: product.type || "book",
      longDesc: product.longDesc || "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      metaKeywords: product.metaKeywords?.join(", ") || "",
      finalPrice: product.finalPrice || "",
      finalDiscount: product.finalDiscount || 0,
      finalStock: product.finalStock || 0,
      author: product.author || "",
      publisher: product.publisher || "",
      instructors: product.instructors?.map((i) => i._id || i).join(", ") || "",
      lessons: product.lessons || "",
      enrolledStudents: product.enrolledStudents || "",
      duration: product.duration || "",
      quizzes: product.quizzes || "",
      classStartDate: product.classStartDate || "",
      thumbnailImage: product.thumbnailImage || "",
      previewPdf: product.previewPdf || "",
      thumbnailFile: null,
      previewPdfFile: null,
    });
    setModules(
      product.modules?.map((mod) => ({
        subject: mod.subject || "",
        lessons:
          mod.lessons?.map((lesson) => ({
            title: lesson.title || "",
            duration: lesson.duration || "",
            courseThumbnail: lesson.courseThumbnail || "",
            courseThumbnailFile: null,
          })) || [],
      })) || [],
    );
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "thumbnailFile") {
      setForm((f) => ({ ...f, thumbnailFile: files[0] }));
    } else if (name === "previewPdfFile") {
      setForm((f) => ({ ...f, previewPdfFile: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("type", form.type);
      formData.append("longDesc", form.longDesc);
      formData.append("metaTitle", form.metaTitle);
      formData.append("metaDescription", form.metaDescription);
      formData.append(
        "metaKeywords",
        JSON.stringify(form.metaKeywords.split(",").map((k) => k.trim())),
      );
      formData.append("finalPrice", form.finalPrice);
      formData.append("finalDiscount", form.finalDiscount);
      formData.append("finalStock", form.finalStock);
      formData.append("author", form.author);
      formData.append("publisher", form.publisher);
      formData.append(
        "instructors",
        JSON.stringify(form.instructors.split(",").map((i) => i.trim())),
      );
      formData.append("lessons", form.lessons);
      formData.append("enrolledStudents", form.enrolledStudents);
      formData.append("duration", form.duration);
      formData.append("quizzes", form.quizzes);
      formData.append("classStartDate", form.classStartDate);

      formData.append(
        "modules",
        JSON.stringify(
          modules.map((mod) => ({
            subject: mod.subject,
            lessons: mod.lessons.map(({ title, duration }) => ({
              title,
              duration,
            })),
          })),
        ),
      );

      modules.forEach((mod, mIdx) => {
        mod.lessons.forEach((lesson, lIdx) => {
          if (lesson.courseThumbnailFile) {
            formData.append(
              `lessonImage-${mIdx}-${lIdx}`,
              lesson.courseThumbnailFile,
            );
          }
        });
      });

      if (form.thumbnailFile) {
        formData.append("thumbnailImage", form.thumbnailFile);
      }
      if (form.previewPdfFile) {
        formData.append("previewPdf", form.previewPdfFile);
      }

      let res;
      if (editingProduct) {
        res = await axios.put(`${API_BASE}/${editingProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(API_BASE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        setOpenDialog(false);
        fetchProducts();
      } else {
        alert("Failed to save product: " + res.data.message);
      }
    } catch (err) {
      alert(
        "Error saving product: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchProducts();
    } catch (err) {
      alert(
        "Error deleting product: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Products and Service
      </h1>
      <button
        onClick={openAddDialog}
        className="mb-4 px-4 py-2 primaryBgColor accentTextColor cursor-pointer rounded"
      >
        Add New Product & Service
      </button>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {products.map((p) => (
          <div
            key={p._id}
            className="shadow rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {p.thumbnailImage && (
                <img
                  src={`${import.meta.env.VITE_API_URL.replace(
                    "/api",
                    "",
                  )}/uploads/${p.thumbnailImage}`}
                  alt={p.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p>Type: {p.type}</p>
                <p>Price: {p.finalPrice} BDT</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => openEditDialog(p)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <span>
            {editingProduct
              ? "Edit Product & Service"
              : "Add New Product & Service"}
          </span>
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
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="book">Book</MenuItem>
              <MenuItem value="course">Course</MenuItem>
              <MenuItem value="exam">Exam</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Long Description"
            name="longDesc"
            value={form.longDesc}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />

          <TextField
            label="Meta Title"
            name="metaTitle"
            value={form.metaTitle}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Meta Description"
            name="metaDescription"
            value={form.metaDescription}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
          <TextField
            label="Meta Keywords (comma separated)"
            name="metaKeywords"
            value={form.metaKeywords}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Final Price"
            name="finalPrice"
            value={form.finalPrice}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Final Discount"
            name="finalDiscount"
            value={form.finalDiscount}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />

          {form.type === "book" && (
            <TextField
              label="Final Stock"
              name="finalStock"
              value={form.finalStock}
              onChange={handleChange}
              type="number"
              fullWidth
              margin="normal"
              required
            />
          )}

          {form.type === "book" && (
            <>
              <TextField
                label="Author"
                name="author"
                value={form.author}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Publisher"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Preview PDF</label>
                {form.previewPdf && !form.previewPdfFile && (
                  <a
                    href={`${import.meta.env.VITE_API_URL.replace(
                      "/api",
                      "",
                    )}/uploads/${form.previewPdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Current Preview PDF
                  </a>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  name="previewPdfFile"
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Thumbnail Image upload with preview */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Thumbnail Image</label>

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

            <label className="cursor-pointer inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow select-none">
              <Upload size={18} className="mr-2" />
              Upload Thumbnail
              <input
                type="file"
                accept="image/*"
                name="thumbnailFile"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {form.type === "course" && (
            <>
              <TextField
                label="Lessons"
                name="lessons"
                value={form.lessons}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Enrolled Students"
                name="enrolledStudents"
                value={form.enrolledStudents}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Quizzes"
                name="quizzes"
                value={form.quizzes}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Class Start Date"
                name="classStartDate"
                value={form.classStartDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              {/* Modules Editor Component */}
              <ModulesEditor modules={modules} setModules={setModules} />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductCRUD;
