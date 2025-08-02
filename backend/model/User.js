const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot be more than 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
      index: true, 
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    pendingEmail: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      default: undefined,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "./file_storage/avatar/placeholder.jpg",
    },
    country: {
      type: String,
      required: [true, "Please provide a country"],
      trim: true,
      maxlength: [100, "Country name cannot be more than 100 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime",
      },
    ],
    watchList: [
      {
        anime: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Anime",
        },
        status: {
          type: String,
          enum: [
            "watching",
            "completed",
            "plan-to-watch",
            "dropped",
            "on-hold",
          ],
          default: "plan-to-watch",
        },
        rating: {
          type: Number,
          min: 1,
          max: 10,
        },
        dateAdded: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      preferredGenres: [
        {
          type: String,
        },
      ],
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        enum: ["en", "ja", "es", "fr", "de"],
        default: "en",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: String,
    otpExpires: Date,
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastAttempt: Date,
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    previousPassword: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user stats
userSchema.virtual("stats").get(function () {
  // Ensure arrays exist before accessing length
  const favorites = this.favorites || [];
  const watchList = this.watchList || [];
  
  return {
    totalFavorites: favorites.length,
    totalWatched: watchList.filter((item) => item.status === "completed").length,
    averageRating:
      watchList.length > 0
        ? (
            watchList.reduce((sum, item) => sum + (item.rating || 0), 0) /
            watchList.length
          ).toFixed(1)
        : 0,
  };
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token generator
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// password reset token generator
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate OTP code
userSchema.methods.generateOTP = function () {
  const crypto = require("crypto");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP before storing
  this.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.otpAttempts = 0;
  this.otpLastAttempt = undefined;

  return otp; // Return plain OTP for sending via email
};

// Verify OTP code
userSchema.methods.verifyOTP = function (enteredOTP) {
  const crypto = require("crypto");
  const hashedOTP = crypto.createHash("sha256").update(enteredOTP).digest("hex");

  // Check if OTP is expired
  if (this.otpExpires < Date.now()) {
    return { success: false, error: "OTP has expired" };
  }

  // Check attempt limits (max 5 attempts)
  if (this.otpAttempts >= 5) {
    return { success: false, error: "Too many failed attempts. Please request a new OTP." };
  }

  // Increment attempts
  this.otpAttempts += 1;
  this.otpLastAttempt = Date.now();

  // Verify OTP
  if (this.otpCode === hashedOTP) {
    // Clear OTP data after successful verification
    this.otpCode = undefined;
    this.otpExpires = undefined;
    this.otpAttempts = 0;
    this.otpLastAttempt = undefined;

    return { success: true };
  }

  return { success: false, error: "Invalid OTP code" };
};

// pre-save hook to debug email changes
userSchema.pre('save', function(next) {
  if (this.isModified('email') || this.isModified('pendingEmail')) {
    console.log(`User ${this._id} email state:`, {
      email: this.email,
      pendingEmail: this.pendingEmail,
      isEmailVerified: this.isEmailVerified,
      hasToken: !!this.emailVerificationToken
    });
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
