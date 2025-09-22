import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import ExamCardSkeleton from "./ExamCardSkeleton.jsx";
import { Snackbar, Alert } from "@mui/material";
import ExamStartDialog from "./ExamStartDialog.jsx";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const LiveExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

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
        const response = await fetch(`${API_URL}/exams/product/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 👈 pass token here
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }
        const data = await response.json();
        if (Array.isArray(data.exams)) {
          const sortedExams = data.exams.sort((a, b) =>
            a.title.localeCompare(b.title),
          );
          setExams(sortedExams);
        } else {
          showSnackbar("Received invalid data from server");
        }
      } catch (err) {
        showSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAttempts = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/user/exam-attempts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user attempts");
        }
        if (data.success && Array.isArray(data.data)) {
          setUserAttempts(data.data);
        } else {
          showSnackbar(
            data.message || "Received invalid user attempts data from server",
          );
        }
      } catch (err) {
        showSnackbar(err.message);
      }
    };

    if (id) {
      fetchExams();
    }
    fetchUserAttempts();
  }, [id, token]);

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
        navigate(`/user/exam/attempt/${result.data.attemptId}`);
      } else {
        throw new Error(result.message || "Failed to start exam");
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  };

  const handleStartExamClick = (exam) => {
    setSelectedExam(exam);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedExam(null);
  };

  const handleDialogConfirm = () => {
    if (selectedExam) {
      handleStartExam(selectedExam._id);
    }
    handleDialogClose();
  };

  return (
    <section className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-2xl font-semibold">
        Live Exams
      </h1>

      <div className="flex flex-col gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <ExamCardSkeleton key={index} />
            ))
          : exams.map((exam) => {
              const userAttempt = userAttempts.find(
                (attempt) =>
                  attempt.exam && String(attempt.exam._id) === String(exam._id),
              );
              const hasAttempted = !!userAttempt;
              const attemptId = userAttempt ? userAttempt.id : null;

              return (
                <div
                  key={exam._id}
                  className="bg-white border border-gray-200 p-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl  text-gray-900">{exam.title}</h3>

                  <div className="flex justify-between text-sm text-gray-600 mt-4">
                    <span>Total Marks: {exam.totalMarks}</span>
                    <span>Duration: {exam.durationMin} Mins</span>
                  </div>
                  {hasAttempted ? (
                    <Link
                      to={`/user/exam/result/${exam._id}`}
                      className="block text-center w-full bg-blue-500 accentTextColor cursor-pointer font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-4"
                    >
                      View Results
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleStartExamClick(exam)}
                      className="w-full primaryBgColor accentTextColor cursor-pointer font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-4"
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              );
            })}
      </div>

      <ExamStartDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        exam={selectedExam}
      />

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
