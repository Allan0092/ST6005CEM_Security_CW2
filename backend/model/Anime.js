const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    alternativeTitles: {
      english: { type: String, trim: true },
      japanese: { type: String, trim: true },
      romaji: { type: String, trim: true },
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    type: {
      type: String,
      enum: ["TV", "Movie", "OVA", "ONA", "Special", "Music"],
      required: [true, "Type is required"],
    },

    status: {
      type: String,
      enum: ["airing", "completed", "upcoming", "cancelled"],
      required: [true, "Status is required"],
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year cannot be before 1900"],
      max: [2030, "Year cannot be after 2030"],
    },

    genres: [
      {
        type: String,
        trim: true,
      },
    ],

    studio: {
      type: String,
      trim: true,
    },

    episodes: {
      total: { type: Number, min: 0 },
      duration: { type: String }, // e.g., "24 min"
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 10 },
      count: { type: Number, default: 0 },
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    popularity: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    image: {
      url: { type: String },
      filename: { type: String },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

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
            "alternative",
            "spin-off",
            "adaptation",
          ],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

animeSchema.virtual("favoritesCount").get(function () {
  return this.favorites ? this.favorites.length : 0;
});

animeSchema.index({
  title: "text",
  "alternativeTitles.english": "text",
  studio: "text",
});
animeSchema.index({ genres: 1 });
animeSchema.index({ year: -1 });
animeSchema.index({ status: 1 });
animeSchema.index({ type: 1 });
animeSchema.index({ rating: -1 });
animeSchema.index({ popularity: -1 });
animeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Anime", animeSchema);
