import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  Grade as GradeIcon,
  Book as BookIcon,
  QuestionAnswer as QuestionIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  UnfoldMore as UnfoldMoreIcon,
} from "@mui/icons-material";
import SwitchableEditor from "./SwitchableEditor.jsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import StickyActionBar from "./StickyActionBar.jsx";
import SortableSubjectItem from "./SortableSubjectItem.jsx";
import VirtualQuestionList from "./VirtualQuestionList.jsx";


export default function ExamForm({ initialData = {}, onSuccess }) {
  const { token } = useAuthAdminStore();
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    productIds: [],
    subjects: [],
    isFree: false,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [subjectsPagination, setSubjectsPagination] = useState({
    page: 1, limit: 3, total: 0,
    totalQuestions: 0, totalMarks: 0, totalTime: 0,
    hasMore: true, loadingMore: false,
  });
  const [questionsLoadMore, setQuestionsLoadMore] = useState({});
  // { [sIndex]: Set<qIndex> }
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [subjectsQuestionsCount, setSubjectsQuestionsCount] = useState({});
  const [questionSearches, setQuestionSearches] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchExamBasicInfo = async (signal) => {
    if (initialData?._id) {
      setInitialLoading(true);
      try {
        const limit = subjectsPagination.limit;
        const res = await axios.get(
          `${API_URL}/exams/${initialData._id}?subjectsPage=1&subjectsLimit=${limit}&questionsPage=0`,
          { headers: { Authorization: `Bearer ${token}` }, signal }
        );
        const data = res.data.exam;
        setForm({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "draft",
          productIds: data.productIds || [],
          subjects: data.subjects || [],
          isFree: data.isFree || false,
        });

        if (data.pagination?.subjects) {
          const { page, limit: resLimit, total } = data.pagination.subjects;
          setSubjectsPagination({
            page,
            limit: resLimit,
            total,
            totalQuestions: data.pagination.subjects.totalQuestions || 0,
            totalMarks: data.pagination.subjects.totalMarks || 0,
            totalTime: data.pagination.subjects.totalTime || 0,
            hasMore: page * resLimit < total,
            loadingMore: false,
          });

          const counts = {};
          data.subjects?.forEach((sub, idx) => {
            counts[idx] = sub.questionsPagination?.total || 0;
          });
          setSubjectsQuestionsCount(counts);
        }

        // Calculate totals from subjects data
        let totalQ = 0, totalM = 0, totalT = 0;
        (data.subjects || []).forEach((sub) => {
          totalT += sub.timeLimitMin || 0;
          if (sub.questions && sub.questions.length > 0) {
            totalQ += sub.questions.length;
            totalM += sub.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
          }
        });

        // Update totals in pagination if not already set
        if (totalQ > 0 || totalM > 0 || totalT > 0) {
          setSubjectsPagination(prev => ({
            ...prev,
            totalQuestions: data.pagination.subjects.totalQuestions || totalQ || prev.totalQuestions,
            totalMarks: data.pagination.subjects.totalMarks || totalM || prev.totalMarks,
            totalTime: data.pagination.subjects.totalTime || totalT || prev.totalTime,
          }));
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching exam:", err);
        showSnackbar("Failed to load exam data", "error");
      } finally {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchExamBasicInfo(controller.signal);
    return () => controller.abort();
  }, [initialData?._id]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const data = response.data?.data || response.data?.products || response.data || [];
      const filteredData = Array.isArray(data) ? data.filter((p) => p.type !== "book") : [];
      setProducts(filteredData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      showSnackbar("Failed to load products", "error");
    }
  };

  const { totalMarks, totalTime } = useMemo(() => {
    let marks = 0, time = 0;
    (form.subjects || []).forEach((sub) => {
      time += sub.timeLimitMin || 0;
      marks += sub.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
    });
    return { totalMarks: marks, totalTime: time };
  }, [form.subjects]);

  // ── Subject / question loading ────────────────────────────────────────────
  const loadSubjectQuestions = async (sIndex) => {
    if (!initialData?._id || questionsLoadMore[sIndex]?.loaded) return;
    const subject = form.subjects?.[sIndex];
    const subjectId = subject?._id;
    setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: true, loaded: true } }));
    try {
      const res = await axios.get(
        `${API_URL}/exams/${initialData._id}/questions?subjectIndex=${subjectId || sIndex}&questionsPage=1&questionsLimit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm(prev => {
        const updated = [...(prev.subjects || [])];
        updated[sIndex] = { ...updated[sIndex], questions: res.data.questions };
        return { ...prev, subjects: updated };
      });
      setQuestionsLoadMore(prev => ({
        ...prev,
        [sIndex]: { page: 1, hasMore: res.data.pagination?.hasMore, loading: false, loaded: true },
      }));
      if (res.data.pagination?.total) {
        setSubjectsQuestionsCount(prev => ({ ...prev, [sIndex]: res.data.pagination.total }));
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: false, loaded: false } }));
    }
  };

  const loadMoreSubjects = async () => {
    if (subjectsPagination.loadingMore || !subjectsPagination.hasMore) return;
    setSubjectsPagination(prev => ({ ...prev, loadingMore: true }));
    try {
      const nextPage = subjectsPagination.page + 1;
      const res = await axios.get(
        `${API_URL}/exams/${initialData._id}/subjects?subjectsPage=${nextPage}&subjectsLimit=${subjectsPagination.limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm((prev) => {
        const newCounts = {};
        res.data.subjects.forEach((sub, idx) => {
          const actualIdx = prev.subjects.length + idx;
          newCounts[actualIdx] = sub.questionsPagination?.total || 0;
        });
        setSubjectsQuestionsCount((c) => ({ ...c, ...newCounts }));
        return { ...prev, subjects: [...prev.subjects, ...res.data.subjects] };
      });
      setSubjectsPagination((prev) => ({
        ...prev,
        page: nextPage,
        hasMore: nextPage * prev.limit < prev.total,
        loadingMore: false,
      }));
    } catch (err) {
      console.error("Error loading more subjects:", err);
      setSubjectsPagination(prev => ({ ...prev, loadingMore: false }));
    }
  };

  const loadAllSubjects = async () => {
    if (subjectsPagination.loadingMore) return;
    setSubjectsPagination(prev => ({ ...prev, loadingMore: true }));
    try {
      const res = await axios.get(
        `${API_URL}/exams/${initialData._id}/subjects?all=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm(prev => ({ ...prev, subjects: res.data.subjects }));
      setSubjectsPagination(prev => ({ ...prev, hasMore: false, loadingMore: false }));
      setQuestionsLoadMore({});
    } catch (err) {
      console.error("Error loading all subjects:", err);
      setSubjectsPagination(prev => ({ ...prev, loadingMore: false }));
    }
  };

  const loadMoreQuestions = async (sIndex) => {
    const subject = form.subjects?.[sIndex];
    if (!subject || questionsLoadMore[sIndex]?.loading) return;
    const subjectId = subject?._id;
    setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: true } }));
    try {
      const nextPage = (questionsLoadMore[sIndex]?.page || 1) + 1;
      const res = await axios.get(
        `${API_URL}/exams/${initialData._id}/questions?subjectIndex=${subjectId || sIndex}&questionsPage=${nextPage}&questionsLimit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm(prev => {
        const updated = [...(prev.subjects || [])];
        updated[sIndex] = { ...updated[sIndex], questions: [...updated[sIndex].questions, ...res.data.questions] };
        return { ...prev, subjects: updated };
      });
      setQuestionsLoadMore(prev => ({
        ...prev,
        [sIndex]: { page: nextPage, hasMore: res.data.pagination?.hasMore, loading: false, loaded: true },
      }));
      setSubjectsQuestionsCount(prev => ({
        ...prev, [sIndex]: res.data.pagination?.total || prev[sIndex],
      }));
    } catch (err) {
      console.error("Error loading more questions:", err);
      setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: false } }));
    }
  };

  // ── DnD handlers ──────────────────────────────────────────────────────────
  const handleSubjectDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = (form.subjects || []).map(s => s._id?.toString() || s._tempId);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(form.subjects, oldIdx, newIdx);
    setForm(prev => ({ ...prev, subjects: reordered }));
    if (initialData?._id) {
      try {
        await axios.patch(
          `${API_URL}/exams/${initialData._id}/subjects/reorder`,
          { orderedIds: reordered.map(s => s._id?.toString()).filter(Boolean) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) { console.error("Reorder subjects failed:", err); }
    }
  };

  const handleQuestionDragEnd = async (sIndex, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const subject = form.subjects[sIndex];
    if (!subject) return;
    const ids = subject.questions.map(q => q._id?.toString() || q._tempId);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(subject.questions, oldIdx, newIdx);
    setForm(prev => {
      const updated = [...(prev.subjects || [])];
      updated[sIndex] = { ...updated[sIndex], questions: reordered };
      return { ...prev, subjects: updated };
    });
    if (initialData?._id && subject._id) {
      try {
        await axios.patch(
          `${API_URL}/exams/${initialData._id}/subjects/${subject._id}/questions/reorder`,
          { orderedIds: reordered.map(q => q._id?.toString()).filter(Boolean) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) { console.error("Reorder questions failed:", err); }
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleQuestionExpand = (sIndex, qIndex) => {
    setExpandedQuestions(prev => {
      const s = new Set(prev[sIndex] || []);
      s.has(qIndex) ? s.delete(qIndex) : s.add(qIndex);
      return { ...prev, [sIndex]: s };
    });
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubjectChange = (index, field, value) => {
    const updated = [...(form.subjects || [])];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...(form.subjects || [])];
    if (!updated[sIndex].questions) updated[sIndex].questions = [];
    updated[sIndex].questions[qIndex][field] = value;
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  const addSubject = () => {
    setForm(prev => ({
      ...prev,
      subjects: [
        ...(prev.subjects || []),
        { _tempId: `temp-${Date.now()}`, title: "", description: "", timeLimitMin: 0, questions: [] },
      ],
    }));
  };

  const removeSubject = (sIndex) => {
    setForm(prev => ({ ...prev, subjects: (prev.subjects || []).filter((_, i) => i !== sIndex) }));
  };

  const addQuestion = (sIndex) => {
    const updated = [...(form.subjects || [])];
    if (!updated[sIndex].questions) updated[sIndex].questions = [];
    updated[sIndex].questions.push({
      _tempId: `temp-${Date.now()}`,
      type: "mcq-single", text: "", options: ["", ""], correctAnswers: [], solution: "", marks: 1,
    });
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  const removeQuestion = (sIndex, qIndex) => {
    const updated = [...(form.subjects || [])];
    if (updated[sIndex].questions) updated[sIndex].questions.splice(qIndex, 1);
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  const addOption = (sIndex, qIndex) => {
    const updated = [...(form.subjects || [])];
    if (updated[sIndex].questions?.[qIndex]) updated[sIndex].questions[qIndex].options.push("");
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  const removeOption = (sIndex, qIndex, optIndex) => {
    const updated = [...(form.subjects || [])];
    const q = updated[sIndex].questions?.[qIndex];
    if (q?.options) {
      q.options.splice(optIndex, 1);
      q.correctAnswers = (q.correctAnswers || []).filter(a => a !== optIndex).map(a => a > optIndex ? a - 1 : a);
    }
    setForm(prev => ({ ...prev, subjects: updated }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showSnackbar("Please enter exam title", "error"); return; }
    if (form.subjects.length === 0) { showSnackbar("Please add at least one subject", "error"); return; }
    for (let i = 0; i < form.subjects.length; i++) {
      const subject = form.subjects[i];
      if (!subject.title.trim()) { showSnackbar(`Please enter title for subject ${i + 1}`, "error"); return; }
      // For existing subjects: only validate if questions have actually been loaded
      // (empty questions array on an existing subject just means not fetched yet)
      const questionsLoaded = !subject._id || questionsLoadMore[i]?.loaded;
      if (questionsLoaded && subject.questions.length === 0) {
        showSnackbar(`Please add at least one question to subject "${subject.title}"`, "error"); return;
      }
    }
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put(`${API_URL}/exams/${initialData._id}`, form, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Exam updated successfully!");
      } else {
        await axios.post(`${API_URL}/exams`, form, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Exam created successfully!");
        onSuccess && onSuccess();
      }
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.error || err.response?.data?.message || "Error saving exam", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading exam data...</Typography>
      </Box>
    );
  }

  // ── Subject sortable IDs ──────────────────────────────────────────────────
  const subjectSortableIds = (form.subjects || []).map(s => s._id?.toString() || s._tempId || `sub-${Math.random()}`);

  return (
    <Box>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {initialData?._id ? <EditIcon /> : <AddIcon />}
            {initialData?._id ? "Edit Exam" : "Create New Exam"}
          </Typography>

          {/* Summary bar - show total questions from database, marks from loaded */}
          {(() => {
            let totalQ = 0, totalM = 0, totalT = 0;
            Object.values(subjectsQuestionsCount).forEach(count => {
              totalQ += count || 0;
            });
            (form.subjects || []).forEach((sub) => {
              totalT += sub.timeLimitMin || 0;
              if (sub.questions && sub.questions.length > 0) {
                totalM += sub.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
              }
            });
            return (
              <div className="p-4 mb-6 bg-blue-500 text-white rounded-lg shadow">
                <div className="gap-4 items-center">
                  {initialData?._id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center gap-2"><span>📚</span><h6 className="text-lg font-semibold">{subjectsPagination.total} Subjects</h6></div>
                      <div className="flex items-center gap-2"><span>❓</span><h6 className="text-lg font-semibold">{totalQ || subjectsPagination.totalQuestions} Questions</h6></div>
                      <div className="flex items-center gap-2"><span>🎯</span><h6 className="text-lg font-semibold">{totalM || subjectsPagination.totalMarks} Marks</h6></div>
                      <div className="flex items-center gap-2"><span>⏱️</span><h6 className="text-lg font-semibold">{totalT || subjectsPagination.totalTime} min</h6></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center gap-2"><span>🎯</span><h6 className="text-lg font-semibold">Total Marks: {totalMarks}</h6></div>
                      <div className="flex items-center gap-2"><span>⏱️</span><h6 className="text-lg font-semibold">Total Time: {totalTime} minutes</h6></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <form id="exam-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Exam Title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  fullWidth required variant="outlined" size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <p className="p-d-block pb-2 text-gray-500">Provide a brief description of the exam</p>
                <SwitchableEditor
                  storageKey="examDescription"
                  value={form.description}
                  onChange={(val) => handleChange("description", val)}
                  placeholder="Enter exam description…"
                  height={260}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} onChange={(e) => handleChange("status", e.target.value)} label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Associated Products</InputLabel>
                  <Select
                    multiple
                    value={form.productIds}
                    onChange={(e) => handleChange("productIds", e.target.value)}
                    input={<OutlinedInput label="Associated Products" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const product = products.find((p) => p._id === value);
                          return <Chip key={value} label={product?.name || value} size="small" color="primary" variant="outlined" />;
                        })}
                      </Box>
                    )}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        <Checkbox checked={(form.productIds || []).indexOf(product._id) > -1} />
                        <ListItemText primary={product.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select products this exam is associated with</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.isFree || false} onChange={(e) => handleChange("isFree", e.target.checked)} />}
                  label="Is this a free exam?"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Subjects Section */}
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BookIcon />Subjects & Questions
            </Typography>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubjectDragEnd}>
              <SortableContext items={subjectSortableIds} strategy={verticalListSortingStrategy}>
                <Box sx={{ pl: 4 }}>
                  {(form.subjects || []).map((subject, sIndex) => {
                    const subjectId = subject._id?.toString() || subject._tempId || `sub-${sIndex}`;
                    const hasQuestionsLoaded = questionsLoadMore[sIndex]?.loaded;
                    const isLoadingQuestions = questionsLoadMore[sIndex]?.loading;
                    const hasMoreQuestions = questionsLoadMore[sIndex]?.hasMore;
                    const expandedSet = expandedQuestions[sIndex] || new Set();
                    const searchFilter = questionSearches[sIndex] || "";
                    const questionSortableIds = (subject.questions || []).map(q => q._id?.toString() || q._tempId || `q-${Math.random()}`);

                    const handleSubjectExpand = () => {
                      if (!hasQuestionsLoaded && !isLoadingQuestions && initialData?._id) {
                        loadSubjectQuestions(sIndex);
                      }
                    };

                    return (
                      <SortableSubjectItem key={subjectId} id={subjectId}>
                        <Accordion sx={{ mb: 2 }} onChange={handleSubjectExpand}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                              <Typography variant="h6">
                                Subject {sIndex + 1}: {subject.title || "Untitled Subject"}
                              </Typography>
                              <Chip label={`${subjectsQuestionsCount[sIndex] || 0} questions`} size="small" color="secondary" />
                              {isLoadingQuestions && <CircularProgress size={16} />}
                              <IconButton onClick={(e) => { e.stopPropagation(); removeSubject(sIndex); }} color="error" size="small">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={8}>
                                <TextField
                                  label="Subject Title"
                                  value={subject.title}
                                  onChange={(e) => handleSubjectChange(sIndex, "title", e.target.value)}
                                  fullWidth required variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Time Limit (minutes)"
                                  type="number"
                                  value={subject.timeLimitMin}
                                  onChange={(e) => handleSubjectChange(sIndex, "timeLimitMin", parseInt(e.target.value) || 0)}
                                  fullWidth variant="outlined"
                                  InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <p className="p-d-block pb-2 text-gray-500">Provide a brief description of the subject</p>
                                <SwitchableEditor
                                  storageKey="subjectDescription"
                                  value={subject.description || ""}
                                  onChange={(val) => handleSubjectChange(sIndex, "description", val)}
                                  placeholder="Enter subject description…"
                                  height={160}
                                />
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <QuestionIcon />Questions ({subject.questions?.length || 0})
                              </Typography>
                              {/* Search box */}
                              <TextField
                                size="small"
                                placeholder="Search questions…"
                                value={searchFilter}
                                onChange={(e) => setQuestionSearches(prev => ({ ...prev, [sIndex]: e.target.value }))}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                sx={{ width: 220 }}
                              />
                            </Box>

                            {/* Virtual (collapsed) question list */}
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleQuestionDragEnd(sIndex, e)}
                            >
                              <VirtualQuestionList
                                questions={subject.questions || []}
                                expandedSet={expandedSet}
                                onToggle={(qIndex) => toggleQuestionExpand(sIndex, qIndex)}
                                onRemove={(qIndex) => removeQuestion(sIndex, qIndex)}
                                searchFilter={searchFilter}
                              />
                            </DndContext>

                            {/* Expanded (full editor) questions */}
                            {(subject.questions || []).map((question, qIndex) => {
                              if (!expandedSet.has(qIndex)) return null;
                              return (
                                <Accordion key={`expanded-${qIndex}`} expanded onChange={() => toggleQuestionExpand(sIndex, qIndex)} sx={{ mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", pr: 1 }}>
                                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                        Q{qIndex + 1}: {question.text?.replace(/<[^>]*>/g, "").slice(0, 50) || "Untitled"}...
                                      </Typography>
                                      <Chip label={question.type} size="small" sx={{ mr: 1 }} />
                                      <Chip label={`${question.marks} marks`} size="small" color="primary" sx={{ mr: 1 }} />
                                      <IconButton onClick={(e) => { e.stopPropagation(); removeQuestion(sIndex, qIndex); }} color="error" size="small">
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                          <InputLabel>Question Type</InputLabel>
                                          <Select
                                            value={question.type}
                                            onChange={(e) => handleQuestionChange(sIndex, qIndex, "type", e.target.value)}
                                            label="Question Type"
                                          >
                                            <MenuItem value="mcq-single">MCQ (Single Answer)</MenuItem>
                                            <MenuItem value="short">Short Answer</MenuItem>
                                            <MenuItem value="image">Image Question</MenuItem>
                                          </Select>
                                        </FormControl>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Marks" type="number" value={question.marks}
                                          onChange={(e) => handleQuestionChange(sIndex, qIndex, "marks", parseInt(e.target.value) || 1)}
                                          fullWidth variant="outlined"
                                          InputProps={{ endAdornment: <InputAdornment position="end">marks</InputAdornment> }}
                                        />
                                      </Grid>
                                    </Grid>

                                    <p className="p-d-block pt-2 pb-2 text-gray-500">Question Text:</p>
                                    <SwitchableEditor
                                      storageKey="questionText"
                                      useLatex
                                      minRows={3}
                                      value={question.text}
                                      onChange={(val) => handleQuestionChange(sIndex, qIndex, "text", val)}
                                    />

                                    {question.type === "mcq-single" && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Options</Typography>
                                        {question.options.map((option, optIndex) => (
                                          <Box key={optIndex} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                                            <div className="mb-2" sx={{ flex: 1 }}>
                                              <label className="block font-medium mb-1">{`Option ${optIndex + 1}`}</label>
                                              <SwitchableEditor
                                                storageKey="questionOption"
                                                useLatex
                                                minRows={2}
                                                value={option}
                                                onChange={(val) => {
                                                  const newOpts = [...question.options];
                                                  newOpts[optIndex] = val;
                                                  handleQuestionChange(sIndex, qIndex, "options", newOpts);
                                                }}
                                              />
                                            </div>
                                            <Checkbox
                                              checked={question.correctAnswers.includes(optIndex)}
                                              onChange={(e) => handleQuestionChange(sIndex, qIndex, "correctAnswers", e.target.checked ? [optIndex] : [])}
                                            />
                                            {question.options.length > 2 && (
                                              <IconButton onClick={() => removeOption(sIndex, qIndex, optIndex)} color="error" size="small">
                                                <DeleteIcon />
                                              </IconButton>
                                            )}
                                          </Box>
                                        ))}
                                        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addOption(sIndex, qIndex)} sx={{ mt: 1 }}>
                                          Add Option
                                        </Button>
                                      </Box>
                                    )}

                                    <p className="p-d-block pt-2 pb-2 text-gray-500">Solution:</p>
                                    <SwitchableEditor
                                      storageKey="questionSolution"
                                      useLatex
                                      minRows={3}
                                      value={question.solution || ""}
                                      onChange={(val) => handleQuestionChange(sIndex, qIndex, "solution", val)}
                                    />
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}

                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                              {initialData?._id && hasMoreQuestions && (
                                <Button size="small" variant="outlined" onClick={() => loadMoreQuestions(sIndex)} disabled={questionsLoadMore[sIndex]?.loading}>
                                  {questionsLoadMore[sIndex]?.loading ? "Loading..." : `Load More Questions (${subjectsQuestionsCount[sIndex] - (subject.questions?.length || 0)} remaining)`}
                                </Button>
                              )}
                              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion(sIndex)}>
                                Add Question
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </SortableSubjectItem>
                    );
                  })}
                </Box>
              </SortableContext>
            </DndContext>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
              {initialData?._id && subjectsPagination.hasMore && (
                <>
                  <Button variant="outlined" onClick={loadMoreSubjects} disabled={subjectsPagination.loadingMore}>
                    {subjectsPagination.loadingMore ? "Loading..." : `Load More Subjects (${subjectsPagination.total - subjectsPagination.page * subjectsPagination.limit} remaining)`}
                  </Button>
                  <Button variant="outlined" startIcon={<UnfoldMoreIcon />} onClick={loadAllSubjects} disabled={subjectsPagination.loadingMore}>
                    Expand All Subjects
                  </Button>
                </>
              )}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addSubject}>
                Add Subject
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
          </form>
        </CardContent>
      </Card>

      <StickyActionBar loading={loading} isEditing={!!initialData?._id} onSubmit={handleSubmit} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
