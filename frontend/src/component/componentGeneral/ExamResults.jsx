import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import DOMPurify from "dompurify";

import ExamResultsSkeleton from "./ExamResultsSkeleton.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const ExamResults = () => {
  const { attemptId } = useParams();
  const { token } = useAuthUserStore();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(
          `${API_URL}/exam-attempts/${attemptId}/results`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch results");
        }
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch results");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchResults();
    }
  }, [attemptId, token]);

  if (loading) return <ExamResultsSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!results) return <div>No results found.</div>;

  const { attempt, result, exam } = results;

  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-3">
      <div className="flex flex-col items-center justify-center mb-4">
        <h1 className="text-3xl primaryTextColor font-bold ">Exam Results</h1>
        <h2 className="text-2xl font-semibold">{exam.title}</h2>
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(exam.description),
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 shadow-inner rounded-2xl p-3 flex flex-col items-center justify-center">
          <h3 className="text-xl primaryTextColor font-bold">Summary</h3>
          <p>
            <strong>Status:</strong>{" "}
            {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
          </p>
          <p>
            <strong>Total Marks:</strong> {result.totalMarks}
          </p>
          <p>
            <strong>Obtained Marks:</strong> {result.obtainedMarks}
          </p>
          <p>
            <strong>Percentage:</strong> {result.percentage?.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 shadow-inner rounded-2xl p-3 flex flex-col items-center justify-center">
          <h3 className="text-xl primaryTextColor font-bold">MCQ Stats</h3>
          <p>
            <strong>Correct:</strong> {result.mcqResults.correct}
          </p>
          <p>
            <strong>Wrong:</strong> {result.mcqResults.wrong}
          </p>
          <p>
            <strong>Total:</strong> {result.mcqResults.total}
          </p>
        </div>
      </div>

      <div className={"bg-gray-50 shadow-inner rounded-2xl p-3"}>
        <h3 className="text-xl font-bold primaryTextColor text-center mb-2">
          Detailed Results
        </h3>
        {result.questionResults.map((qResult, index) => (
          <div
            key={index}
            className="bg-gray-50 shadow-inner rounded-2xl py-4 p-3"
          >
            <p
              className="font-semibold primaryTextColor"
              dangerouslySetInnerHTML={{ __html: qResult.questionText }}
            ></p>
            <p>
              <strong>Your Answer:</strong>{" "}
              {qResult.questionType === "image" ? (
                <a
                  href={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${qResult.userAnswer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"primaryTextColor underline"}
                >
                  View Uploaded Image
                </a>
              ) : (
                JSON.stringify(qResult.userAnswer)
              )}
            </p>

            <p>
              {qResult.questionType === "mcq-single" && (
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  {(() => {
                    let displayCorrectAnswer = JSON.stringify(
                      qResult.correctAnswer,
                    );
                    const subject = exam.subjects[qResult.subjectIndex];
                    const question = subject?.questions[qResult.questionIndex];

                    if (
                      question &&
                      Array.isArray(qResult.correctAnswer) &&
                      question.options
                    ) {
                      displayCorrectAnswer = qResult.correctAnswer
                        .map((idx) => question.options[idx])
                        .join(", ");
                    }

                    return displayCorrectAnswer;
                  })()}
                </p>
              )}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {qResult.isCorrect === true ? (
                <span className="text-green-500">Correct</span>
              ) : qResult.isCorrect === false ? (
                <span className="text-red-500">Incorrect</span>
              ) : (
                <span className="text-yellow-500">Pending Review</span>
              )}
            </p>
            <p>
              <strong>Marks Obtained:</strong> {qResult.marksObtained} /{" "}
              {qResult.maxMarks}
            </p>
            {(() => {
              const subject = exam.subjects[qResult.subjectIndex];
              const question = subject?.questions[qResult.questionIndex];
              if (question && question.solution) {
                return (
                  <p>
                    <strong>Solution:</strong>{" "}
                    {DOMPurify.sanitize(question.solution).replace(
                      /<[^>]*>?/gm,
                      " ",
                    )}
                  </p>
                );
              }
              return null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamResults;
