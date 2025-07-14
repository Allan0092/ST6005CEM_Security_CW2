import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaGithub,
  FaGoogle,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempt:", formData);
    }, 2000);
  };

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
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-2xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.1) 100%)",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
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
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                }}
              >
                <FaUser className="text-white text-2xl" />
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-25"
                  style={{
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  }}
                ></div>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-slate-300">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    focusRingColor: "rgba(148, 163, 184, 0.5)",
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    focusRingColor: "rgba(148, 163, 184, 0.5)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 bg-transparent border rounded focus:ring-2 transition-all duration-300"
                    style={{
                      borderColor: "rgba(148, 163, 184, 0.4)",
                      accentColor: "#64748b",
                    }}
                  />
                  <span className="ml-2 text-sm text-slate-300">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-300 hover:text-slate-200 transition-colors underline-offset-2 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
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

                <div className="relative text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-4 text-slate-300 rounded-full border"
                    style={{
                      backgroundColor: "rgba(32, 31, 49, 0.8)",
                      borderColor: "rgba(100, 116, 139, 0.2)",
                    }}
                  >
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-center px-4 py-3 border rounded-lg text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                ></div>
                <FaGoogle className="text-red-400 mr-3 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">Continue with Google</span>
              </button>
              <button
                className="w-full flex items-center justify-center px-4 py-3 border rounded-lg text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(100, 116, 139, 0.1)" }}
                ></div>
                <FaGithub className="text-slate-400 mr-3 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">Continue with GitHub</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-slate-300 hover:text-slate-200 font-semibold transition-colors hover:underline underline-offset-2"
                >
                  Sign up
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

export default Login;
