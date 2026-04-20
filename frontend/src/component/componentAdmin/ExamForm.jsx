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
} from "@mui/icons-material";
import { Editor } from "primereact/editor";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import QuestionEditorWithLatex from "../QuestionEditorWithLatex.jsx";

export default function ExamForm({ initialData = {}, onSuccess }) {
  const { token } = useAuthAdminStore();

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [subjectsPagination, setSubjectsPagination] = useState({
    page: 1,
    limit: 3,
    total: 0,
    totalQuestions: 0,
    totalMarks: 0,
    totalTime: 0,
    hasMore: true,
    loadingMore: false,
  });
  const [questionsLoadMore, setQuestionsLoadMore] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [subjectsQuestionsCount, setSubjectsQuestionsCount] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

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

      // Handle nested API response
      const data =
        response.data?.data || response.data?.products || response.data || [];

      // Ensure it's an array and filter out products with type === "book"
      const filteredData = Array.isArray(data)
        ? data.filter((product) => product.type !== "book")
        : [];

      setProducts(filteredData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      showSnackbar("Failed to load products", "error");
    }
  };

  const { totalMarks, totalTime } = useMemo(() => {
    let marks = 0;
    let time = 0;
    (form.subjects || []).forEach((sub) => {
      time += sub.timeLimitMin || 0;
      marks += sub.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
    });
    return { totalMarks: marks, totalTime: time };
  }, [form.subjects]);

  const loadSubjectQuestions = async (sIndex) => {
    if (!initialData?._id || questionsLoadMore[sIndex]?.loaded) return;

    setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: true, loaded: true } }));
    try {
      const res = await axios.get(
        `${API_URL}/exams/${initialData?._id}/questions?subjectIndex=${sIndex}&questionsPage=1&questionsLimit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setForm(prev => {
        const updated = [...(prev.subjects || [])];
        updated[sIndex] = {
          ...updated[sIndex],
          questions: res.data.questions,
        };
        return { ...prev, subjects: updated };
      });

      setQuestionsLoadMore(prev => ({
        ...prev,
        [sIndex]: {
          page: 1,
          hasMore: res.data.pagination?.hasMore,
          loading: false,
          loaded: true,
        },
      }));
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestionsLoadMore(prev => ({ ...prev, [sIndex]: { loading: false, loaded: false } }));
    }
  };

  const loadMoreSubjects = async () => {
    if (subjectsPagination.loadingMore || !subjectsPagination.hasMore) return;

    setSubjectsPagination((prev) => ({ ...prev, loadingMore: true }));
    try {
      const nextPage = subjectsPagination.page + 1;
      const res = await axios.get(
        `${API_URL}/exams/${initialData?._id}/subjects?subjectsPage=${nextPage}&subjectsLimit=${subjectsPagination.limit}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
      setSubjectsPagination((prev) => ({ ...prev, loadingMore: false }));
    }
  };

  const loadMoreQuestions = async (sIndex) => {
    const subject = form.subjects?.[sIndex];
    if (!subject || questionsLoadMore[sIndex]?.loading) return;

    setQuestionsLoadMore((prev) => ({ ...prev, [sIndex]: { loading: true } }));
    try {
      const nextPage = (questionsLoadMore[sIndex]?.page || 1) + 1;
      const res = await axios.get(
        `${API_URL}/exams/${initialData?._id}/questions?subjectIndex=${sIndex}&questionsPage=${nextPage}&questionsLimit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setForm((prev) => {
        const updated = [...(prev.subjects || [])];
        updated[sIndex] = {
          ...updated[sIndex],
          questions: [...updated[sIndex].questions, ...res.data.questions],
        };
        return { ...prev, subjects: updated };
      });

      setQuestionsLoadMore((prev) => ({
        ...prev,
        [sIndex]: {
          page: nextPage,
          hasMore: res.data.pagination?.hasMore,
          loading: false,
        },
      }));

      setSubjectsQuestionsCount((prev) => ({
        ...prev,
        [sIndex]: res.data.pagination?.total || prev[sIndex],
      }));
    } catch (err) {
      console.error("Error loading more questions:", err);
      setQuestionsLoadMore((prev) => ({
        ...prev,
        [sIndex]: { loading: false },
      }));
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...(form.subjects || [])];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...(form.subjects || [])];
    if (!updated[sIndex].questions) {
      updated[sIndex].questions = [];
    }
    updated[sIndex].questions[qIndex][field] = value;
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const addSubject = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [
        ...(prev.subjects || []),
        {
          title: "",
          description: "",
          timeLimitMin: 0,
          questions: [],
        },
      ],
    }));
  };

  const removeSubject = (sIndex) => {
    setForm((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((_, index) => index !== sIndex),
    }));
  };

  const addQuestion = (sIndex) => {
    const updated = [...(form.subjects || [])];
    if (!updated[sIndex].questions) {
      updated[sIndex].questions = [];
    }
    updated[sIndex].questions.push({
      type: "mcq-single",
      text: "",
      options: ["", ""],
      correctAnswers: [],
      solution: "",
      marks: 1,
    });
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const removeQuestion = (sIndex, qIndex) => {
    const updated = [...(form.subjects || [])];
    if (updated[sIndex].questions) {
      updated[sIndex].questions.splice(qIndex, 1);
    }
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const addOption = (sIndex, qIndex) => {
    const updated = [...(form.subjects || [])];
    if (updated[sIndex].questions && updated[sIndex].questions[qIndex]) {
      updated[sIndex].questions[qIndex].options.push("");
    }
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const removeOption = (sIndex, qIndex, optIndex) => {
    const updated = [...(form.subjects || [])];
    const question = updated[sIndex].questions?.[qIndex];
    if (question && question.options) {
      question.options.splice(optIndex, 1);
      // Remove correct answer if it was this option
      question.correctAnswers = (question.correctAnswers || []).filter(
        (ans) => ans !== optIndex,
      );
      // Adjust other correct answers
      question.correctAnswers = question.correctAnswers.map((ans) =>
        ans > optIndex ? ans - 1 : ans,
      );
    }
    setForm((prev) => ({ ...prev, subjects: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      showSnackbar("Please enter exam title", "error");
      return;
    }

    if (form.subjects.length === 0) {
      showSnackbar("Please add at least one subject", "error");
      return;
    }

    for (let i = 0; i < form.subjects.length; i++) {
      const subject = form.subjects[i];
      if (!subject.title.trim()) {
        showSnackbar(`Please enter title for subject ${i + 1}`, "error");
        return;
      }
      if (subject.questions.length === 0) {
        showSnackbar(
          `Please add at least one question to subject "${subject.title}"`,
          "error",
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put(`${API_URL}/exams/${initialData?._id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // optional if sending JSON
          },
        });
        showSnackbar("Exam updated successfully!");
      } else {
        await axios.post(`${API_URL}/exams`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // optional if sending JSON
          },
        });
        showSnackbar("Exam created successfully!");
      }
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error saving exam",
        "error",
      );
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

  return (
    <Box>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {initialData?._id ? <EditIcon /> : <AddIcon />}
            {initialData?._id ? "Edit Exam" : "Create New Exam"}
          </Typography>

          {/* Live Calculation Display */}
          <div className="p-4 mb-6 bg-blue-500 text-white rounded-lg shadow">
            <div className=" gap-4 items-center">
              {initialData?._id ? (
                <div
                  className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"}
                >
                  {/* Subjects */}
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <h6 className="text-lg font-semibold">
                      {subjectsPagination.total} Subjects
                    </h6>
                  </div>

                  {/* Questions */}
                  <div className="flex items-center gap-2">
                    <span>❓</span>
                    <h6 className="text-lg font-semibold">
                      {subjectsPagination.totalQuestions} Questions
                    </h6>
                  </div>

                  {/* Marks */}
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <h6 className="text-lg font-semibold">
                      {subjectsPagination.totalMarks} Marks
                    </h6>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <h6 className="text-lg font-semibold">
                      {subjectsPagination.totalTime} min
                    </h6>
                  </div>
                </div>
              ) : (
                <div
                  className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"}
                >
                  {/* Total Marks */}
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <h6 className="text-lg font-semibold">
                      Total Marks: {totalMarks}
                    </h6>
                  </div>

                  {/* Total Time */}
                  <div className="flex  items-center gap-2">
                    <span>⏱️</span>
                    <h6 className="text-lg font-semibold">
                      Total Time: {totalTime} minutes
                    </h6>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <TextField
                  label="Exam Title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <p className="p-d-block pb-2 text-gray-500">
                  Provide a brief description of the exam
                </p>
                <Editor
                  value={form.description}
                  onTextChange={(e) => handleChange("description", e.htmlValue)}
                  style={{ height: "260px" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    label="Status"
                  >
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
                          return (
                            <Chip
                              key={value}
                              label={product?.name || value}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        <Checkbox
                          checked={
                            (form.productIds || []).indexOf(product._id) > -1
                          }
                        />
                        <ListItemText primary={product.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Select products this exam is associated with
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isFree || false}
                      onChange={(e) => handleChange("isFree", e.target.checked)}
                    />
                  }
                  label="Is this a free exam?"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Subjects Section */}
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <BookIcon />
              Subjects & Questions
            </Typography>

            {(form.subjects || []).map((subject, sIndex) => {
                    const hasQuestionsLoaded = questionsLoadMore[sIndex]?.loaded || (subject.questions?.length > 0);
                    const isLoadingQuestions = questionsLoadMore[sIndex]?.loading;
                    return (
                      <Accordion key={sIndex} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={() => !hasQuestionsLoaded && loadSubjectQuestions(sIndex)}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              width: "100%",
                            }}
                          >
                            <Typography variant="h6">
                              Subject {sIndex + 1}:{" "}
                              {subject.title || "Untitled Subject"}
                            </Typography>
                            <Chip
                              label={`${subjectsQuestionsCount[sIndex] || 0} questions`}
                              size="small"
                              color="secondary"
                            />
                            {isLoadingQuestions && <CircularProgress size={16} />}
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubject(sIndex);
                              }}
                              color="error"
                              size="small"
                            >
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
                        onChange={(e) =>
                          handleSubjectChange(sIndex, "title", e.target.value)
                        }
                        fullWidth
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Time Limit (minutes)"
                        type="number"
                        value={subject.timeLimitMin}
                        onChange={(e) =>
                          handleSubjectChange(
                            sIndex,
                            "timeLimitMin",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">min</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <p className="p-d-block pb-2 text-gray-500">
                        Provide a brief description of the subject
                      </p>
                      <Editor
                        value={subject.description || ""}
                        onTextChange={(e) =>
                          handleSubjectChange(
                            sIndex,
                            "description",
                            e.htmlValue,
                          )
                        }
                        style={{ height: "160px" }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Questions */}
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <QuestionIcon />
                    Questions ({subject.questions?.length || 0})
                  </Typography>

                  {(subject.questions || []).map((question, qIndex) => {
                    const qKey = `${sIndex}-${qIndex}`;
                    const isExpanded = expandedQuestions[qKey];
                    return (
                      <Accordion key={qIndex} sx={{ mb: 1 }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          onClick={() => toggleQuestionExpand(qKey)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              width: "100%",
                              pr: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ flexGrow: 1 }}
                            >
                              Q{qIndex + 1}:{" "}
                              {question.text
                                ?.replace(/<[^>]*>/g, "")
                                .slice(0, 50) || "Untitled"}
                              ...
                            </Typography>
                            <Chip
                              label={question.type}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={`${question.marks} marks`}
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(sIndex, qIndex);
                              }}
                              color="error"
                              size="small"
                            >
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
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      sIndex,
                                      qIndex,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                  label="Question Type"
                                >
                                  <MenuItem value="mcq-single">
                                    MCQ (Single Answer)
                                  </MenuItem>
                                  <MenuItem value="short">
                                    Short Answer
                                  </MenuItem>
                                  <MenuItem value="image">
                                    Image Question
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Marks"
                                type="number"
                                value={question.marks}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    sIndex,
                                    qIndex,
                                    "marks",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      marks
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>

                          <p className="p-d-block pt-2 pb-2 text-gray-500">
                            Question Text:
                          </p>
                          <QuestionEditorWithLatex
                            value={question.text}
                            onTextChange={(e) =>
                              handleQuestionChange(
                                sIndex,
                                qIndex,
                                "text",
                                e.htmlValue,
                              )
                            }
                          />

                          {question.type === "mcq-single" && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Options
                              </Typography>
                              {question.options.map((option, optIndex) => (
                                <Box
                                  key={optIndex}
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    mb: 1,
                                    alignItems: "center",
                                  }}
                                >
                                  <div className="mb-2" sx={{ flex: 1 }}>
                                    <label className="block font-medium mb-1">{`Option ${optIndex + 1}`}</label>
                                    <QuestionEditorWithLatex
                                      value={option}
                                      onTextChange={(e) => {
                                        const newOpts = [...question.options];
                                        newOpts[optIndex] = e.htmlValue;
                                        handleQuestionChange(
                                          sIndex,
                                          qIndex,
                                          "options",
                                          newOpts,
                                        );
                                      }}
                                    />
                                  </div>
                                  <Checkbox
                                    checked={question.correctAnswers.includes(
                                      optIndex,
                                    )}
                                    onChange={(e) => {
                                      handleQuestionChange(
                                        sIndex,
                                        qIndex,
                                        "correctAnswers",
                                        e.target.checked ? [optIndex] : [],
                                      );
                                    }}
                                  />
                                  {question.options.length > 2 && (
                                    <IconButton
                                      onClick={() =>
                                        removeOption(sIndex, qIndex, optIndex)
                                      }
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => addOption(sIndex, qIndex)}
                                sx={{ mt: 1 }}
                              >
                                Add Option
                              </Button>
                            </Box>
                          )}

                          <p className="p-d-block pt-2 pb-2 text-gray-500">
                            Solution:
                          </p>
                          <QuestionEditorWithLatex
                            value={question.solution || ""}
                            onTextChange={(e) =>
                              handleQuestionChange(
                                sIndex,
                                qIndex,
                                "solution",
                                e.htmlValue,
                              )
                            }
                          />
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    {initialData?._id &&
                      subject.questionsPagination?.hasMore && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => loadMoreQuestions(sIndex)}
                          disabled={questionsLoadMore[sIndex]?.loading}
                        >
                          {questionsLoadMore[sIndex]?.loading
                            ? "Loading..."
                            : "Load More Questions"}
                        </Button>
                      )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addQuestion(sIndex)}
                    >
                      Add Question
                    </Button>
                  </Box>
                </AccordionDetails>
</Accordion>
                    );
                  })}

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
              {initialData?._id && subjectsPagination.hasMore && (
                <Button
                  variant="outlined"
                  onClick={loadMoreSubjects}
                  disabled={subjectsPagination.loadingMore}
                >
                  {subjectsPagination.loadingMore
                    ? "Loading..."
                    : `Load More Subjects (${subjectsPagination.total - subjectsPagination.page * subjectsPagination.limit} remaining)`}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSubject}
              >
                Add Subject
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Submit Button */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading
                  ? "Saving..."
                  : initialData?._id
                    ? "Update Exam"
                    : "Create Exam"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
