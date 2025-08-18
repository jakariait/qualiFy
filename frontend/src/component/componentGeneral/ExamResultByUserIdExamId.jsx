import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ExamResultsSkeleton from "./ExamResultsSkeleton.jsx";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL;

export default function ExamResultByUserIdExamId() {
  const { examId } = useParams();
  const userId = "689ca0a30d1a82dfabd277cb"; // Replace or pass as prop if needed

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await axios.get(`${API_URL}/user/${userId}/exam/${examId}`);
        setResult(res.data.data);
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("Failed to fetch result.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [examId, userId]);

  if (loading) return <ExamResultsSkeleton />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!result) return <div>No result found.</div>;

  const {
    userId: user,
    examId: exam,
    totalMarks,
    obtainedMarks,
    percentage,
    attemptId,
    questionResults,
    submittedAt,
    mcqCorrectCount,
    mcqWrongCount,
    pendingReviewCount,
  } = result;

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60); // ensures no decimal
    return `${minutes} min ${seconds} sec`;
  };


  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-4 space-y-4">
      {/* Summary */}
      <div className="flex flex-col items-center justify-center space-y-1">
        <h2 className="text-2xl primaryTextColor font-bold">Result Summary</h2>
        <p>
          <strong>User:</strong> {user.fullName} ({user.email})
        </p>
        <p>
          <strong>Exam:</strong> {exam.title}
        </p>
        <p>
          <strong>Total Marks:</strong> {totalMarks}
        </p>
        <p>
          <strong>Obtained Marks:</strong> {obtainedMarks.toFixed(2)}
        </p>
        <p>
          <strong>Percentage:</strong> {percentage.toFixed(2)}%
        </p>
        <p>
          <strong>Completed In:</strong> {formatDuration(attemptId.totalDuration)}
        </p>
        <p>
          <strong>Submitted At:</strong>{" "}
          {new Date(submittedAt).toLocaleString()}
        </p>
        <p>
          <strong>MCQ:</strong> {mcqCorrectCount} Correct, {mcqWrongCount}{" "}
          Wrong, {pendingReviewCount} Pending Review
        </p>
      </div>

      {/* Questions */}
      <h3 className="text-xl primaryTextColor font-semibold mt-4 mb-2">
        Question Results:
      </h3>
      {questionResults.map((qr, index) => {
        const subject = exam.subjects[qr.subjectIndex];
        const question = subject?.questions[qr.questionIndex];
        const correctAnswerText =
          Array.isArray(qr.correctAnswer) && question?.options
            ? qr.correctAnswer.map((idx) => question.options[idx]).join(", ")
            : JSON.stringify(qr.correctAnswer);

        return (
          <div key={index} className="bg-gray-50 shadow-inner rounded-2xl p-3 ">
            <p className="flex items-center">
              <strong className="mr-1">Question:</strong>
              <span dangerouslySetInnerHTML={{ __html: qr.questionText }} />
            </p>

            <p className="flex items-center">
              <strong className="mr-1">Your Answer:</strong>
              {qr.questionType === "image" ? (
                qr.userAnswer ? (
                  <a
                    href={`${API_URL.replace("/api", "")}/uploads/${qr.userAnswer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primaryTextColor underline ml-1"
                  >
                    View Uploaded Image
                  </a>
                ) : (
                  <span className="ml-1">No image uploaded</span>
                )
              ) : (
                <span className="ml-1">{qr.userAnswer}</span>
              )}
            </p>

            {qr.questionType === "mcq-single" && (
              <p className="flex items-center">
                <strong className="mr-1">Correct Answer:</strong>
                <span className="ml-1">{correctAnswerText}</span>
              </p>
            )}

            <p>
              <strong>Status:</strong>{" "}
              {qr.isCorrect === null ? (
                <span className="text-yellow-500">Pending Review</span>
              ) : qr.reviewedAt ? (
                <span className="text-blue-500">Marks Given</span>
              ) : qr.isCorrect === true ? (
                <span className="text-green-500">Correct</span>
              ) : (
                <span className="text-red-500">Incorrect</span>
              )}
            </p>

            <p className="flex items-center">
              <strong className="mr-1">Marks Obtained:</strong>
              <span className="ml-1">
                {qr.marksObtained}/{qr.maxMarks}
              </span>
            </p>

            {question?.solution && (
              <p className="flex items-start">
                <strong className="mr-1">Solution:</strong>
                <span
                  className="ml-1"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(question.solution),
                  }}
                />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}