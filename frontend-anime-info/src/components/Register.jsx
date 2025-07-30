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
  FaTimes,
  FaUser,
  FaUserPlus,
  FaGlobe,
  FaUserTag,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import countryList from "react-select-country-list";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Get country options
  const countries = countryList().getData();

  // Animation sequence
  useEffect(() => {
    const sequence = [0, 1, 2, 3, 4];
    sequence.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), index * 200);
    });
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

  // Form validation
  const validateForm = (showAllErrors = false) => {
    const errors = {};

    // Name validation
    if (showAllErrors || touchedFields.name) {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name)) {
        errors.name =
          "Name can only contain letters, spaces, hyphens, and apostrophes";
      }
    }

    // Username validation
    if (showAllErrors || touchedFields.username) {
      if (!formData.username.trim()) {
        errors.username = "Username is required";
      } else if (formData.username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters";
      } else if (formData.username.trim().length > 30) {
        errors.username = "Username cannot exceed 30 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        errors.username = "Username can only contain letters, numbers, and underscores";
      }
    }

    // Email validation
    if (showAllErrors || touchedFields.email) {
      if (!formData.email) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Country validation
    if (showAllErrors || touchedFields.country) {
      if (!formData.country) {
        errors.country = "Country is required";
      }
    }

    // Password validation
    if (showAllErrors || touchedFields.password) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else {
        if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else if (
          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
            formData.password
          )
        ) {
          errors.password =
            "Password must contain uppercase, lowercase, number, and special character";
        }
      }
    }

    // Confirm password validation
    if (showAllErrors || touchedFields.confirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    // Terms validation
    if (showAllErrors) {
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = "You must agree to the terms of service";
      }
    }

    return errors;
  };

  // Check if form is valid
  const checkFormValidity = () => {
    const hasName =
      formData.name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(formData.name);
    const hasUsername =
      formData.username.trim().length >= 3 && 
      formData.username.trim().length <= 30 && 
      /^[a-zA-Z0-9_]+$/.test(formData.username);
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const hasCountry = formData.country.trim().length > 0;
    const hasValidPassword =
      formData.password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password);
    const passwordsMatch =
      formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0;
    const termsAccepted = formData.agreeToTerms;

    return (
      hasName &&
      hasUsername &&
      hasValidEmail &&
      hasCountry &&
      hasValidPassword &&
      passwordsMatch &&
      termsAccepted
    );
  };

  // Update validation on field changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
    setFormErrors(validateForm(false));
    setIsFormValid(checkFormValidity());
  }, [formData, touchedFields]);

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Mark field as touched when user starts typing
    if (value.length > 0 || type === "checkbox") {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const handleBlur = (fieldName) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched for final validation
    const allTouched = {
      name: true,
      username: true,
      email: true,
      country: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    };
    setTouchedFields(allTouched);

    // Validate all fields
    const allErrors = validateForm(true);
    setFormErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.toLowerCase().trim(),
        country: formData.country.trim(),
        password: formData.password,
        agreeToTerms: formData.agreeToTerms,
      };

      const result = await registerUser(registrationData);

      if (result.success) {
        setRegistrationSuccess(true);
        // Auto-redirect after showing success message
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Registration successful! Please check your email to verify your account.",
              email: formData.email,
            },
          });
        }, 3000);
      } else {
        // Handle registration errors
        if (result.error.includes("email")) {
          setFormErrors({ email: result.error });
        } else if (result.error.includes("username")) {
          setFormErrors({ username: result.error });
        } else {
          setFormErrors({ general: result.error });
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setFormErrors({
        general: "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine if field should show error styling
  const shouldShowFieldError = (fieldName) => {
    return touchedFields[fieldName] && formErrors[fieldName];
  };

  // Helper function to determine if field should show success styling
  const shouldShowFieldSuccess = (fieldName) => {
    return (
      touchedFields[fieldName] && !formErrors[fieldName] && formData[fieldName]
    );
  };

  // Show success message
  if (registrationSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Registration Successful!
          </h2>
          <p className="text-slate-300 mb-6 max-w-md">
            Please check your email to verify your account before logging in.
          </p>
          <div className="animate-pulse text-slate-400">
            Redirecting to login page...
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
      {/* Background animations */}
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

      <div
        className={`relative w-full max-w-lg transition-all duration-1000 ${
          animationStep >= 0
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
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
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-slate-300 text-lg">Join our anime community</p>
            </div>

            {/* Show general error */}
            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{formErrors.general}</p>
              </div>
            )}

            {/* Form */}
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
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaUser className="text-slate-400" />
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
                      shouldShowFieldError("name")
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : shouldShowFieldSuccess("name")
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("name")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("name")
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {shouldShowFieldSuccess("name") && (
                      <FaCheck className="text-emerald-400 text-lg" />
                    )}
                    {shouldShowFieldError("name") && (
                      <FaTimes className="text-red-400 text-lg" />
                    )}
                  </div>
                </div>
                {shouldShowFieldError("name") && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.name}</p>
                )}
              </div>

              {/* Username Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaUserTag className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => handleBlur("username")}
                    placeholder="Choose a unique username"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      shouldShowFieldError("username")
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : shouldShowFieldSuccess("username")
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("username")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("username")
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {shouldShowFieldSuccess("username") && (
                      <FaCheck className="text-emerald-400 text-lg" />
                    )}
                    {shouldShowFieldError("username") && (
                      <FaTimes className="text-red-400 text-lg" />
                    )}
                  </div>
                </div>
                {shouldShowFieldError("username") && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.username}</p>
                )}
                {formData.username && !shouldShowFieldError("username") && (
                  <p className="mt-1 text-xs text-slate-400">
                    3-30 characters, letters, numbers, and underscores only
                  </p>
                )}
              </div>

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
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => handleBlur("email")}
                    placeholder="Enter your email address"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      shouldShowFieldError("email")
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : shouldShowFieldSuccess("email")
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("email")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("email")
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {shouldShowFieldSuccess("email") && (
                      <FaCheck className="text-emerald-400 text-lg" />
                    )}
                    {shouldShowFieldError("email") && (
                      <FaTimes className="text-red-400 text-lg" />
                    )}
                  </div>
                </div>
                {shouldShowFieldError("email") && (
                  <p className="mt-2 text-sm text-red-400">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Country Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaGlobe className="text-slate-400" />
                  </div>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("country")}
                    onBlur={() => handleBlur("country")}
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                      shouldShowFieldError("country")
                        ? "border-red-400/60 focus:ring-red-400/50"
                        : shouldShowFieldSuccess("country")
                        ? "border-emerald-400/60 focus:ring-emerald-400/50"
                        : "border-slate-500/30 focus:ring-slate-400/50"
                    }`}
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("country")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("country")
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  >
                    <option value="" style={{ backgroundColor: "#475569", color: "#e2e8f0" }}>
                      Select your country
                    </option>
                    {countries.map((country) => (
                      <option 
                        key={country.value} 
                        value={country.label}
                        style={{ backgroundColor: "#475569", color: "#e2e8f0" }}
                      >
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                    {shouldShowFieldSuccess("country") && (
                      <FaCheck className="text-emerald-400 text-lg" />
                    )}
                    {shouldShowFieldError("country") && (
                      <FaTimes className="text-red-400 text-lg" />
                    )}
                  </div>
                </div>
                {shouldShowFieldError("country") && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.country}</p>
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
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => handleBlur("password")}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-12 pr-20 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("password")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("password")
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {shouldShowFieldSuccess("password") && (
                      <FaCheck className="text-emerald-400 text-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition-colors focus:outline-none p-1"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

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

                {shouldShowFieldError("password") && (
                  <p className="mt-2 text-sm text-red-400">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center">
                    <FaShieldAlt className="text-slate-400" />
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
                    className="w-full pl-12 pr-20 py-4 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.25)",
                      border: shouldShowFieldError("confirmPassword")
                        ? "2px solid rgba(248, 113, 113, 0.6)"
                        : shouldShowFieldSuccess("confirmPassword") &&
                          formData.password === formData.confirmPassword
                        ? "2px solid rgba(52, 211, 153, 0.6)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {shouldShowFieldSuccess("confirmPassword") &&
                      formData.password === formData.confirmPassword && (
                        <FaCheck className="text-emerald-400 text-lg" />
                      )}
                    {shouldShowFieldError("confirmPassword") && (
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
                {shouldShowFieldError("confirmPassword") && (
                  <p className="mt-2 text-sm text-red-400">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div
                className="flex items-start space-x-4 p-6 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.2)",
                  border: "1px solid rgba(100, 116, 139, 0.4)",
                }}
              >
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
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
                  {formErrors.agreeToTerms && (
                    <p className="mt-1 text-red-400 text-xs">
                      {formErrors.agreeToTerms}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
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

export default Register;
