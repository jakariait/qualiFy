import React, { useState, useEffect } from "react";
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

export default function ExamForm({ initialData = {}, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    productIds: [],
    subjects: [],
  });
  const [products, setProducts] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (initialData && Object.keys(initialData).length) {
      console.log("Loading exam data:", initialData);
      // Normalize the data to ensure proper structure
      const normalizedData = {
        ...initialData,
        productIds: initialData.productIds || [],
        subjects:
          initialData.subjects?.map((subject) => ({
            ...subject,
            questions: subject.questions || [],
          })) || [],
      };
      console.log("Normalized exam data:", normalizedData);
      setForm(normalizedData);
    }
  }, [initialData]);

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

  // Live calculation of marks & time
  useEffect(() => {
    let marks = 0;
    let time = 0;
    (form.subjects || []).forEach((sub) => {
      time += sub.timeLimitMin || 0;
      marks +=
        (sub.questions || [])?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
    });
    setTotalMarks(marks);
    setTotalTime(time);
  }, [form.subjects]);

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
        await axios.put(`${API_URL}/exams/${initialData._id}`, form);
        showSnackbar("Exam updated successfully!");
      } else {
        await axios.post(`${API_URL}/exams`, form);
        showSnackbar("Exam created successfully!");
      }
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Error saving exam", "error");
    } finally {
      setLoading(false);
    }
  };

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
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 3, bgcolor: "primary.light", color: "white" }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <GradeIcon />
                  <Typography variant="h6">
                    Total Marks: {totalMarks}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimerIcon />
                  <Typography variant="h6">
                    Total Time: {totalTime} minutes
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

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

            {(form.subjects || []).map((subject, sIndex) => (
              <Accordion key={sIndex} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                      label={`${subject.questions?.length || 0} questions`}
                      size="small"
                      color="secondary"
                    />
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

                  {(subject.questions || []).map((question, qIndex) => (
                    <Card key={qIndex} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Question {qIndex + 1}
                        </Typography>
                        <IconButton
                          onClick={() => removeQuestion(sIndex, qIndex)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

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
                              <MenuItem value="short">Short Answer</MenuItem>
                              <MenuItem value="image">Image Question</MenuItem>
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
                      <Editor
                        value={question.text}
                        onTextChange={(e) =>
                          handleQuestionChange(
                            sIndex,
                            qIndex,
                            "text",
                            e.htmlValue,
                          )
                        }
                        style={{ height: "120px", marginTop: "8px" }}
                      />

                      {/* MCQ Options */}
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
                              <TextField
                                label={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOpts = [...question.options];
                                  newOpts[optIndex] = e.target.value;
                                  handleQuestionChange(
                                    sIndex,
                                    qIndex,
                                    "options",
                                    newOpts,
                                  );
                                }}
                                fullWidth
                                variant="outlined"
                                size="small"
                              />
                              <Checkbox
                                checked={question.correctAnswers.includes(
                                  optIndex,
                                )}
                                onChange={(e) => {
                                  let newCorrect = [...question.correctAnswers];
                                  if (e.target.checked) {
                                    newCorrect = [optIndex]; // single correct
                                  } else {
                                    newCorrect = [];
                                  }
                                  handleQuestionChange(
                                    sIndex,
                                    qIndex,
                                    "correctAnswers",
                                    newCorrect,
                                  );
                                }}
                                color="primary"
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

                      {/* Solution */}
                      <p className="p-d-block pt-2 pb-2 text-gray-500">
                        Provide the correct answer or explanation for this
                        question:
                      </p>
                      <Editor
                        value={question.solution || ""}
                        onTextChange={(e) =>
                          handleQuestionChange(
                            sIndex,
                            qIndex,
                            "solution",
                            e.htmlValue,
                          )
                        }
                        style={{ height: "120px", marginTop: "8px" }}
                      />
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addQuestion(sIndex)}
                    sx={{ mt: 2 }}
                  >
                    Add Question
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSubject}
              sx={{ mb: 3 }}
            >
              Add Subject
            </Button>

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
