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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Upload, Eye, Pencil, Trash2 } from "lucide-react";

import ModulesEditor from "./ModulesEditor";
import { Editor } from "primereact/editor";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const API_BASE = import.meta.env.VITE_API_URL + "/products";
const API_TEACHERS = import.meta.env.VITE_API_URL + "/teacher";

const ProductCRUD = () => {
  const { token } = useAuthAdminStore();

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
    instructors: [], // array of instructor IDs
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

  console.table(form);

  const [modules, setModules] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Instructors fetched from API
  const [instructorsList, setInstructorsList] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [instructorsError, setInstructorsError] = useState(null);

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

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const res = await axios.get(API_TEACHERS);
      if (res.data.success) {
        // Assuming API returns array of instructors with _id and name
        setInstructorsList(res.data.data);
      } else {
        setInstructorsError("Failed to fetch instructors");
      }
    } catch (err) {
      setInstructorsError(err.message || "Error fetching instructors");
    } finally {
      setLoadingInstructors(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (form.thumbnailFile) {
      const objectUrl = URL.createObjectURL(form.thumbnailFile);
      setThumbnailPreview(objectUrl);
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
      // If product.instructors is array of objects with _id, map to ids
      instructors: product.instructors
        ? product.instructors.map((i) => i._id || i)
        : [],
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

  const handleInstructorChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      instructors: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleEditorChange = (e) => {
    setForm((f) => ({ ...f, longDesc: e.htmlValue }));
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
      formData.append("instructors", JSON.stringify(form.instructors));
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

      // Append all courseThumbnail files under key 'courseThumbnails'
      modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          if (lesson.courseThumbnailFile) {
            formData.append("courseThumbnails", lesson.courseThumbnailFile);
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
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
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
      await axios.delete(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your actual token variable
        },
      });
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
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              {/* View Button */}
              <button
                onClick={() => window.open(`/product/${p.slug}`, "_blank")}
                className="primaryTextColor cursor-pointer "
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Edit Button */}
              <button
                onClick={() => openEditDialog(p)}
                className="primaryTextColor cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(p.productId)}
                className="primaryTextColor cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
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
          {/* Instructors Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="instructors-label">Instructors</InputLabel>
            {loadingInstructors ? (
              <CircularProgress size={24} />
            ) : instructorsError ? (
              <p className="text-red-600">{instructorsError}</p>
            ) : (
              <Select
                labelId="instructors-label"
                label="Instructors"
                name="instructors"
                multiple
                value={form.instructors}
                onChange={handleInstructorChange}
                renderValue={(selected) =>
                  instructorsList
                    .filter((ins) => selected.includes(ins._id))
                    .map((ins) => ins.name)
                    .join(", ")
                }
              >
                {instructorsList.map((instructor) => (
                  <MenuItem key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Editor
            value={form.longDesc}
            onTextChange={handleEditorChange}
            style={{ height: "260px", marginBottom: "1rem" }}
            theme="snow"
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
