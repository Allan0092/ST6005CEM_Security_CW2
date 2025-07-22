const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    title: {
      type: String,
      required: [true, "Please provide a review title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide review content"],
      trim: true,
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    pros: [
      {
        type: String,
        trim: true,
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
      },
    ],
    spoilerWarning: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      count: {
        type: Number,
        default: 0,
      },
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: ["spam", "inappropriate", "spoiler", "harassment", "other"],
        },
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    episodeWatched: {
      type: Number,
      min: 1,
    },
    watchStatus: {
      type: String,
      enum: ["watching", "completed", "dropped"],
      required: true,
    },
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

// Compound index to ensure one review per user per anime
reviewSchema.index({ user: 1, anime: 1 }, { unique: true });

// Index for finding reviews by anime
reviewSchema.index({ anime: 1, status: 1, createdAt: -1 });

// Index for finding reviews by user
reviewSchema.index({ user: 1, createdAt: -1 });

// Middleware to update anime rating when review is saved
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.anime);
});

// Middleware to update anime rating when review is removed
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRating(this.anime);
});

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (animeId) {
  const stats = await this.aggregate([
    {
      $match: { anime: animeId, status: "active" },
    },
    {
      $group: {
        _id: "$anime",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model("Anime").findByIdAndUpdate(animeId, {
        "rating.average": Math.round(stats[0].averageRating * 10) / 10,
        "rating.count": stats[0].ratingCount,
      });
    } else {
      await this.model("Anime").findByIdAndUpdate(animeId, {
        "rating.average": 0,
        "rating.count": 0,
      });
    }
  } catch (error) {
    console.error("Error updating anime rating:", error);
  }
};

module.exports = mongoose.model("Review", reviewSchema);
