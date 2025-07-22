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
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "./file_storage/avatar/palceholder.jpg",
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
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
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
  return {
    totalFavorites: this.favorites.length,
    totalWatched: this.watchList.filter((item) => item.status === "completed")
      .length,
    averageRating:
      this.watchList.length > 0
        ? (
            this.watchList.reduce((sum, item) => sum + (item.rating || 0), 0) /
            this.watchList.length
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

module.exports = mongoose.model("User", userSchema);
