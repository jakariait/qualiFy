
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";

const LiveExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("/api/exams");
        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }
        const data = await response.json();
        if (Array.isArray(data.exams)) {
          setExams(data.exams);
        } else {
          setError("Received invalid data from server");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleStartExam = async (examId) => {
    try {
      const response = await fetch(`/api/exams/${examId}/start`, {
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
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Loading exams...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Live Exams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div key={exam._id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">{exam.title}</h3>
            <p className="text-gray-600">{exam.description}</p>
            <button
              onClick={() => handleStartExam(exam._id)}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveExamList;
