const crypto = require("crypto");
const User = require("../model/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          country: user.country,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
};

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      country,
      password,
      agreeToTerms,
      marketingEmails,
    } = req.validatedData;

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
        errors: { email: "User with this email already exists" },
        data: null,
      });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
        errors: { username: "Username is already taken" },
        data: null,
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create user
    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      country: country.trim(),
      password,
      emailVerificationToken: hashedVerificationToken,
      preferences: {
        marketingEmails: marketingEmails || false,
      },
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      const message = `
        <h1>Welcome to AnimeInfo!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with AnimeInfo. Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email Address</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>The AnimeInfo Team</p>
      `;

      await sendEmail({
        email: user.email,
        subject: "Verify Your AnimeInfo Account",
        message,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email sending fails
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          country: user.country,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: "Registration failed - Validation error",
        errors,
        data: null,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message =
        field === "email" ? "Email already exists" : "Username already taken";

      return res.status(400).json({
        success: false,
        message: "Registration failed",
        errors: { [field]: message },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed - Server error",
      errors: { server: "Internal server error during registration" },
      data: null,
    });
  }
};

/**
 * @desc    Login user (Step 1: Verify credentials and send OTP)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.validatedData;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: { credentials: "Invalid email or password" },
        data: null,
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Email verification required",
        errors: {
          verification: "Please verify your email before logging in",
        },
        data: null,
      });
    }

    // Generate OTP and send email
    const otpCode = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const otpMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #64748b; text-align: center;">Login Verification</h1>
          <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin-bottom: 20px;">Your OTP Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #64748b; letter-spacing: 5px;">${otpCode}</span>
            </div>
            <p style="color: white; margin-bottom: 10px;">This code will expire in 10 minutes</p>
            <p style="color: white; font-size: 14px;">If you didn't request this login, please ignore this email.</p>
          </div>
          <p style="text-align: center; color: #6b7280; margin-top: 20px;">
            Best regards,<br>The AnimeInfo Team
          </p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: "AnimeInfo - Login Verification Code",
        message: otpMessage,
      });

      res.status(200).json({
        success: true,
        message: "OTP sent to your email. Please verify to complete login.",
        data: {
          requiresOTP: true,
          email: user.email,
          otpExpires: user.otpExpires,
        },
      });
    } catch (emailError) {
      console.error("OTP email sending failed:", emailError);

      // Clear OTP data if email fails
      user.otpCode = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        errors: { email: "Could not send verification code" },
        data: null,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed - Server error",
      errors: { server: "Internal server error during login" },
      data: null,
    });
  }
};

/**
 * @desc    Verify OTP and complete login
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.validatedData;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { email: "User not found" },
        data: null,
      });
    }

    // Verify OTP
    const otpResult = user.verifyOTP(otpCode);

    if (!otpResult.success) {
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: otpResult.error,
        errors: { otp: otpResult.error },
        data: {
          attemptsRemaining: Math.max(0, 5 - user.otpAttempts),
        },
      });
    }

    // OTP verified successfully - complete login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Resend OTP code
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { email: "User not found" },
        data: null,
      });
    }

    // Check if user can request new OTP (rate limiting)
    if (user.otpLastAttempt && Date.now() - user.otpLastAttempt < 60000) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting a new OTP",
        errors: { rateLimit: "Too frequent requests" },
        data: null,
      });
    }

    // Generate new OTP
    const otpCode = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const otpMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #64748b; text-align: center;">New Login Verification Code</h1>
          <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin-bottom: 20px;">Your New OTP Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #64748b; letter-spacing: 5px;">${otpCode}</span>
            </div>
            <p style="color: white; margin-bottom: 10px;">This code will expire in 10 minutes</p>
            <p style="color: white; font-size: 14px;">Previous OTP codes are now invalid.</p>
          </div>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: "AnimeInfo - New Login Verification Code",
        message: otpMessage,
      });

      res.status(200).json({
        success: true,
        message: "New OTP sent to your email",
        data: {
          email: user.email,
          otpExpires: user.otpExpires,
        },
      });
    } catch (emailError) {
      console.error("Resend OTP email failed:", emailError);

      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send new OTP",
        errors: { email: "Could not send verification code" },
        data: null,
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .cookie("refreshToken", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Logout successful",
        data: null,
      });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          country: user.country,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          stats: user.stats,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { email: "No user found with this email address" },
        data: null,
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name},</p>
      <p>You have requested to reset your password. Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This reset link will expire in 10 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>The AnimeInfo Team</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request - AnimeInfo",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
        data: null,
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
        errors: { email: "Failed to send password reset email" },
        data: null,
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset request failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:resettoken
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { password } = req.validatedData;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        errors: { token: "Password reset token is invalid or has expired" },
        data: null,
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, "Password reset successful");
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    // Get hashed token from URL params
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
        errors: { token: "Email verification token is invalid" },
        data: null,
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { email: "No user found with this email address" },
        data: null,
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
        errors: { email: "This email address is already verified" },
        data: null,
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `
      <h1>Email Verification - AnimeInfo</h1>
      <p>Hi ${user.name},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email Address</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>Best regards,<br>The AnimeInfo Team</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Verify Your AnimeInfo Account",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      data: null,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Refresh token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.validatedData;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
        errors: { token: "No refresh token provided" },
        data: null,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
          errors: { token: "User not found" },
          data: null,
        });
      }

      sendTokenResponse(user, 200, res, "Token refreshed successfully");
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        errors: { token: "Refresh token is invalid or expired" },
        data: null,
      });
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.validatedData;
    const userId = req.user.id;

    // Get user with password AND previousPassword
    const user = await User.findById(userId).select(
      "+password +previousPassword"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User not found" },
        data: null,
      });
    }

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        errors: { currentPassword: "Current password is incorrect" },
        data: null,
      });
    }

    // Ensure new password is different from current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
        errors: {
          newPassword: "New password must be different from current password",
        },
        data: null,
      });
    }

    // Check if new password matches the previous password
    if (user.previousPassword) {
      // Compare with hashed previous password
      const isPreviousPassword = await user.comparePassword(newPassword);

      // Also check if the plain text matches (in case previousPassword is stored as plain text)
      const isPlainTextMatch = newPassword === user.previousPassword;

      if (isPreviousPassword || isPlainTextMatch) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from previous passwords",
          errors: {
            newPassword:
              "New password must be different from previous passwords",
          },
          data: null,
        });
      }
    }

    // Update password
    user.previousPassword = currentPassword;
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Password change failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  changePassword,
  verifyOTP,
  resendOTP,
};
