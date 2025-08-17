import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";

export default function ExamResults() {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token"); // adjust if using auth store
        const res = await axios.get(`${API_URL}/results/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setResults(res.data.data);
        } else {
          setError("No results found");
        }
      } catch (err) {
        console.error(err.response || err);
        setError("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId, API_URL]);

  if (loading) return <CircularProgress />;

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold border-l-4 pl-2 primaryBorderColor primaryTextColor">
        Exam Results
      </h1>

      {results.map((result) => (
        <div key={result._id} className="p-4 shadow rounded space-y-2">
          <p>
            <strong>User:</strong> {result.userId.email}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
          </p>
          <p>
            <strong>Total Marks:</strong> {result.totalMarks} |{" "}
            <strong>Obtained:</strong> {result.obtainedMarks}
          </p>

          {result.subjectAttempts.map((subject, i) => (
            <div key={i} className="pl-4 border-l-2 border-gray-300 space-y-1">
              <p>
                <strong>Subject {subject.subjectIndex + 1}:</strong>{" "}
                {subject.isCompleted ? "Completed" : "In Progress"}
              </p>
              <p>
                <strong>Time Limit:</strong> {subject.timeLimitMin} min
              </p>

              {subject.answers.map((ans, j) => (
                <div key={j} className="pl-4 space-y-0.5">
                  <p>
                    <strong>Q{ans.questionIndex + 1} Answer:</strong>{" "}
                    {ans.answer ? ans.answer : "Not answered"}
                  </p>
                  <p>
                    <strong>Marks Obtained:</strong> {ans.marksObtained}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
