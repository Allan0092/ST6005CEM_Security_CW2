import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Animation sequence
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStep(1), 100);
    return () => clearTimeout(timer);
  }, []);

  // Password strength calculation 
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "text-red-400";
    if (passwordStrength <= 2) return "text-orange-400";
    if (passwordStrength <= 3) return "text-amber-400";
    if (passwordStrength <= 4) return "text-emerald-400";
    return "text-emerald-300";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Very Weak";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Excellent";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {

      const response = await authAPI.resetPassword(resetToken, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setResetSuccess(true);
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successful! Please log in with your new password.",
            },
          });
        }, 3000);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors({
            general: response.message || "Failed to reset password",
          });
        }
      }
    } catch (error) {

      // Check if it's a response error with data
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // First, check if there are structured errors
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else if (errorData.message) {

          const errorMessage = errorData.message;

          if (
            errorMessage.includes("expired") ||
            errorMessage.includes("invalid")
          ) {
            setErrors({
              token:
                "Reset link has expired or is invalid. Please request a new one.",
            });
          } else if (
            errorMessage.includes(
              "New password must be different from current password"
            )
          ) {
            setErrors({
              password:
                "New password must be different from your current password",
            });
          } else if (
            errorMessage.includes(
              "New password must be different from previous passwords"
            )
          ) {
            setErrors({
              password:
                "New password must be different from your previous passwords",
            });
          } else if (errorMessage.includes("Passwords do not match")) {
            setErrors({
              confirmPassword: "Passwords do not match",
            });
          } else {
            setErrors({ general: errorMessage });
          }
        } else {
          setErrors({ general: "Failed to reset password. Please try again." });
        }
      } else {
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success screen
  if (resetSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
            }}
          ></div>
        </div>

        <div className="relative text-center">
          <div
            className="backdrop-blur-lg rounded-2xl shadow-2xl p-12 max-w-md mx-auto"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <FaCheck className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-slate-300 mb-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <div className="animate-pulse text-slate-400">
              Redirecting to login page...
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
          className={`backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative overflow-hidden transition-all duration-700 ${
            animationStep >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
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
                <FaLock className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <p className="text-slate-300">Enter your new password below</p>
            </div>

            {/* Token Error Display */}
            {errors.token && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-400 mr-2" />
                  <p className="text-red-400 text-sm">{errors.token}</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-red-300 hover:text-red-200 underline text-sm mt-2 block"
                >
                  Request a new reset link
                </Link>
              </div>
            )}

            {/* General Error Display */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-400 mr-2" />
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Reset Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      errors.password
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: errors.password
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-red-400 text-sm flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.password}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 font-medium">
                        Password Strength:
                      </span>
                      <span
                        className={`text-sm font-bold ${getPasswordStrengthColor()}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-3 overflow-hidden"
                      style={{ backgroundColor: "rgba(71, 85, 105, 0.4)" }}
                    >
                      <div
                        className="h-full transition-all duration-700 ease-out rounded-full"
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          background:
                            passwordStrength <= 1
                              ? "linear-gradient(90deg, #ef4444, #dc2626)"
                              : passwordStrength <= 2
                              ? "linear-gradient(90deg, #f97316, #ea580c)"
                              : passwordStrength <= 3
                              ? "linear-gradient(90deg, #f59e0b, #d97706)"
                              : passwordStrength <= 4
                              ? "linear-gradient(90deg, #10b981, #059669)"
                              : "linear-gradient(90deg, #34d399, #10b981)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      errors.confirmPassword
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: errors.confirmPassword
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {formData.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <FaCheck className="text-emerald-400 text-lg" />
                      )}
                    {errors.confirmPassword && (
                      <FaTimes className="text-red-400 text-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-slate-400 hover:text-white transition-colors focus:outline-none p-1"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-400 text-sm flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.25)",
                  border: "1px solid rgba(100, 116, 139, 0.3)",
                }}
              >
                <p className="text-slate-300 text-sm font-medium mb-2">
                  Password Requirements:
                </p>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character (@$!%*?&)</li>
                </ul>
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
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
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

export default ResetPassword;
