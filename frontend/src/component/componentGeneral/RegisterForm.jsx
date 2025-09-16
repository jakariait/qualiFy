import {
  FaUser,
  FaLock,
  FaEyeSlash,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaHome,
} from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthUserStore from "../../store/AuthUserStore.js";
import useCartStore from "../../store/useCartStore.js";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./RegisterForm.css";

const apiUrl = import.meta.env.VITE_API_URL;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuthUserStore();
  const { syncCartToDB, loadCartFromBackend } = useCartStore();
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError(null);

    // Email validation
    if (!formData.email) {
      setRegistrationError("Email is required");
      return;
    }

    // Phone validation
    if (!phone) {
      setRegistrationError("Phone number is required");
      return;
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setRegistrationError("Phone number must be 10 to 15 digits.");
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setRegistrationError("Passwords do not match");
      return;
    }

    setRegistrationLoading(true);

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: phone,
      address: formData.address,
      password: formData.password,
    };

    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login after registration
        await login(formData.email, formData.password);
        const token = localStorage.getItem("user_token");

        if (token) {
          try {
            await syncCartToDB(token);
            await loadCartFromBackend(token);
            navigate("/user/home");
          } catch (cartError) {
            setSnackbarMessage(
              "Registration successful, but there was a problem loading your cart. Please try again.",
            );
            setSnackbarOpen(true);
            navigate("/user/home");
          }
        } else {
          alert(
            "Registration successful, but automatic login failed. Please log in manually.",
          );
          navigate("/login");
        }
      } else {
        setRegistrationError(data.message || "Registration failed!");
      }
    } catch (error) {
      setRegistrationError("Something went wrong. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white px-4 mt-20 mb-20 md:m-20">
      <div className="bg-[#EEF5F6] rounded-2xl shadow-md p-8 w-full max-w-md text-center relative">
        {/* Icon */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-indigo-200 to-blue-200 p-4 rounded-full">
            <FaRegEdit className="primaryTextColor text-5xl" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold m-7">Register Account</h2>

        {registrationError && (
          <div className="bg-red-100 text-red-600 px-4 py-2 mb-4 rounded">
            {registrationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Full Name */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4">
            <FaUser className="primaryTextColor mr-5 text-2xl" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name*"
              className="w-full outline-none text-sm bg-transparent"
              required
            />
          </div>

          {/* Email (Mandatory) */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4">
            <FaEnvelope className="primaryTextColor mr-5 text-2xl" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email*"
              className="w-full outline-none text-sm bg-transparent"
              required
            />
          </div>

          {/* Phone  */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4">
            <FaPhone className="primaryTextColor mr-5 text-2xl" />
            <PhoneInput
              placeholder="Enter phone number*"
              value={phone}
              onChange={setPhone}
              defaultCountry="BD"
              international
              withCountryCallingCode
              className="w-full outline-none text-sm bg-transparent"
              required
            />
          </div>

          {/* Address */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4">
            <FaHome className="primaryTextColor mr-5 text-2xl" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4 relative">
            <FaLock className="primaryTextColor mr-5 text-2xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Set Password*"
              className={`w-full outline-none bg-transparent pr-10 text-lg ${
                showPassword ? "font-bold" : ""
              } placeholder:text-sm`}
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center bg-white rounded-md shadow-sm px-4 py-4 relative">
            <FaLock className="primaryTextColor mr-5 text-2xl" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password*"
              className={`w-full outline-none bg-transparent pr-10 text-lg ${
                showConfirmPassword ? "font-bold" : ""
              } placeholder:text-sm`}
              required
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-md cursor-pointer mt-2 primaryBgColor accentTextColor"
            disabled={registrationLoading || authLoading}
          >
            {registrationLoading || authLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login">
            <button className="primaryTextColor font-medium hover:underline cursor-pointer">
              Sign in
            </button>
          </Link>
        </p>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterForm;
