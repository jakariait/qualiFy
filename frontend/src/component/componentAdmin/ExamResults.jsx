import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import { Link } from "react-router-dom";

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
    <div className="shadow rounded-lg p-3">
      <h1 className="text-lg mb-4 font-semibold border-l-4 pl-2 primaryBorderColor primaryTextColor">
        Exam Results
      </h1>
      <div className="grid grid-cols-2 gap-2">
        {results.map((result) => (
          <div key={result._id} className="p-4 shadow rounded space-y-1">
            <p>
              <strong>Name:</strong> {result.userId.fullName}
            </p>
            <p>
              <strong>Email:</strong> {result.userId.email}
            </p>
            <p>
              <strong>Total Marks:</strong> {result.totalMarks} |{" "}
              <strong>Obtained:</strong> {result.obtainedMarks} |{" "}
              <strong>Percentage:</strong> {result.percentage} %
            </p>
            <Link
              className={"flex items-center justify-center pt-4"}
              to={`/admin/user-results/${result._id}`}
            >
              <button className="primaryBgColor cursor-pointer accentTextColor px-4 py-2 rounded">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
