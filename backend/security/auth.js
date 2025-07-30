const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  changePassword,
  getMe,
  verifyOTP,
  resendOTP,
} = require("../controller/AuthController");
const { protect, authRateLimit } = require("../security/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateResendVerification,
  validateRefreshToken,
  validateEmailVerification,
  validateVerifyOTP,
  validateResendOTP,
  sanitizeInput,
} = require("../validation/authValidation");
const decryptPassword = require("../middleware/decryptPassword");

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Apply rate limiting to auth routes
router.use(authRateLimit());

// Public routes
router.post("/register", decryptPassword, validateRegister, register);
router.post("/login", decryptPassword, validateLogin, login);
router.post("/verify-otp", decryptPassword, validateVerifyOTP, verifyOTP);
router.post("/resend-otp", validateResendOTP, resendOTP);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.put(
  "/reset-password/:resetToken",
  decryptPassword,
  validateResetPassword,
  resetPassword
);
router.get("/verify-email/:token", validateEmailVerification, verifyEmail);
router.post(
  "/resend-verification",
  validateResendVerification,
  resendVerification
);
router.post("/refresh-token", validateRefreshToken, refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get("/me", getMe);
router.post("/logout", logout);
router.put(
  "/change-password",
  decryptPassword,
  validateChangePassword,
  changePassword
);

module.exports = router;
