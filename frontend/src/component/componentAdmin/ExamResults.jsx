import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Alert, Skeleton } from "@mui/material";
import { Link } from "react-router-dom";

const LoadingSkeleton = () => (
  <div className="shadow rounded-lg p-3">
    <h1 className="text-lg mb-4 font-semibold border-l-4 pl-2 primaryBorderColor primaryTextColor">
      <Skeleton width="150px" />
    </h1>
    <div className="grid grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 shadow rounded space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <div className="flex items-center justify-center pt-4">
            <Skeleton variant="rectangular" width={100} height={36} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ExamResults() {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retakeLoading, setRetakeLoading] = useState(null);
  const [retakeMessage, setRetakeMessage] = useState({ id: null, text: "", type: "" });
  const [deleteLoading, setDeleteLoading] = useState(null);
  const isDev = import.meta.env.DEV;

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

  const handleDelete = async (resultId) => {
    if (!window.confirm("Delete this result and its attempt? This cannot be undone.")) return;
    setDeleteLoading(resultId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/results/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults((prev) => prev.filter((r) => r._id !== resultId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleGrantRetake = async (userId, resultId) => {
    setRetakeLoading(resultId);
    setRetakeMessage({ id: null, text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/admin/retake`,
        { examId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRetakeMessage({ id: resultId, text: res.data.message || "Retake granted.", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to grant retake.";
      setRetakeMessage({ id: resultId, text: msg, type: "error" });
    } finally {
      setRetakeLoading(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

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
        {results.map((result, idx) => {
          // Only show Grant Retake on the latest attempt per user (idx=0 since sorted newest first)
          const isLatestForUser = results.findIndex(
            (r) => String(r.userId?._id) === String(result.userId?._id)
          ) === idx;

          return (
            <div key={result._id} className="p-4 shadow rounded space-y-1">
              <div className="flex items-center justify-between">
                <p>
                  <strong>User:</strong>{" "}
                  {result.userId
                    ? `${result.userId.fullName} (${result.userId.email})`
                    : "User not found"}
                </p>
                {result.attemptNumber > 1 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                    Retake #{result.attemptNumber - 1}
                  </span>
                )}
              </div>

              <p>
                <strong>Total Marks:</strong> {result.totalMarks} |{" "}
                <strong>Obtained:</strong> {result.obtainedMarks} |{" "}
                <p>
                  <strong>Percentage:</strong> {result.percentage?.toFixed(2)} %
                </p>
              </p>

              <p>
                <strong>Status:</strong> {result.status}
              </p>

              <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
                <Link to={`/admin/user-results/${result._id}`}>
                  <button className="primaryBgColor cursor-pointer accentTextColor px-4 py-2 rounded">
                    View Details
                  </button>
                </Link>
                {isLatestForUser && (
                  <button
                    onClick={() => handleGrantRetake(result.userId?._id, result._id)}
                    disabled={retakeLoading === result._id}
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {retakeLoading === result._id ? "Granting..." : "Grant Retake"}
                  </button>
                )}
                {isDev && (
                  <button
                    onClick={() => handleDelete(result._id)}
                    disabled={deleteLoading === result._id}
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === result._id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
              {retakeMessage.id === result._id && (
                <p className={`text-xs text-center mt-1 ${retakeMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {retakeMessage.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}