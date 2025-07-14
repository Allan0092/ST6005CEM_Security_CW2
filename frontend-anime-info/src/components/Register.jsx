import { useEffect, useState } from "react";
import {
  FaCheck,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGithub,
  FaGoogle,
  FaLock,
  FaShieldAlt,
  FaStar,
  FaTimes,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);

  // Animated background particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles for background animation
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();

    // Staggered animation entrance
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;
    return strength;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    const valid = Object.keys(errors).length === 0;
    setIsFormValid(valid);
    return valid;
  };

  useEffect(() => {
    validateForm();
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "from-red-500 to-red-600";
    if (passwordStrength <= 2) return "from-orange-500 to-orange-600";
    if (passwordStrength <= 3) return "from-yellow-500 to-yellow-600";
    if (passwordStrength <= 4) return "from-green-500 to-green-600";
    return "from-emerald-500 to-emerald-600";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Register attempt:", formData);
    }, 3000);
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
        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.05) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.08) 0%, rgba(100, 116, 139, 0.04) 100%)",
          }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-2xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.06) 0%, rgba(51, 65, 85, 0.03) 100%)",
          }}
        ></div>
      </div>

      {/* Success testimonials floating */}
      <div
        className="absolute top-20 left-10 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-xs transform rotate-3 hover:rotate-0 transition-transform duration-500 hidden lg:block"
        style={{
          backgroundColor: "rgba(100, 116, 139, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-amber-400 text-xs" />
          ))}
        </div>
        <p>"Amazing anime discovery platform!"</p>
        <p className="text-xs text-slate-300 mt-1">- Sarah K.</p>
      </div>

      <div
        className="absolute bottom-20 right-10 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-xs transform -rotate-3 hover:rotate-0 transition-transform duration-500 hidden lg:block"
        style={{
          backgroundColor: "rgba(100, 116, 139, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-amber-400 text-xs" />
          ))}
        </div>
        <p>"Found my new favorite series here!"</p>
        <p className="text-xs text-slate-300 mt-1">- Alex M.</p>
      </div>

      <div
        className={`relative w-full max-w-md transition-all duration-1000 ${
          animationStep >= 0
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        {/* Main Register Card */}
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
            <div
              className={`text-center mb-8 transition-all duration-700 delay-200 ${
                animationStep >= 1
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                }}
              >
                <FaUserPlus className="text-white text-2xl animate-bounce" />
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-25"
                  style={{
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  }}
                ></div>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-slate-300">
                Join our anime community of 100K+ members
              </p>

              {/* Progress indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      animationStep >= step ? "bg-slate-400" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Register Form */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-6 transition-all duration-700 delay-400 ${
                animationStep >= 2
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              {/* Name Field */}
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "name"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Full name"
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    formErrors.name
                      ? "border-red-400/50 focus:ring-red-400/50"
                      : formData.name && !formErrors.name
                      ? "border-slate-400/50 focus:ring-slate-400/50"
                      : "border-slate-500/30 focus:ring-slate-400/50"
                  }`}
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: formErrors.name
                      ? "1px solid rgba(248, 113, 113, 0.5)"
                      : formData.name && !formErrors.name
                      ? "1px solid rgba(148, 163, 184, 0.5)"
                      : "1px solid rgba(100, 116, 139, 0.3)",
                  }}
                />
                {/* Success/Error indicator */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.name && !formErrors.name && (
                    <FaCheck className="text-slate-300 animate-fadeIn" />
                  )}
                  {formErrors.name && (
                    <FaTimes className="text-red-400 animate-fadeIn" />
                  )}
                </div>
                {/* Error message */}
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-400 animate-slideDown">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "email"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    formErrors.email
                      ? "border-red-400/50 focus:ring-red-400/50"
                      : formData.email && !formErrors.email
                      ? "border-slate-400/50 focus:ring-slate-400/50"
                      : "border-slate-500/30 focus:ring-slate-400/50"
                  }`}
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: formErrors.email
                      ? "1px solid rgba(248, 113, 113, 0.5)"
                      : formData.email && !formErrors.email
                      ? "1px solid rgba(148, 163, 184, 0.5)"
                      : "1px solid rgba(100, 116, 139, 0.3)",
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.email && !formErrors.email && (
                    <FaCheck className="text-slate-300 animate-fadeIn" />
                  )}
                  {formErrors.email && (
                    <FaTimes className="text-red-400 animate-fadeIn" />
                  )}
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-400 animate-slideDown">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "password"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  required
                  className={`w-full pl-10 pr-16 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: formErrors.password
                      ? "1px solid rgba(248, 113, 113, 0.5)"
                      : formData.password && !formErrors.password
                      ? "1px solid rgba(148, 163, 184, 0.5)"
                      : "1px solid rgba(100, 116, 139, 0.3)",
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                  {formData.password && !formErrors.password && (
                    <FaCheck className="text-slate-300 animate-fadeIn" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Password Strength:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength <= 1
                            ? "text-red-400"
                            : passwordStrength <= 2
                            ? "text-orange-400"
                            : passwordStrength <= 3
                            ? "text-amber-400"
                            : passwordStrength <= 4
                            ? "text-slate-300"
                            : "text-slate-200"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-2 overflow-hidden"
                      style={{ backgroundColor: "rgba(71, 85, 105, 0.3)" }}
                    >
                      <div
                        className={`h-full transition-all duration-500 ease-out`}
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
                              ? "linear-gradient(90deg, #94a3b8, #64748b)"
                              : "linear-gradient(90deg, #e2e8f0, #cbd5e1)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-400 animate-slideDown">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "confirmPassword"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  <FaShieldAlt />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm password"
                  required
                  className={`w-full pl-10 pr-16 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: formErrors.confirmPassword
                      ? "1px solid rgba(248, 113, 113, 0.5)"
                      : formData.confirmPassword &&
                        !formErrors.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "1px solid rgba(148, 163, 184, 0.5)"
                      : "1px solid rgba(100, 116, 139, 0.3)",
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                  {formData.confirmPassword &&
                    !formErrors.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <FaCheck className="text-slate-300 animate-fadeIn" />
                    )}
                  {formErrors.confirmPassword && (
                    <FaTimes className="text-red-400 animate-fadeIn" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 animate-slideDown">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Enhanced Terms and Conditions */}
              <div
                className="flex items-start space-x-3 p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.1)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                }}
              >
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 mt-1 bg-transparent border rounded focus:ring-2 transition-all duration-300"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.4)",
                    accentColor: "#64748b",
                  }}
                />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <p>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-slate-300 hover:text-slate-200 transition-colors underline-offset-2 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-slate-300 hover:text-slate-200 transition-colors underline-offset-2 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    By creating an account, you also agree to receive updates
                    about new anime releases.
                  </p>
                </div>
              </div>

              {/* Enhanced Register Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-4 px-4 font-semibold rounded-lg transition-all duration-500 transform relative overflow-hidden group ${
                  isLoading || !isFormValid
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-105 hover:shadow-2xl"
                }`}
                style={{
                  background:
                    isLoading || !isFormValid
                      ? "rgba(100, 116, 139, 0.5)"
                      : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow:
                    isLoading || !isFormValid
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

                <div className="relative flex items-center justify-center text-white">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span>Create Account</span>
                    </>
                  )}
                </div>

                {/* Loading progress bar */}
                {isLoading && (
                  <div
                    className="absolute bottom-0 left-0 h-1 animate-pulse"
                    style={{
                      width: "100%",
                      background: "#94a3b8",
                      animationDuration: "3s",
                    }}
                  ></div>
                )}
              </button>
            </form>

            {/* Enhanced Divider */}
            <div
              className={`my-8 transition-all duration-700 delay-600 ${
                animationStep >= 3
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
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

            {/* Enhanced Social Login */}
            <div
              className={`space-y-4 transition-all duration-700 delay-800 ${
                animationStep >= 4
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
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

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-slate-200 font-semibold transition-all duration-300 hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
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

export default Register;
