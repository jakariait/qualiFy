import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import QuestionPalette from "./QuestionPalette.jsx";
import DOMPurify from "dompurify";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material"; // ✅ MUI Snackbar and Dialog
import LiveExamSkeleton from "./LiveExamSkeleton.jsx";
import QuestionPreview from "../QuestionPreview.jsx";
import SubjectDescription from "./SubjectDescription.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const LiveExam = () => {
  // Copy Protection
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    const disableCopyPaste = (e) => e.preventDefault();
    const disableShortcuts = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "v", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("copy", disableCopyPaste);
    document.addEventListener("cut", disableCopyPaste);
    document.addEventListener("paste", disableCopyPaste);
    document.addEventListener("keydown", disableShortcuts);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("cut", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, []);

  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthUserStore();

  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState("");
  const [confirmDialogMessage, setConfirmDialogMessage] = useState("");
  const confirmCallbackRef = React.useRef(null);
  const timeoutHandled = React.useRef(false);

  const showSnackbar = useCallback((message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchExamStatus = useCallback(async () => {
    // Don't set loading to true on auto-fetches, only initial
    // setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/exam-attempts/${attemptId}/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch exam status");
      }
      const data = await response.json();
      if (data.success) {
        setAttempt(data.data);
        setAnswers({}); // Reset answers when fetching new subject/status
      } else {
        throw new Error(data.message || "Failed to fetch exam status");
      }
    } catch (err) {
      showSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }, [attemptId, token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchExamStatus();
    }
  }, [fetchExamStatus, token]);

  // Reset timeout handled flag on subject change
  useEffect(() => {
    timeoutHandled.current = false;
  }, [attempt?.currentSubject]);

  // Timer countdown — paused while submitting so new subject timer starts from full value
  useEffect(() => {
    if (attempt?.status !== "in_progress" || isSubmitting) {
      return;
    }

    const timer = setInterval(() => {
      setAttempt((prevAttempt) => {
        if (!prevAttempt || prevAttempt.timeRemaining <= 0) {
          clearInterval(timer);
          return prevAttempt;
        }
        return { ...prevAttempt, timeRemaining: prevAttempt.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt?.currentSubject, attempt?.status, isSubmitting]);

  // Build FormData for the current subject's answers — single source of truth
  const buildAnswerFormData = useCallback(() => {
    if (!attempt) return null;
    const { exam, currentSubject: idx } = attempt;
    const subject = exam.subjects[idx];
    const formData = new FormData();
    const plainAnswers = [];

    subject.questions.forEach((question, qIndex) => {
      const answer = answers[qIndex] !== undefined ? answers[qIndex] : null;
      if (question.type === "image" && Array.isArray(answer)) {
        const fileNames = [];
        answer.forEach((file) => {
          if (file instanceof File) {
            formData.append("answer", file);
            fileNames.push(file.name);
          }
        });
        plainAnswers.push({ questionIndex: qIndex, answer: fileNames, type: question.type });
      } else {
        plainAnswers.push({ questionIndex: qIndex, answer, type: question.type });
      }
    });

    formData.append("answers", JSON.stringify({ subjectIndex: idx, answers: plainAnswers }));
    return formData;
  }, [attempt, answers]);

  // Used only for final exam submit (submit-all-answers + submit in sequence)
  const submitCurrentSubjectAnswers = useCallback(async () => {
    if (!attempt) return;
    const formData = buildAnswerFormData();
    const response = await fetch(
      `${API_URL}/exam-attempts/${attemptId}/submit-all-answers`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
    );
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const message = contentType?.includes("application/json")
        ? (await response.json()).message || "Failed to submit answers."
        : `Failed to submit answers. Status: ${response.status}`;
      showSnackbar(message);
      throw new Error(message);
    }
  }, [attempt, attemptId, token, showSnackbar, buildAnswerFormData]);

  // Auto-submit on timeout
  useEffect(() => {
    const handleTimeout = async () => {
      setIsSubmitting(true);
      try {
        if (!attempt) return;

        const isLastSubject =
          attempt.currentSubject >= attempt.exam.subjects.length - 1;

        if (isLastSubject) {
          // This is the last subject, so submit the entire exam.
          await submitCurrentSubjectAnswers(); // Submit final answers
          await fetch(`${API_URL}/exam-attempts/${attemptId}/submit`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          showSnackbar("Time's up! Exam submitted automatically.", "info");
          navigate(`/user/exam/results/${attemptId}`);
        } else {
          // Not the last subject — submit answers + advance in one request
          const formData = buildAnswerFormData();
          const advanceResponse = await fetch(
            `${API_URL}/exam-attempts/${attemptId}/submit-and-advance`,
            { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
          );
          if (!advanceResponse.ok) {
            const errorData = await advanceResponse.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to advance to next subject on timeout");
          }
          showSnackbar("Time's up! Moving to next subject automatically.", "info");
          const advData = await advanceResponse.json();
          if (advData.data?.newStatus) {
            setAttempt(advData.data.newStatus);
            setAnswers({});
          } else {
            await fetchExamStatus();
          }
        }
      } catch (error) {
        showSnackbar(
          error.message || "An error occurred during auto-submission.",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    if (
      attempt &&
      attempt.status === "in_progress" &&
      attempt.timeRemaining <= 0 &&
      !isSubmitting &&
      !timeoutHandled.current
    ) {
      timeoutHandled.current = true;
      handleTimeout();
    }
  }, [
    attempt,
    answers,
    isSubmitting,
    buildAnswerFormData,
    fetchExamStatus,
    attemptId,
    navigate,
    token,
  ]);

  // Time sync with server — skip during submission to avoid stomping fresh subject timeRemaining
  useEffect(() => {
    const syncTime = setInterval(async () => {
      if (attempt && attempt.status === "in_progress" && !isSubmitting) {
        try {
          const response = await fetch(
            `${API_URL}/exam-attempts/${attemptId}/sync-time`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await response.json();
          if (data.success && data.data) {
            // If server reports a change in subject or status, trigger a full refresh
            if (
              data.data.currentSubject !== attempt.currentSubject ||
              data.data.status !== attempt.status
            ) {
              await fetchExamStatus();
            } else {
              // Otherwise, just update the timer
              setAttempt((prev) => ({
                ...prev,
                timeRemaining: data.data.timeRemaining,
              }));
            }
          }
        } catch (error) {
          console.error("Failed to sync time", error);
        }
      }
    }, 30000); // Sync with server every 30 seconds

    return () => clearInterval(syncTime);
  }, [attempt, attemptId, token, fetchExamStatus, isSubmitting]);

  const handleAnswerChange = (questionIndex, value, type) => {
    if (type === "mcq-multiple") {
      const currentAnswers = answers[questionIndex] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((ans) => ans !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionIndex]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionIndex]: value });
    }
  };

  const handleNextSubject = async () => {
    setConfirmDialogTitle("Confirm Subject Submission");
    setConfirmDialogMessage(
      "Are you sure you want to submit this subject and move to the next?",
    );
    confirmCallbackRef.current = async () => {
      setIsSubmitting(true);
      try {
        // Single request: submit + advance + get new subject state in one round trip
        const formData = buildAnswerFormData();
        const response = await fetch(
          `${API_URL}/exam-attempts/${attemptId}/submit-and-advance`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
        );
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || "Failed to submit and advance");
        }
        const data = await response.json();
        // Use status returned directly — no separate fetchExamStatus needed
        if (data.data?.newStatus) {
          setAttempt(data.data.newStatus);
          setAnswers({});
        } else {
          await fetchExamStatus();
        }
        showSnackbar("Subject submitted and moved to next.", "success");
      } catch (error) {
        showSnackbar(error.message || "Failed to move to next subject.");
      } finally {
        setIsSubmitting(false);
        setAwaitingConfirmation(false);
      }
    };
    setConfirmDialogOpen(true);
    setAwaitingConfirmation(true); // Set when dialog is opened
  };

  const handleCompleteExam = async () => {
    setConfirmDialogTitle("Confirm Exam Submission");
    setConfirmDialogMessage("Are you sure you want to submit the exam?");
    confirmCallbackRef.current = async () => {
      setIsSubmitting(true);
      try {
        await submitCurrentSubjectAnswers();

        await fetch(`${API_URL}/exam-attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        showSnackbar("Exam submitted successfully!", "success");
        navigate(`/user/exam/results/${attemptId}`);
      } catch (error) {
        console.error("Failed to submit exam", error);
        // Error is already shown by submitCurrentSubjectAnswers
        setIsSubmitting(false);
      } finally {
        setAwaitingConfirmation(false); // Reset after submission attempt
      }
    };
    setConfirmDialogOpen(true);
    setAwaitingConfirmation(true); // Set when dialog is opened
  };

  const renderQuestion = (question, qIndex) => {
    const answer = answers[qIndex];
    switch (question.type) {
      case "mcq-single":
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = answer === option;
              return (
                <label
                  key={index}
                  className={`flex items-start cursor-pointer gap-3 px-4 py-3 rounded-xl border transition ${
                    isSelected
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={option}
                    checked={isSelected}
                    onChange={(e) =>
                      handleAnswerChange(qIndex, e.target.value, question.type)
                    }
                    className="mt-1 h-4 w-4 accent-orange-500 shrink-0"
                  />
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="font-semibold shrink-0 text-gray-500">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <QuestionPreview content={option} />
                  </div>
                </label>
              );
            })}
          </div>
        );
      case "short":
        return (
          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            rows="6"
            value={answer || ""}
            placeholder="Type your answer here..."
            onChange={(e) =>
              handleAnswerChange(qIndex, e.target.value, question.type)
            }
          />
        );
      case "image":
        const imageFiles = answer || [];

        const handleImageUpload = (e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            handleAnswerChange(qIndex, [...imageFiles, file], question.type);
            e.target.value = null;
          }
        };

        const handleImageRemove = (index) => {
          const newFiles = imageFiles.filter((_, i) => i !== index);
          handleAnswerChange(qIndex, newFiles, question.type);
        };

        return (
          <div>
            {imageFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 my-1">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
            {imageFiles.length < 2 && (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) return <LiveExamSkeleton />;
  if (!attempt) return <div>No attempt data found.</div>;

  if (attempt.status !== "in_progress") {
    return (
      <div className="bg-orange-100 shadow-inner rounded-2xl text-center p-3 py-10">
        <h2 className="text-2xl font-bold mb-4">Exam Over</h2>
        <p className="mb-4">
          This exam attempt is now complete. Status: {attempt.status}
        </p>
        <Link
          to={`/user/exam/results/${attemptId}`}
          className="primaryBgColor accentTextColor px-4 py-2 rounded cursor-pointer "
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
    // Subject exists but has no questions — show a clear message with option to skip
    const isLastSubject = currentSubjectIndex >= exam.subjects.length - 1;
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center justify-center gap-6 mt-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-10 text-center max-w-md w-full">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-bold primaryTextColor mb-2">
            {currentSubject?.title || `Subject ${currentSubjectIndex + 1}`}
          </h3>
          <p className="text-gray-500 mb-6">This subject has no questions. You can skip it and continue.</p>
          {isLastSubject ? (
            <button
              onClick={handleCompleteExam}
              disabled={isSubmitting}
              className="primaryBgColor accentTextColor cursor-pointer py-3 px-8 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          ) : (
            <button
              onClick={handleNextSubject}
              disabled={isSubmitting}
              className="primaryBgColor accentTextColor cursor-pointer py-3 px-8 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Advancing..." : "Skip to Next Subject →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const isLastSubject = currentSubjectIndex >= exam.subjects.length - 1;

  const formattedAnswersForPalette = currentSubject.questions.map(
    (_, qIndex) => {
      return answers[qIndex];
    },
  );

  const answeredCount = formattedAnswersForPalette.filter(
    (a) => a !== undefined && a !== null && a !== "" && !(Array.isArray(a) && a.length === 0)
  ).length;
  const totalQuestions = currentSubject.questions.length;
  const isLowTime = timeRemaining <= 300;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 gap-4">
      {/* Sticky exam header bar */}
      <div className="sticky top-0 z-40 bg-white border border-gray-200 rounded-2xl shadow-md px-5 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-bold text-base primaryTextColor">{exam.title}</span>
          <span className="text-xs text-gray-500">
            Subject {currentSubjectIndex + 1} of {exam.subjects.length}: {currentSubject.title}
          </span>
        </div>
        <div
          className={`font-mono font-bold text-xl px-4 py-1 rounded-full ${
            isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-orange-100 primaryTextColor"
          }`}
        >
          ⏱ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-sm text-gray-600 text-right">
          <span className="font-semibold text-green-600">{answeredCount}</span>
          <span className="text-gray-400"> / </span>
          <span className="font-semibold">{totalQuestions}</span>
          <span className="text-gray-500 ml-1">answered</span>
        </div>
      </div>

      {/* Exam description */}
      {exam.description && (
        <div className="bg-gray-50 shadow-inner rounded-2xl py-4 px-5">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exam.description) }}
          />
        </div>
      )}

      <QuestionPalette
        questions={currentSubject.questions}
        answers={formattedAnswersForPalette}
        subjectName={currentSubject.title}
      />

      <SubjectDescription description={currentSubject.description} />

      <div>
        {currentSubject.questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="mb-3 p-5 bg-white shadow-sm border border-gray-100 rounded-2xl"
          >
            <h4 className="text-base font-semibold mb-3">
              <span className="text-gray-500 mr-1">{qIndex + 1}.</span>
              <span className="primaryTextColor">
                <QuestionPreview content={question.text} />
              </span>
              {question.marks > 0 && (
                <span className="ml-2 font-normal text-sm text-gray-400">
                  ({question.marks} mark{question.marks > 1 ? "s" : ""})
                </span>
              )}
            </h4>
            <div>{renderQuestion(question, qIndex)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center pb-6">
        {isLastSubject ? (
          <button
            onClick={handleCompleteExam}
            disabled={isSubmitting}
            className="primaryBgColor accentTextColor cursor-pointer py-3 px-8 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        ) : (
          <button
            onClick={handleNextSubject}
            disabled={isSubmitting}
            className="primaryBgColor accentTextColor cursor-pointer py-3 px-8 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit & Next Subject"}
          </button>
        )}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              setAwaitingConfirmation(false); // Reset on cancel
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmCallbackRef.current) {
                confirmCallbackRef.current();
              }
              setConfirmDialogOpen(false);
              // setAwaitingConfirmation(false); // Reset is handled by the callback's finally block
            }}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LiveExam;
