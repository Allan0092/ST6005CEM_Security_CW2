import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaLock,
  FaSignInAlt,
  FaStar,
  FaShieldAlt,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [animationStep, setAnimationStep] = useState(0);

  // Get message from registration redirect
  const message = location.state?.message;
  const prefillEmail = location.state?.email;

  // Animation sequence
  useEffect(() => {
    const sequence = [0, 1, 2, 3, 4];
    sequence.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), index * 200);
    });

    // Prefill email if coming from registration
    if (prefillEmail) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      const credentials = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

      const result = await login(credentials);

      if (result.success) {
        // Check if OTP verification is required
        if (result.requiresOTP) {
          console.log('OTP required, redirecting with data:', result.data);
          navigate("/verify-otp", {
            state: {
              email: formData.email.toLowerCase().trim(),
              otpExpires: result.data.otpExpires,
            },
          });
          return;
        }

        // Normal login success 
        navigate("/dashboard");
      } else {
        // Handle login errors
        if (result.error.includes("verified")) {
          setErrors({
            general: result.error,
            showResendVerification: true,
          });
        } else if (
          result.error.includes("email") ||
          result.error.includes("password")
        ) {
          setErrors({
            credentials: "Invalid email or password. Please try again.",
          });
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({
        general: "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.4) 0%, rgba(71, 85, 105, 0.2) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.35) 0%, rgba(100, 116, 139, 0.18) 100%)",
          }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-lg">
        {/* Login Card */}
        <div
          className="backdrop-blur-xl rounded-3xl shadow-2xl p-10 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.2)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="relative z-10">
            {/* Success message from registration */}
            {message && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-400 text-sm">{message}</p>
              </div>
            )}

            {/* Header */}
            <div
              className={`text-center mb-10 transition-all duration-700 delay-200 ${
                animationStep >= 1
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: "0 8px 32px rgba(100, 116, 139, 0.3)",
                }}
              >
                <FaSignInAlt className="text-white text-3xl" />
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  }}
                ></div>
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-slate-300 text-lg">Sign in to your account</p>
            </div>

            {/* Error Messages */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
                {errors.showResendVerification && (
                  <Link
                    to="/auth/resend-verification"
                    className="text-red-300 hover:text-red-200 underline text-sm mt-2 block"
                  >
                    Resend verification email
                  </Link>
                )}
              </div>
            )}

            {errors.credentials && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.credentials}</p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-6 transition-all duration-700 delay-400 ${
                animationStep >= 2
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              {/* Email Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaEnvelope className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      errors.email || errors.credentials
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border:
                        errors.email || errors.credentials
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      errors.password || errors.credentials
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border:
                        errors.password || errors.credentials
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-slate-600 border-slate-500 rounded focus:ring-slate-500"
                  />
                  <span className="ml-2 text-sm text-slate-300">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 font-bold rounded-xl transition-all duration-500 transform relative overflow-hidden group text-lg ${
                  isLoading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-[1.02] hover:shadow-2xl"
                }`}
                style={{
                  background: isLoading
                    ? "rgba(100, 116, 139, 0.5)"
                    : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 15px 35px rgba(100, 116, 139, 0.4)",
                }}
              >
                <div className="relative flex items-center justify-center text-white">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Social Login */}
            <div
              className={`my-8 transition-all duration-800 delay-600 ${
                animationStep >= 3
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-6 py-2 text-slate-300 rounded-full font-medium"
                    style={{
                      backgroundColor: "rgba(32, 31, 49, 0.95)",
                      border: "1px solid rgba(100, 116, 139, 0.4)",
                    }}
                  >
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Social Buttons */}
            <div
              className={`space-y-3 transition-all duration-800 delay-800 ${
                animationStep >= 4
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <button
                className="w-full flex items-center justify-center px-4 py-3 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden font-medium"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <FaGoogle className="text-red-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span>Continue with Google</span>
              </button>
              <button
                className="w-full flex items-center justify-center px-4 py-3 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden font-medium"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <FaGithub className="text-slate-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-lg">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-slate-200 hover:text-white font-bold transition-all duration-300 hover:underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center">
            <FaShieldAlt className="mr-2 text-slate-400" />© 2025 Anime Info.
            Your data is secure with us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
