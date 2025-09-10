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

  // Timer countdown
  useEffect(() => {
    if (attempt?.status !== "in_progress") {
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
  }, [attempt?.currentSubject, attempt?.status]);

  const submitCurrentSubjectAnswers = useCallback(async () => {
    if (!attempt) return;
    const { exam, currentSubject: currentSubjectIndex } = attempt;
    const currentSubject = exam.subjects[currentSubjectIndex];

    const answersToSubmit = [];
    let hasImage = false;
    currentSubject.questions.forEach((question, qIndex) => {
      const answer = answers[qIndex] !== undefined ? answers[qIndex] : null;
      if (question.type === "image" && answer instanceof File) {
        hasImage = true;
      }
      answersToSubmit.push({
        questionIndex: qIndex,
        answer: answer,
        type: question.type,
      });
    });

    const formData = new FormData();
    const plainAnswersPayload = [];
    const imageFiles = [];

    answersToSubmit.forEach((ans) => {
      if (ans.type === "image" && ans.answer instanceof File) {
        imageFiles.push(ans);
      } else {
        plainAnswersPayload.push(ans);
      }
    });

    if (imageFiles.length > 1) {
      showSnackbar(
        "Warning: This exam allows only one image upload per subject.",
        "warning",
      );
    }

    if (imageFiles.length > 0) {
      // Add the first file under the key 'answer' for the router.
      formData.append("answer", imageFiles[0].answer);
      // Add placeholders for all images for the controller.
      imageFiles.forEach((imgAns) => {
        plainAnswersPayload.push({ ...imgAns, answer: imgAns.answer.name });
      });
    }

    const bodyPayload = {
      subjectIndex: currentSubjectIndex,
      answers: plainAnswersPayload,
    };

    formData.append("answers", JSON.stringify(bodyPayload));

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(
        `${API_URL}/exam-attempts/${attemptId}/submit-all-answers`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

      if (!response.ok) {
        let message;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          message = errorData.message || "Failed to submit answers.";
        } else {
          const textError = await response.text();
          console.error("Server returned non-JSON response:", textError);
          message = `Failed to submit answers. Server returned an unexpected response. Status: ${response.status}`;
        }
        throw new Error(message);
      }
    } catch (error) {
      console.error("Failed to submit answers for the subject", error);
      showSnackbar(
        error.message || "Failed to submit answers. Please try again.",
      );
      throw error; // Re-throw to be caught by callers
    }
  }, [attempt, answers, attemptId, token, showSnackbar]);

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
          // Not the last subject, so submit and advance.
          const { exam, currentSubject: currentSubjectIndex } = attempt;
          const currentSubject = exam.subjects[currentSubjectIndex];
          const answersToSubmit = currentSubject.questions.map(
            (question, qIndex) => ({
              questionIndex: qIndex,
              answer: answers[qIndex] !== undefined ? answers[qIndex] : null,
              type: question.type,
            }),
          );

          const formData = new FormData();
          const plainAnswersPayload = [];
          const imageFiles = [];

          answersToSubmit.forEach((ans) => {
            if (ans.type === "image" && ans.answer instanceof File) {
              imageFiles.push(ans);
            } else {
              plainAnswersPayload.push(ans);
            }
          });

          if (imageFiles.length > 0) {
            formData.append("answer", imageFiles[0].answer);
            imageFiles.forEach((imgAns) => {
              plainAnswersPayload.push({
                ...imgAns,
                answer: imgAns.answer.name,
              });
            });
          }

          const bodyPayload = {
            subjectIndex: currentSubjectIndex,
            answers: plainAnswersPayload,
          };

          formData.append("answers", JSON.stringify(bodyPayload));

          const advanceResponse = await fetch(
            `${API_URL}/exam-attempts/${attemptId}/submit-and-advance`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          if (!advanceResponse.ok) {
            const errorData = await advanceResponse.json();
            throw new Error(
              errorData.message ||
                "Failed to advance to next subject on timeout",
            );
          }
          showSnackbar(
            "Time's up! Moving to next subject automatically.",
            "info",
          );
          await fetchExamStatus();
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
    fetchExamStatus,
    attemptId,
    navigate,
    token,
  ]);

  // Time sync with server
  useEffect(() => {
    const syncTime = setInterval(async () => {
      if (attempt && attempt.status === "in_progress") {
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
  }, [attempt, attemptId, token, fetchExamStatus]);

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

  const handleNextSubject = async () => {
    setConfirmDialogTitle("Confirm Subject Submission");
    setConfirmDialogMessage(
      "Are you sure you want to submit this subject and move to the next?",
    );
    confirmCallbackRef.current = async () => {
      setIsSubmitting(true);
      try {
        await submitCurrentSubjectAnswers();

        // Call backend to advance to the next subject
        const advanceResponse = await fetch(
          `${API_URL}/exam-attempts/${attemptId}/advance-subject`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!advanceResponse.ok) {
          const errorData = await advanceResponse.json();
          throw new Error(
            errorData.message || "Failed to advance to next subject",
          );
        }

        await fetchExamStatus(); // Fetch the updated attempt status with the new subject
        showSnackbar("Subject submitted and moved to next.", "success");
      } catch (error) {
        console.error("Failed to move to next subject", error);
        // Error is already shown by submitCurrentSubjectAnswers
      } finally {
        setIsSubmitting(false);
        setAwaitingConfirmation(false); // Reset after submission attempt
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
          <div>
            {question.options.map((option, index) => (
              <label className="flex items-start cursor-pointer space-x-2">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) =>
                    handleAnswerChange(qIndex, e.target.value, question.type)
                  }
                  className="form-radio mt-1 h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <QuestionPreview content={option} />
                </div>
              </label>
            ))}
          </div>
        );
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
    return <div>This subject has no questions.</div>;
  }

  const isLastSubject = currentSubjectIndex >= exam.subjects.length - 1;

  const formattedAnswersForPalette = currentSubject.questions.map(
    (_, qIndex) => {
      return answers[qIndex];
    },
  );

  return (
    <div className="bg-orange-100 shadow-inner rounded-2xl p-3 grid grid-cols-1 gap-4 ">
      <div className="bg-gray-50 shadow-inner rounded-2xl py-3 flex flex-col items-center justify-center">
        <h2 className="text-xl primaryTextColor">{exam.title}</h2>
        <h2
          className="p-5"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(exam.description),
          }}
        ></h2>
        <div className="primaryTextColor">
          Time Remaining: {Math.floor(timeRemaining / 60)}:
          {(timeRemaining % 60).toString().padStart(2, "0")}
        </div>
      </div>

      <div>
        <QuestionPalette
          questions={currentSubject.questions}
          answers={formattedAnswersForPalette}
          subjectName={currentSubject.title}
        />
      </div>

        <SubjectDescription description={currentSubject.description} />

      <div>
        {currentSubject.questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="mb-2 p-4 bg-white shadow-inner rounded-2xl"
          >
            <h4 className="text-lg font-semibold mb-2 ">
              {qIndex + 1}:
              <span className="primaryTextColor ml-2 ">
                <QuestionPreview content={question.text} />
              </span>
              {question.marks > 0 && (
                <span className="ml-2 font-normal text-sm text-gray-500">
                  (Marks: {question.marks})
                </span>
              )}
            </h4>

            <div>{renderQuestion(question, qIndex)}</div>
          </div>
        ))}
      </div>

      <div className={"flex flex-col items-center justify-center"}>
        {isLastSubject ? (
          <button
            onClick={handleCompleteExam}
            disabled={isSubmitting}
            className="primaryBgColor accentTextColor cursor-pointer py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        ) : (
          <button
            onClick={handleNextSubject}
            disabled={isSubmitting}
            className="primaryBgColor accentTextColor cursor-pointer py-2 px-4 rounded disabled:bg-gray-400"
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
