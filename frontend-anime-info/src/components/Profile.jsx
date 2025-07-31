import { useEffect, useState } from "react";
import {
  FaCamera,
  FaCheck,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSave,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { authAPI, userAPI } from "../utils/api";
import CountrySelect from "./CountrySelect";
import Footer from "./Footer";

const Profile = () => {
  const { user, checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [animationStep, setAnimationStep] = useState(0);

  // General Information State
  const [generalData, setGeneralData] = useState({
    name: "",
    username: "",
    country: "",
  });

  // Email Change State
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Avatar State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Show/Hide Password States
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false,
  });

  // Animation sequence
  useEffect(() => {
    const sequence = [0, 1, 2, 3];
    sequence.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), index * 200);
    });
  }, []);

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setGeneralData({
        name: user.name || "",
        username: user.username || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCountryChange = (countryCode) => {
    setGeneralData((prev) => ({ ...prev, country: countryCode }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ avatar: "Please select a valid image file" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: "Image size must be less than 5MB" });
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  const validateGeneralForm = () => {
    const newErrors = {};

    if (!generalData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (generalData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (generalData.name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (!generalData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (generalData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (generalData.username.length > 30) {
      newErrors.username = "Username cannot exceed 30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(generalData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    return newErrors;
  };

  const validateEmailForm = () => {
    const newErrors = {};

    if (!emailData.newEmail.trim()) {
      newErrors.newEmail = "New email is required";
    } else if (!isValidEmail(emailData.newEmail)) {
      newErrors.newEmail = "Please enter a valid email";
    } else if (emailData.newEmail === user?.email) {
      newErrors.newEmail = "New email must be different from current email";
    }

    if (!emailData.password) {
      newErrors.password = "Current password is required";
    }

    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!isStrongPassword(passwordData.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    return newErrors;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
      password
    );
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateGeneralForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await userAPI.updateProfile(generalData);

      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        await checkAuthStatus(); // Refresh user data
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      if (error.message.includes("username")) {
        setErrors({ username: "Username is already taken" });
      } else {
        setErrors({ general: error.message || "Failed to update profile" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateEmailForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await userAPI.updateEmail(emailData);

      if (response.success) {
        setSuccessMessage("Verification email sent to your new email address!");
        setEmailData({ newEmail: "", password: "" });
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      setErrors({ email: error.message || "Failed to update email" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      });

      if (response.success) {
        setSuccessMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setErrors({ password: error.message || "Failed to change password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSubmit = async () => {
    if (!avatarFile) {
      setErrors({ avatar: "Please select an image" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await userAPI.uploadAvatar(formData);

      if (response.success) {
        setSuccessMessage("Avatar updated successfully!");
        await checkAuthStatus(); // Refresh user data
        setAvatarFile(null);
        setAvatarPreview(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setErrors({ avatar: error.message || "Failed to upload avatar" });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (avatarPreview) return avatarPreview;
    if (!avatar) return "/images/avatar-placeholder.jpg";
    if (avatar.startsWith("https")) return avatar;
    if (avatar.includes("/uploads/")) return `https://localhost:3000${avatar}`;
    return "/images/avatar-placeholder.jpg";
  };

  const tabs = [
    { id: "general", label: "General", icon: FaUser },
    { id: "avatar", label: "Avatar", icon: FaCamera },
    { id: "email", label: "Email", icon: FaEnvelope },
    { id: "password", label: "Password", icon: FaLock },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Background Effects */}
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

      {/* Header */}
      <div
        className={`backdrop-blur-lg border-b p-6 relative z-10 transition-all duration-700 ${
          animationStep >= 0
            ? "translate-y-0 opacity-100"
            : "translate-y-5 opacity-0"
        }`}
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          borderColor: "rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent flex items-center justify-center">
            <FaUser className="text-slate-300 mr-3" />
            Profile Settings
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto p-6 relative z-10 w-full">
        {/* Success Message */}
        {successMessage && (
          <div
            className={`mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all duration-700 ${
              animationStep >= 1
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            <div className="flex items-center">
              <FaCheck className="text-emerald-400 mr-2" />
              <p className="text-emerald-400 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div
          className={`backdrop-blur-lg border rounded-t-2xl mb-0 transition-all duration-700 delay-200 ${
            animationStep >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-white border-b-2 border-slate-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <IconComponent className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className={`backdrop-blur-lg border rounded-b-2xl rounded-t-none p-8 transition-all duration-700 delay-300 ${
            animationStep >= 2
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderTop: "none",
          }}
        >
          {/* General Information Tab */}
          {activeTab === "general" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  General Information
                </h2>
                <p className="text-slate-400">
                  Update your basic profile information
                </p>
              </div>

              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={generalData.name}
                      onChange={handleGeneralChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.name
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.name
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEdit className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={generalData.username}
                      onChange={handleGeneralChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.username
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.username
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.username}
                    </p>
                  )}
                  <p className="mt-1 text-slate-500 text-sm">
                    Username can only contain letters, numbers, and underscores
                  </p>
                </div>

                {/* Country Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Country
                  </label>
                  <CountrySelect
                    value={generalData.country}
                    onChange={handleCountryChange}
                    error={errors.country}
                    placeholder="Select your country"
                  />
                  {errors.country && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

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
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === "avatar" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Profile Picture
                </h2>
                <p className="text-slate-400">Upload a new profile picture</p>
              </div>

              <div className="space-y-6">
                {/* Current Avatar */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={getAvatarUrl(user?.avatar)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-slate-400/50 object-cover"
                      onError={(e) => {
                        e.target.src = "/images/avatar-placeholder.jpg";
                      }}
                    />
                    {avatarPreview && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Choose New Avatar
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      errors.avatar
                        ? "border-red-400/60"
                        : "border-slate-500/50 hover:border-slate-400/70"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCamera className="text-4xl text-slate-400 mb-4" />
                      <p className="text-slate-300 mb-2">
                        Click to upload a new picture
                      </p>
                      <p className="text-slate-500 text-sm">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                  {errors.avatar && (
                    <p className="mt-2 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.avatar}
                    </p>
                  )}
                </div>

                {/* Preview and Upload Button */}
                {avatarFile && (
                  <div className="text-center space-y-4">
                    <p className="text-slate-300">
                      Selected: {avatarFile.name}
                    </p>
                    <button
                      onClick={handleAvatarSubmit}
                      disabled={isLoading}
                      className={`inline-flex items-center px-6 py-3 font-bold rounded-lg transition-all duration-300 ${
                        isLoading
                          ? "cursor-not-allowed opacity-50"
                          : "hover:scale-105"
                      }`}
                      style={{
                        background: isLoading
                          ? "rgba(100, 116, 139, 0.5)"
                          : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                        color: "white",
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaCamera className="mr-2" />
                          Upload Avatar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Email Address
                </h2>
                <p className="text-slate-400">Update your email address</p>
              </div>

              {/* Current Email */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.25)",
                  border: "1px solid rgba(100, 116, 139, 0.3)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Current Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div className="flex items-center">
                    {user?.isEmailVerified ? (
                      <div className="flex items-center text-emerald-400">
                        <FaCheck className="mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400">
                        <FaTimes className="mr-1" />
                        <span className="text-sm">Unverified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {/* New Email Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    New Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="newEmail"
                      value={emailData.newEmail}
                      onChange={handleEmailChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.newEmail
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.newEmail
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Enter new email address"
                    />
                  </div>
                  {errors.newEmail && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.newEmail}
                    </p>
                  )}
                </div>

                {/* Current Password Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type={showPasswords.emailPassword ? "text" : "password"}
                      name="password"
                      value={emailData.password}
                      onChange={handleEmailChange}
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
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          emailPassword: !prev.emailPassword,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showPasswords.emailPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Warning Message */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <p className="text-amber-400 text-sm">
                    <strong>Important:</strong> You will need to verify your new
                    email address before you can use it to log in.
                  </p>
                </div>

                {/* Error Message */}
                {errors.email && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  </div>
                )}

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
                        <span>Updating Email...</span>
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                        <span>Update Email</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Change Password
                </h2>
                <p className="text-slate-400">Update your account password</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.currentPassword
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.currentPassword
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

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
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.newPassword
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.newPassword
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.confirmNewPassword
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.confirmNewPassword
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-red-400 text-sm flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.confirmNewPassword}
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

                {/* Error Message */}
                {errors.password && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  </div>
                )}

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
                        <span>Changing Password...</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                        <span>Change Password</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
