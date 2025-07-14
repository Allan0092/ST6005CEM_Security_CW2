import { useState } from "react";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGithub,
  FaGoogle,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempt:", formData);
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
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
            {/* Header */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: "0 8px 32px rgba(100, 116, 139, 0.3)",
                }}
              >
                <FaSignInAlt className="text-white text-3xl" />
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-slate-300 text-lg">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center text-slate-400">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent transition-all duration-300 text-lg"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center text-slate-400">
                    <FaLock className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-16 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent transition-all duration-300 text-lg"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-lg" />
                    ) : (
                      <FaEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded focus:ring-2 transition-all duration-300"
                    style={{
                      accentColor: "#64748b",
                    }}
                  />
                  <span className="ml-2 text-sm text-slate-300">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-300 hover:text-white transition-colors"
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
                      <FaSignInAlt className="mr-3 text-xl" />
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-6 py-2 text-slate-300 rounded-full border font-semibold"
                    style={{
                      backgroundColor: "rgba(32, 31, 49, 0.95)",
                      borderColor: "rgba(100, 116, 139, 0.4)",
                    }}
                  >
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group font-semibold text-lg"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <FaGoogle className="text-red-400 mr-4 text-xl" />
                <span>Continue with Google</span>
              </button>
              <button
                className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group font-semibold text-lg"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <FaGithub className="text-slate-400 mr-4 text-xl" />
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
      </div>
    </div>
  );
};

export default Login;
