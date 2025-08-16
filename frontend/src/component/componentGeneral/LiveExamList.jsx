import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import ExamCardSkeleton from "./ExamCardSkeleton.jsx";
import DOMPurify from "dompurify";

import { Snackbar, Alert } from "@mui/material"; // ✅ MUI Snackbar

const API_URL = import.meta.env.VITE_API_URL;

const LiveExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const { token } = useAuthUserStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const showSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(`${API_URL}/exams/product/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }
        const data = await response.json();
        if (Array.isArray(data.exams)) {
          setExams(data.exams);
        } else {
          showSnackbar("Received invalid data from server");
        }
      } catch (err) {
        showSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExams();
    }
  }, [id]);

  const handleStartExam = async (examId) => {
    try {
      const response = await fetch(`${API_URL}/exams/${examId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start exam");
      }

      const result = await response.json();
      if (result.success) {
        navigate(`/exam/attempt/${result.data.attemptId}`);
      } else {
        throw new Error(result.message || "Failed to start exam");
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  };

  return (
    <section className="bg-gray-50 shadow-inner rounded-2xl p-6">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-2xl font-semibold">
        Live Exams
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <ExamCardSkeleton key={index} />
            ))
          : exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white border border-gray-200 p-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-2xl font-semibold text-gray-900">
                  {exam.title}
                </h3>

                <p
                  className="text-gray-600 mt-2 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(exam.description),
                  }}
                ></p>

                <div className="flex justify-between text-sm text-gray-600 mt-4">
                  <span>Total Marks: {exam.totalMarks}</span>
                  <span>Duration: {exam.durationMin} mins</span>
                </div>
                <button
                  onClick={() => handleStartExam(exam._id)}
                  className="w-full primaryBgColor accentTextColor cursor-pointer font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-4"
                >
                  Start Exam
                </button>
              </div>
            ))}
      </div>

      {/* ✅ MUI Snackbar for alerts */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  );
};

export default LiveExamList;
