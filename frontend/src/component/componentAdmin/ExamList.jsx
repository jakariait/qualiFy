import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import RequirePermission from "./RequirePermission.jsx";

export default function ExamList() {
  const { token } = useAuthAdminStore();

  const [exams, setExams] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExams(res.data.exams || res.data);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch exams", "error");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/exams/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSnackbar("Exam deleted successfully", "success");
      setDeleteId(null);
      fetchExams();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete exam", "error");
    }
  };

  return (
    <div className="shadow rounded-lg p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold">
          All Exams
        </h1>
        <button
          className={
            "primaryBgColor accentTextColor cursor-pointer px-4 py-2 rounded"
          }
          onClick={() => navigate("/admin/exams/create")}
        >
          Create Exam
        </button>
      </div>

      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="flex items-center justify-between p-4 rounded shadow"
          >
            <div>
              <span className="font-semibold">{exam.title}</span>{" "}
              <span className="text-gray-600">({exam.totalMarks} Marks)</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigate(`/admin/exams/edit/${exam._id}`)}
              >
                Edit
              </Button>
              <RequirePermission permission="delete_exam" fallback={true}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setDeleteId(exam._id)}
                >
                  Delete
                </Button>
              </RequirePermission>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigate(`/admin/results/${exam._id}`)}
              >
                Results
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this exam? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
