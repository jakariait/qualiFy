import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ExamResultsSkeleton from "../componentGeneral/ExamResultsSkeleton.jsx";
import DOMPurify from "dompurify";
import AuthAdminStore from "../../store/AuthAdminStore.js";
import QuestionPreview from "../QuestionPreview.jsx";
import QuestionEditorWithLatex from "../QuestionEditorWithLatex.jsx";

const UserResult = () => {
  const { id } = useParams(); // get result ID from URL
  const { token } = AuthAdminStore();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_URL}/results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResult(res.data.data);
      } catch (err) {
        setError("Failed to fetch result.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, API_URL]);

  useEffect(() => {
    if (result) {
      const initialMarks = {};
      const initialFeedback = {};
      result.questionResults.forEach((qr) => {
        const key = `${qr.subjectIndex}-${qr.questionIndex}`;
        initialMarks[key] = qr.marksObtained;
        initialFeedback[key] = qr.adminFeedback || "";
      });
      setMarks(initialMarks);
      setFeedback(initialFeedback);
    }
  }, [result]);

  const handleMarksChange = (subjectIndex, questionIndex, value) => {
    setMarks((prev) => ({
      ...prev,
      [`${subjectIndex}-${questionIndex}`]: value,
    }));
  };

  const handleFeedbackChange = (subjectIndex, questionIndex, value) => {
    setFeedback((prev) => ({
      ...prev,
      [`${subjectIndex}-${questionIndex}`]: value,
    }));
  };

  const handleUpdateMarks = async (subjectIndex, questionIndex) => {
    const marksValue = marks[`${subjectIndex}-${questionIndex}`];
    const feedbackValue = feedback[`${subjectIndex}-${questionIndex}`];
    if (marksValue === undefined || marksValue.toString().trim() === "") {
      alert("Please provide marks.");
      return;
    }

    const questionResult = result.questionResults.find(
      (q) =>
        q.questionIndex === questionIndex && q.subjectIndex === subjectIndex,
    );

    if (Number(marksValue) > questionResult.maxMarks) {
      alert(
        `Marks cannot be greater than max marks (${questionResult.maxMarks}).`,
      );
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/results/${id}/marks`,
        {
          subjectIndex,
          questionIndex,
          marksObtained: Number(marksValue),
          feedback: feedbackValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setResult(res.data.data); // Update result with response from backend
    } catch (err) {
      console.error(
        "Failed to update marks:",
        err.response || err.message || err,
      );
      alert(
        "Failed to update marks. " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading) return <ExamResultsSkeleton />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!result) return null;

  const {
    userId,
    examId,
    totalMarks,
    obtainedMarks,
    percentage,
    status,
    questionResults,
    submittedAt,
    mcqCorrectCount,
    mcqWrongCount,
    pendingReviewCount,
  } = result;

  return (
    <div className="bg-gray-50 shadow-inner rounded-2xl p-4 space-y-4">
      {/* Summary */}
      <div className="flex flex-col items-center justify-center space-y-1">
        <h2 className="text-2xl primaryTextColor font-bold">Result Summary</h2>
        <p>
          <strong>User:</strong> {userId.fullName} ({userId.email})
        </p>
        <p>
          <strong>Exam:</strong> {examId.title}
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
          <strong>Status:</strong> {status}
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
        const subject = examId.subjects[qr.subjectIndex];
        const question = subject?.questions[qr.questionIndex];
        const correctAnswerText =
          Array.isArray(qr.correctAnswer) && question?.options
            ? qr.correctAnswer.map((idx) => question.options[idx]).join(", ")
            : JSON.stringify(qr.correctAnswer);

        return (
          <div key={index} className="bg-gray-50 shadow-inner rounded-2xl p-3 ">
            <p className="flex items-center">
              <strong className="mr-1">Question:</strong>
              <QuestionPreview content={qr.questionText} />
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
                <QuestionPreview content={qr.userAnswer} />
              )}
            </p>

            {qr.questionType === "mcq-single" && (
              <p className="flex items-center">
                <strong className="mr-1">Correct Answer:</strong>
                <QuestionPreview content={correctAnswerText} />
              </p>
            )}

            <p>
              <strong>Status:</strong>{" "}
              {qr.questionType === "mcq-single" ? (
                qr.isCorrect ? (
                  <span className="text-green-500">Correct</span>
                ) : (
                  <span className="text-red-500">Incorrect</span>
                )
              ) : qr.isCorrect === null ? (
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

            {qr.adminFeedback && (
              <p className="flex items-start">
                <strong className="mr-1">Feedback:</strong>
                <QuestionPreview content={qr.adminFeedback} />
              </p>
            )}

            {qr.questionType !== "mcq-single" && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                <p className="font-semibold text-yellow-800">Action</p>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                      placeholder={`Max: ${qr.maxMarks}`}
                      value={
                        marks[`${qr.subjectIndex}-${qr.questionIndex}`] ?? ""
                      }
                      onChange={(e) =>
                        handleMarksChange(
                          qr.subjectIndex,
                          qr.questionIndex,
                          e.target.value,
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        handleUpdateMarks(qr.subjectIndex, qr.questionIndex)
                      }
                      className="px-4 py-1 primaryBgColor accentTextColor rounded cursor-pointer"
                    >
                      Update Marks
                    </button>
                  </div>
                  <QuestionEditorWithLatex
                    value={
                      feedback[`${qr.subjectIndex}-${qr.questionIndex}`] ?? ""
                    }
                    onTextChange={(e) =>
                      handleFeedbackChange(
                        qr.subjectIndex,
                        qr.questionIndex,
                        e.htmlValue, // use the HTML output from QuestionEditorWithLatex
                      )
                    }
                  />
                </div>
              </div>
            )}

            {question?.solution && (
              <p className="flex items-start">
                <strong className="mr-1">Solution:</strong>
                <QuestionPreview content={question.solution} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserResult;
