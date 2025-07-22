const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide anime title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    alternativeTitles: [
      {
        type: String,
        trim: true,
      },
    ],
    synopsis: {
      type: String,
      required: [true, "Please provide anime synopsis"],
      maxlength: [2000, "Synopsis cannot be more than 2000 characters"],
    },
    image: {
      public_id: String,
      url: {
        type: String,
        default: "./file_storage/coverpage/the-boy-and-the-heron-coverpage.jpg",
      },
    },
    bannerImage: {
      public_id: String,
      url: String,
    },
    trailer: {
      url: String,
      site: {
        type: String,
        enum: ["youtube", "vimeo"],
      },
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    year: {
      type: Number,
      required: [true, "Please provide release year"],
      min: 1900,
      max: new Date().getFullYear() + 5,
    },
    season: {
      type: String,
      enum: ["winter", "spring", "summer", "fall"],
    },
    status: {
      type: String,
      enum: ["airing", "completed", "upcoming", "cancelled"],
      required: true,
    },
    type: {
      type: String,
      enum: ["TV", "Movie", "OVA", "ONA", "Special", "Music"],
      required: true,
    },
    episodes: {
      total: {
        type: Number,
        min: 1,
      },
      duration: {
        type: Number,
        min: 1,
      },
    },
    genres: [
      {
        type: String,
        required: true,
      },
    ],
    studios: [
      {
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["main", "supporting"],
        },
      },
    ],
    source: {
      type: String,
      enum: [
        "manga",
        "light-novel",
        "web-novel",
        "visual-novel",
        "video-game",
        "original",
        "other",
      ],
    },
    ageRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "R+", "Rx"],
      default: "PG-13",
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    characters: [
      {
        name: String,
        role: {
          type: String,
          enum: ["main", "supporting", "background"],
        },
        image: String,
        voiceActors: [
          {
            name: String,
            language: String,
            image: String,
          },
        ],
      },
    ],
    staff: [
      {
        name: String,
        role: String,
        image: String,
      },
    ],
    relations: [
      {
        anime: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Anime",
        },
        relationType: {
          type: String,
          enum: [
            "sequel",
            "prequel",
            "side-story",
            "alternative-version",
            "summary",
            "other",
          ],
        },
      },
    ],
    externalLinks: [
      {
        site: String,
        url: String,
      },
    ],
    popularity: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted rating
animeSchema.virtual("formattedRating").get(function () {
  return this.rating.average.toFixed(1);
});

// Virtual for total duration
animeSchema.virtual("totalDuration").get(function () {
  if (this.episodes.total && this.episodes.duration) {
    return this.episodes.total * this.episodes.duration;
  }
  return null;
});

// Index for search functionality
animeSchema.index({
  title: "text",
  synopsis: "text",
  genres: "text",
  tags: "text",
});

// Index for filtering
animeSchema.index({ year: 1, status: 1, type: 1 });
animeSchema.index({ "rating.average": -1 });
animeSchema.index({ popularity: -1 });
animeSchema.index({ createdAt: -1 });

// Middleware to update the updatedAt field
animeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Anime", animeSchema);
