import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

export default function ExamResultsList() {

  const {token} = useAuthAdminStore()

  const [exams, setExams] = useState([]);
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

  return (
    <div className="shadow rounded-lg p-3">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold mb-4">
        View Exams Results
      </h1>

      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="flex items-center justify-between p-4 rounded shadow"
          >
            <span className="font-semibold">{exam.title}</span>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate(`/admin/results/${exam._id}`)}
            >
              View Results
            </Button>
          </div>
        ))}
      </div>

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
