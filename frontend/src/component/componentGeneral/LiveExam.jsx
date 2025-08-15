import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import QuestionPalette from "./QuestionPalette.jsx";

const LiveExam = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthUserStore();

  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExamStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/exam-attempts/${attemptId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch exam status");
      }
      const data = await response.json();
      if (data.success) {
        setAttempt(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch exam status");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [attemptId, token]);

  useEffect(() => {
    if (token) {
      fetchExamStatus();
    }
  }, [fetchExamStatus, token]);

  useEffect(() => {
    if (attempt && attempt.timeRemaining) {
      const timer = setInterval(() => {
        setAttempt((prevAttempt) => ({
          ...prevAttempt,
          timeRemaining:
            prevAttempt.timeRemaining > 0 ? prevAttempt.timeRemaining - 1 : 0,
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [attempt]);

  useEffect(() => {
    const syncTime = setInterval(async () => {
      if (attempt && attempt.status === "in_progress") {
        try {
          const response = await fetch(
            `/api/exam-attempts/${attemptId}/sync-time`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await response.json();
          if (data.success) {
            setAttempt((prevAttempt) => ({
              ...prevAttempt,
              timeRemaining: data.data.timeRemaining,
            }));
          }
        } catch (error) {
          console.error("Failed to sync time", error);
        }
      }
    }, 30000);
    return () => clearInterval(syncTime);
  }, [attemptId, token, attempt]);

  const handleAnswerChange = (questionIndex, value, type) => {
    if (type === "mcq-multiple") {
      const currentAnswers = answers[questionIndex] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((ans) => ans !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionIndex]: newAnswers });
    } else if (type === "image") {
      setAnswers({ ...answers, [questionIndex]: value[0] });
    } else {
      setAnswers({ ...answers, [questionIndex]: value });
    }
  };

  const submitAllAnswers = async () => {
    const { exam, currentSubject: currentSubjectIndex } = attempt;
    const currentSubject = exam.subjects[currentSubjectIndex];
    const answersToSubmit = [];

    currentSubject.questions.forEach((question, qIndex) => {
      const answer = answers[qIndex] !== undefined ? answers[qIndex] : null; // Ensure answer is null if not present
      answersToSubmit.push({
        questionIndex: qIndex,
        answer: answer,
        type: question.type, // Include question type for backend processing
      });
    });

    try {
      await fetch(`/api/exam-attempts/${attemptId}/submit-all-answers`, {
        // Assuming a new endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectIndex: currentSubjectIndex,
          answers: answersToSubmit,
        }),
      });
    } catch (error) {
      console.error("Failed to submit all answers", error);
    }
  };

  const handleCompleteExam = async () => {
    if (window.confirm("Are you sure you want to submit the exam?")) {
      try {
        await submitAllAnswers(); // Submit all answers before completing the exam
        await fetch(`/api/exam-attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        navigate(`/exam/results/${attemptId}`);
      } catch (error) {
        console.error("Failed to submit exam", error);
      }
    }
  };

  const renderQuestion = (question, qIndex) => {
    const answer = answers[qIndex];
    switch (question.type) {
      case "mcq-single":
        return question.options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              name={`question-${qIndex}`}
              value={option}
              checked={answer === option}
              onChange={(e) =>
                handleAnswerChange(qIndex, e.target.value, question.type)
              }
            />
            <label className="ml-2">{option}</label>
          </div>
        ));
      case "mcq-multiple":
        return question.options.map((option, index) => (
          <div key={index}>
            <input
              type="checkbox"
              name={`question-${qIndex}`}
              value={option}
              checked={answer?.includes(option)}
              onChange={(e) =>
                handleAnswerChange(qIndex, e.target.value, question.type)
              }
            />
            <label className="ml-2">{option}</label>
          </div>
        ));
      case "short":
        return (
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            value={answer || ""}
            onChange={(e) =>
              handleAnswerChange(qIndex, e.target.value, question.type)
            }
          />
        );
      case "image":
        return (
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleAnswerChange(qIndex, e.target.files, question.type)
            }
          />
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!attempt) return <div>No attempt data found.</div>;

  if (attempt.status !== "in_progress") {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Exam Over</h2>
        <p className="mb-4">
          This exam attempt is now complete. Status: {attempt.status}
        </p>
        <Link
          to={`/exam/results/${attemptId}`}
          className="text-blue-500 hover:underline"
        >
          View Results
        </Link>
      </div>
    );
  }

  const { exam, currentSubject: currentSubjectIndex, timeRemaining } = attempt;

  if (!exam || !exam.subjects || exam.subjects.length === 0)
    return <div>No exam data found or exam has no subjects.</div>;

  if (
    currentSubjectIndex === null ||
    exam.subjects[currentSubjectIndex] === undefined
  ) {
    return <div>Error: Could not determine the current subject.</div>;
  }

  const currentSubject = exam.subjects[currentSubjectIndex];
  if (
    !currentSubject ||
    !currentSubject.questions ||
    currentSubject.questions.length === 0
  ) {
    return <div>This subject has no questions.</div>;
  }

  return (
      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{exam.title}</h2>
            <div className="text-xl font-bold">
              Time Remaining: {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{currentSubject.title}</h3>
          </div>
          <div>
            {currentSubject.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="mb-8 p-4 border rounded-lg shadow-sm"
              >
                <h4 className="text-lg font-semibold mb-2">
                  Question {qIndex + 1}:{" "}
                  <span
                    dangerouslySetInnerHTML={{ __html: question.text }}
                  ></span>
                </h4>
                <div>{renderQuestion(question, qIndex)}</div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <button
              onClick={handleCompleteExam}
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              Submit Exam
            </button>
          </div>
        </div>
        <div className="col-span-3">
          <QuestionPalette
            questions={currentSubject.questions}
            answers={answers}
          />
        </div>
      </div>
  );
};

export default LiveExam;
