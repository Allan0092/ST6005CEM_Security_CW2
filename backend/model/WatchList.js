const mongoose = require("mongoose");

const watchListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },
    status: {
      type: String,
      enum: ["watching", "completed", "plan-to-watch", "dropped", "on-hold"],
      required: true,
      default: "plan-to-watch",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    progress: {
      episodesWatched: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalEpisodes: Number,
    },
    startDate: Date,
    endDate: Date,
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    rewatching: {
      type: Boolean,
      default: false,
    },
    rewatchCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one entry per user per anime
watchListSchema.index({ user: 1, anime: 1 }, { unique: true });

// Index for finding watchlist by user and status
watchListSchema.index({ user: 1, status: 1, updatedAt: -1 });

// Virtual for completion percentage
watchListSchema.virtual("completionPercentage").get(function () {
  if (this.progress.totalEpisodes && this.progress.episodesWatched) {
    return Math.round(
      (this.progress.episodesWatched / this.progress.totalEpisodes) * 100
    );
  }
  return 0;
});

// Virtual for duration
watchListSchema.virtual("duration").get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware
watchListSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Auto-set dates based on status
  if (this.status === "watching" && !this.startDate) {
    this.startDate = new Date();
  }

  if (this.status === "completed" && !this.endDate) {
    this.endDate = new Date();
  }

  next();
});

module.exports = mongoose.model("WatchList", watchListSchema);
