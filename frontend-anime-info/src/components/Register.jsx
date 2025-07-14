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
  const [touchedFields, setTouchedFields] = useState({}); // Track which fields have been touched

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

  // Form validation - only show errors for touched fields
  const validateForm = () => {
    const errors = {};

    // Only validate fields that have been touched
    if (touchedFields.name && !formData.name.trim()) {
      errors.name = "Name is required";
    } else if (touchedFields.name && formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (touchedFields.email && !formData.email) {
      errors.email = "Email is required";
    } else if (touchedFields.email && !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (touchedFields.password && !formData.password) {
      errors.password = "Password is required";
    } else if (touchedFields.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (
      touchedFields.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);

    // Check if form is valid (all fields filled, no errors, and at least one field has been touched)
    const allFieldsFilled =
      formData.name.trim() &&
      formData.email &&
      formData.password &&
      formData.confirmPassword;
    const noErrors = Object.keys(errors).length === 0;
    const hasBeenTouched = Object.keys(touchedFields).length > 0;

    const valid = allFieldsFilled && noErrors && hasBeenTouched;
    setIsFormValid(valid);
    return valid;
  };

  useEffect(() => {
    validateForm();
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData, touchedFields]);

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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark field as touched when user starts typing
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (fieldName) => {
    setFocusedField(null);
    // Mark field as touched when user leaves the field
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched on submit attempt
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

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

        {/* Enhanced Gradient orbs - More visible */}
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
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.15) 100%)",
          }}
        ></div>
      </div>

      {/* Floating testimonials - simplified and more elegant */}
      <div
        className="absolute top-16 left-8 backdrop-blur-sm rounded-xl p-4 text-white text-sm max-w-xs transform hover:scale-105 transition-all duration-500 hidden lg:block"
        style={{
          backgroundColor: "rgba(100, 116, 139, 0.2)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-amber-400 text-sm mr-1" />
          ))}
        </div>
        <p className="text-slate-200 font-medium">
          "Amazing anime discovery platform!"
        </p>
        <p className="text-xs text-slate-400 mt-2">- Sarah K., Anime Fan</p>
      </div>

      <div
        className="absolute bottom-16 right-8 backdrop-blur-sm rounded-xl p-4 text-white text-sm max-w-xs transform hover:scale-105 transition-all duration-500 hidden lg:block"
        style={{
          backgroundColor: "rgba(100, 116, 139, 0.2)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-amber-400 text-sm mr-1" />
          ))}
        </div>
        <p className="text-slate-200 font-medium">
          "Found my new favorite series!"
        </p>
        <p className="text-xs text-slate-400 mt-2">- Alex M., Otaku</p>
      </div>

      <div
        className={`relative w-full max-w-lg transition-all duration-1000 ${
          animationStep >= 0
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        {/* Main Register Card - Enhanced and simplified */}
        <div
          className="backdrop-blur-xl rounded-3xl shadow-2xl p-10 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.2)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Simplified animated border */}
          <div
            className="absolute inset-0 rounded-3xl opacity-50 animate-pulse"
            style={{
              background:
                "linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.3) 50%, rgba(51, 65, 85, 0.2) 100%)",
            }}
          ></div>
          <div
            className="absolute inset-[1px] rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(32, 31, 49, 0.95) 0%, rgba(26, 24, 39, 0.98) 50%, rgba(21, 20, 32, 0.95) 100%)",
            }}
          ></div>

          <div className="relative z-10">
            {/* Header - Simplified and more elegant */}
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
                <FaUserPlus className="text-white text-3xl" />
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  }}
                ></div>
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-slate-300 text-lg">Join our anime community</p>
              <p className="text-slate-400 text-sm mt-1">
                100K+ members worldwide
              </p>
            </div>

            {/* Register Form - Improved spacing */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-8 transition-all duration-700 delay-400 ${
                animationStep >= 2
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              {/* Name Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-colors duration-300 ${
                      focusedField === "name"
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    <FaUser className="text-lg" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter your full name"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      formErrors.name
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : formData.name && !formErrors.name
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: formErrors.name
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : formData.name && !formErrors.name
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {formData.name && !formErrors.name && (
                      <FaCheck className="text-emerald-400 text-lg animate-fadeIn" />
                    )}
                    {formErrors.name && (
                      <FaTimes className="text-red-400 text-lg animate-fadeIn" />
                    )}
                  </div>
                </div>
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-400 animate-slideDown pl-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field - Perfect icon alignment */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-colors duration-300 ${
                      focusedField === "email"
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    <FaEnvelope className="text-lg" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => handleBlur("email")}
                    placeholder="Enter your email address"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      formErrors.email
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : formData.email && !formErrors.email
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: formErrors.email
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : formData.email && !formErrors.email
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {formData.email && !formErrors.email && (
                      <FaCheck className="text-emerald-400 text-lg animate-fadeIn" />
                    )}
                    {formErrors.email && (
                      <FaTimes className="text-red-400 text-lg animate-fadeIn" />
                    )}
                  </div>
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-400 animate-slideDown pl-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field - Perfect icon alignment */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-colors duration-300 ${
                      focusedField === "password"
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    <FaLock className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => handleBlur("password")}
                    placeholder="Create a strong password"
                    required
                    className={`w-full pl-12 pr-20 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: formErrors.password
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : formData.password && !formErrors.password
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {formData.password && !formErrors.password && (
                      <FaCheck className="text-emerald-400 text-lg animate-fadeIn" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition-colors focus:outline-none p-1"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-lg" />
                      ) : (
                        <FaEye className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 font-medium">
                        Password Strength:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          passwordStrength <= 1
                            ? "text-red-400"
                            : passwordStrength <= 2
                            ? "text-orange-400"
                            : passwordStrength <= 3
                            ? "text-amber-400"
                            : passwordStrength <= 4
                            ? "text-emerald-400"
                            : "text-emerald-300"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-3 overflow-hidden"
                      style={{ backgroundColor: "rgba(71, 85, 105, 0.4)" }}
                    >
                      <div
                        className={`h-full transition-all duration-700 ease-out rounded-full`}
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

                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-400 animate-slideDown pl-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field - Perfect icon alignment */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-colors duration-300 ${
                      focusedField === "confirmPassword"
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    <FaShieldAlt className="text-lg" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirm your password"
                    required
                    className={`w-full pl-12 pr-20 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: formErrors.confirmPassword
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : formData.confirmPassword &&
                          !formErrors.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {formData.confirmPassword &&
                      !formErrors.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <FaCheck className="text-emerald-400 text-lg animate-fadeIn" />
                      )}
                    {formErrors.confirmPassword && (
                      <FaTimes className="text-red-400 text-lg animate-fadeIn" />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-slate-400 hover:text-white transition-colors focus:outline-none p-1"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-lg" />
                      ) : (
                        <FaEye className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400 animate-slideDown pl-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Elegant Terms and Conditions */}
              <div
                className="flex items-start space-x-4 p-6 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.2)",
                  border: "1px solid rgba(100, 116, 139, 0.4)",
                }}
              >
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 mt-1 bg-transparent border-2 rounded focus:ring-2 transition-all duration-300"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.5)",
                    accentColor: "#64748b",
                  }}
                />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <p>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-slate-200 hover:text-white transition-colors underline-offset-2 hover:underline font-semibold"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-slate-200 hover:text-white transition-colors underline-offset-2 hover:underline font-semibold"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>

              {/* Enhanced Register Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-5 px-6 font-bold rounded-xl transition-all duration-500 transform relative overflow-hidden group text-lg ${
                  isLoading || !isFormValid
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-[1.02] hover:shadow-2xl"
                }`}
                style={{
                  background:
                    isLoading || !isFormValid
                      ? "rgba(100, 116, 139, 0.5)"
                      : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow:
                    isLoading || !isFormValid
                      ? "none"
                      : "0 15px 35px rgba(100, 116, 139, 0.4)",
                }}
              >
                {/* Button background animation */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"
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
                      <FaUserPlus className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                      <span>Create Account</span>
                    </>
                  )}
                </div>

                {/* Loading progress bar */}
                {isLoading && (
                  <div
                    className="absolute bottom-0 left-0 h-1 rounded-full animate-pulse"
                    style={{
                      width: "100%",
                      background: "#94a3b8",
                      animationDuration: "3s",
                    }}
                  ></div>
                )}
              </button>
            </form>

            {/* Elegant Divider */}
            <div
              className={`my-10 transition-all duration-800 delay-600 ${
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
                    className="px-8 py-2 text-slate-300 rounded-full border font-semibold"
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

            {/* Enhanced Social Login */}
            <div
              className={`space-y-4 transition-all duration-800 delay-800 ${
                animationStep >= 4
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <button
                className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden font-semibold text-lg"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                ></div>
                <FaGoogle className="text-red-400 mr-4 group-hover:scale-110 transition-transform duration-300 relative z-10 text-xl" />
                <span className="relative z-10">Continue with Google</span>
              </button>
              <button
                className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 group relative overflow-hidden font-semibold text-lg"
                style={{ borderColor: "rgba(148, 163, 184, 0.4)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: "rgba(100, 116, 139, 0.1)" }}
                ></div>
                <FaGithub className="text-slate-400 mr-4 group-hover:scale-110 transition-transform duration-300 relative z-10 text-xl" />
                <span className="relative z-10">Continue with GitHub</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="mt-12 text-center">
              <p className="text-slate-400 text-lg">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-slate-200 hover:text-white font-bold transition-all duration-300 hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Elegant Footer */}
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
