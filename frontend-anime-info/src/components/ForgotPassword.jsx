import { useState } from "react";
import { FaArrowLeft, FaEnvelope, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { authAPI } from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    // Client-side validation
    if (!email) {
      setErrors({ email: "Email address is required" });
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending password reset email to:", email);

      const response = await authAPI.forgotPassword({ email });

      if (response.success) {
        setIsEmailSent(true);
        setSuccessMessage(
          response.message || "Password reset link sent successfully!"
        );
        console.log("Password reset email sent successfully");
      } else {
        // Handle backend validation errors
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors({
            email: response.message || "Failed to send reset email",
          });
        }
      }
    } catch (error) {
      console.error("Failed to send password reset email:", error);

      // Parse error response properly
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          setErrors(errorData.errors);
        } else if (errorData.message) {
          // Map specific error messages to appropriate fields
          const errorMessage = errorData.message;

          if (
            errorMessage.includes("not found") ||
            errorMessage.includes("does not exist")
          ) {
            setErrors({ email: "No account found with this email address" });
          } else if (
            errorMessage.includes("invalid") ||
            errorMessage.includes("format")
          ) {
            setErrors({ email: "Please enter a valid email address" });
          } else if (
            errorMessage.includes("rate limit") ||
            errorMessage.includes("too many")
          ) {
            setErrors({ email: "Too many requests. Please try again later" });
          } else {
            setErrors({ email: errorMessage });
          }
        } else {
          setErrors({ email: "Failed to send reset email. Please try again." });
        }
      } else {
        setErrors({
          email: "Network error. Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setErrors({});
    setSuccessMessage("");
    setEmail("");
  };

  if (isEmailSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
            }}
          ></div>
          <div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              background:
                "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.12) 100%)",
            }}
          ></div>
          <div
            className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse delay-500"
            style={{
              background:
                "radial-gradient(circle, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.1) 100%)",
            }}
          ></div>
        </div>

        <div className="relative w-full max-w-md">
          <div
            className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            {/* Animated border gradient */}
            <div
              className="absolute inset-0 rounded-2xl blur-sm opacity-75 animate-pulse"
              style={{
                background:
                  "linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.4) 50%, rgba(51, 65, 85, 0.3) 100%)",
              }}
            ></div>
            <div
              className="absolute inset-[1px] rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(32, 31, 49, 0.8) 0%, rgba(26, 24, 39, 0.9) 50%, rgba(21, 20, 32, 0.8) 100%)",
              }}
            ></div>

            <div className="relative z-10">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
                Check Your Email
              </h2>
              <p className="text-slate-300 mb-6">
                We've sent a password reset link to{" "}
                <span className="text-slate-200 font-semibold">{email}</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 text-sm">{successMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleTryAgain}
                  className="w-full py-3 px-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                    boxShadow: "0 10px 25px rgba(100, 116, 139, 0.3)",
                    color: "white",
                  }}
                >
                  Try Different Email
                </button>
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 border text-white font-semibold rounded-lg hover:bg-white/5 transition-all duration-300 text-center"
                  style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Enhanced Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.12) 100%)",
          }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.1) 100%)",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Forgot Password Card */}
        <div
          className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          {/* Animated border gradient */}
          <div
            className="absolute inset-0 rounded-2xl blur-sm opacity-75 animate-pulse"
            style={{
              background:
                "linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.4) 50%, rgba(51, 65, 85, 0.3) 100%)",
            }}
          ></div>
          <div
            className="absolute inset-[1px] rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(32, 31, 49, 0.8) 0%, rgba(26, 24, 39, 0.9) 50%, rgba(21, 20, 32, 0.8) 100%)",
            }}
          ></div>

          <div className="relative z-10">
            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                }}
              >
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
                Forgot Password?
              </h2>
              <p className="text-slate-300">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Global Error Display */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-400 mr-2" />
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear email error when user starts typing
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.email
                      ? "border-red-400/60 focus:ring-red-400/50"
                      : "border-slate-500/30 focus:ring-slate-400/50"
                  }`}
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: errors.email
                      ? "2px solid rgba(248, 113, 113, 0.6)"
                      : "2px solid rgba(100, 116, 139, 0.3)",
                  }}
                />
                {errors.email && (
                  <p className="mt-2 text-red-400 text-sm flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-300 transform relative overflow-hidden group ${
                  isLoading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-105 hover:shadow-2xl"
                }`}
                style={{
                  background: isLoading
                    ? "rgba(100, 116, 139, 0.5)"
                    : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 10px 25px rgba(100, 116, 139, 0.3)",
                  color: "white",
                }}
              >
                {/* Button background animation */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                  }}
                ></div>

                <div className="relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Sending reset link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </div>
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-slate-200 font-semibold transition-colors hover:underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 Anime Info. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
