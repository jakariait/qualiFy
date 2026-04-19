import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const apiUrl = import.meta.env.VITE_API_URL;
const MIN_PASSWORD_LENGTH = 8;

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const emailFromQuery = query.get("email");
  const expiryFromQuery = Number(query.get("expiry")) || 0;

  const [email] = useState(emailFromQuery || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If expiry param is missing or invalid, assume 10 min from now (OTP was just sent)
  const resolvedExpiry =
    expiryFromQuery && !isNaN(expiryFromQuery) && expiryFromQuery > Date.now()
      ? expiryFromQuery
      : Date.now() + 10 * 60 * 1000;

  const [expiryTime, setExpiryTime] = useState(resolvedExpiry);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, Math.ceil((resolvedExpiry - Date.now()) / 1000))
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Countdown timer — recalculates from expiryTime on mount and whenever expiry changes
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) clearInterval(interval);
    };
    tick(); // set immediately without waiting for first tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setSnackbar({
        open: true,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match.",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/reset-password`, {
        email,
        otp,
        newPassword,
      });

      setSnackbar({
        open: true,
        message: res.data.message || "Password reset successful",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to reset password.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || remainingSeconds > 0) return;
    try {
      const res = await axios.post(`${apiUrl}/request-reset`, { email });
      const newExpiry = res.data.otpExpiry || Date.now() + 10 * 60 * 1000;
      setExpiryTime(newExpiry);
      setRemainingSeconds(Math.ceil((newExpiry - Date.now()) / 1000));
      setSnackbar({
        open: true,
        message: "A new OTP has been sent to your email.",
        severity: "success",
      });
    } catch (err) {
      const data = err.response?.data;
      // If OTP still valid (shouldn't happen due to disabled state, but guard anyway)
      if (err.response?.status === 429 && data?.remainingSeconds) {
        const newExpiry = Date.now() + data.remainingSeconds * 1000;
        setExpiryTime(newExpiry);
        setRemainingSeconds(data.remainingSeconds);
      }
      setSnackbar({
        open: true,
        message: data?.message || "Failed to resend OTP.",
        severity: "error",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Reset Password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter the OTP sent to <span className="font-medium">{email}</span> and choose a new password.
      </p>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          readOnly
          className="w-full p-2 bg-gray-100 focus:outline-none rounded"
        />

        {/* OTP field + resend */}
        <div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="flex-1 p-2 bg-gray-100 focus:outline-none rounded"
              required
            />
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={remainingSeconds > 0}
              className="text-sm primaryTextColor hover:underline whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
            >
              Resend OTP
            </button>
          </div>
          {/* Countdown timer */}
          <div className="mt-1 text-xs text-right">
            {remainingSeconds > 0 ? (
              <span className="text-amber-600">
                OTP expires in{" "}
                <span className="font-semibold tabular-nums">
                  {formatCountdown(remainingSeconds)}
                </span>
              </span>
            ) : (
              <span className="text-red-500">OTP expired. Please resend.</span>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={`New Password (min ${MIN_PASSWORD_LENGTH} chars)`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 focus:outline-none rounded pr-16"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 bg-gray-100 focus:outline-none rounded"
          required
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full primaryBgColor accentTextColor py-2 rounded flex items-center justify-center cursor-pointer disabled:opacity-60"
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Reset Password"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-500">
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
