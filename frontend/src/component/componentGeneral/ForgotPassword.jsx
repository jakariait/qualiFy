import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/request-reset`, { email });

      setSnackbar({
        open: true,
        message: res.data.message || "OTP sent successfully",
        severity: "success",
      });

      const expiry = res.data.otpExpiry;
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&expiry=${expiry}`);
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      setSnackbar({
        open: true,
        message: data?.message || "Something went wrong.",
        severity: status === 429 ? "warning" : "error",
      });

      // OTP still valid — navigate to reset page with remaining time
      if (status === 429 && data?.remainingSeconds) {
        const expiry = Date.now() + data.remainingSeconds * 1000;
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}&expiry=${expiry}`);
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter your email address and we'll send you an OTP to reset your password.
      </p>
      <form onSubmit={handleSendOTP} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 bg-gray-100 focus:outline-none rounded"
        />
        <button
          type="submit"
          className="w-full primaryBgColor accentTextColor py-2 rounded flex items-center justify-center cursor-pointer disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Send OTP"}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-500">
        Remember your password?{" "}
        <Link to="/login" className="primaryTextColor font-medium hover:underline">
          Back to Login
        </Link>
      </p>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
