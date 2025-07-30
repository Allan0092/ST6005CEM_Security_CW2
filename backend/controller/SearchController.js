const Anime = require("../model/Anime");
const User = require("../model/User");
const Review = require("../model/Review");

/**
 * @desc    Global search across all content types
 * @route   GET /api/v1/search/global
 * @access  Public
 */
const globalSearch = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, type = "all" } = req.validatedQuery;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        errors: { query: "Please provide a search query" },
        data: null,
      });
    }

    const results = {
      anime: [],
      users: [],
      reviews: [],
      total: 0,
    };

    // Search anime
    if (type === "all" || type === "anime") {
      const animeResults = await Anime.find({
        $text: { $search: q },
        isActive: true,
      })
        .select("title image rating year genres")
        .limit(type === "anime" ? limit : 5)
        .sort({ score: { $meta: "textScore" } });

      results.anime = animeResults;
    }

    // Search users (only if authenticated)
    if ((type === "all" || type === "users") && req.user) {
      const userResults = await User.find({
        name: { $regex: q, $options: "i" },
        isEmailVerified: true,
      })
        .select("name avatar role createdAt")
        .limit(type === "users" ? limit : 5);

      results.users = userResults;
    }

    // Search reviews
    if (type === "all" || type === "reviews") {
      const reviewResults = await Review.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
        ],
        status: "active",
      })
        .populate("user", "name avatar")
        .populate("anime", "title image")
        .select("title content rating createdAt")
        .limit(type === "reviews" ? limit : 5)
        .sort({ createdAt: -1 });

      results.reviews = reviewResults;
    }

    results.total =
      results.anime.length + results.users.length + results.reviews.length;

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        query: q,
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.total,
        },
      },
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Search anime specifically
 * @route   GET /api/v1/search/anime
 * @access  Public
 */
const searchAnime = async (req, res) => {
  try {
    const {
      q,
      genre,
      year,
      status,
      rating,
      sort = "relevance",
      page = 1,
      limit = 20,
    } = req.validatedQuery;

    let query = { isActive: true };
    let sortOption = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
      if (sort === "relevance") {
        sortOption = { score: { $meta: "textScore" } };
      }
    }

    // Filter by genre
    if (genre) {
      query.genres = { $in: Array.isArray(genre) ? genre : [genre] };
    }

    // Filter by year
    if (year) {
      query.year = year;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by rating
    if (rating) {
      if (rating.min) query["rating.average"] = { $gte: rating.min };
      if (rating.max) {
        query["rating.average"] = query["rating.average"]
          ? { ...query["rating.average"], $lte: rating.max }
          : { $lte: rating.max };
      }
    }

    // Set sort option
    if (sort !== "relevance") {
      sortOption = sort;
    }

    const anime = await Anime.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("title image rating year genres status type");

    const total = await Anime.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Anime search completed successfully",
      data: {
        anime,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
        filters: { q, genre, year, status, rating, sort },
      },
    });
  } catch (error) {
    console.error("Anime search error:", error);
    res.status(500).json({
      success: false,
      message: "Anime search failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Search users
 * @route   GET /api/v1/search/users
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.validatedQuery;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        errors: { query: "Please provide a search query" },
        data: null,
      });
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      isEmailVerified: true,
    })
      .select("name avatar role createdAt stats")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments({
      name: { $regex: q, $options: "i" },
      isEmailVerified: true,
    });

    res.status(200).json({
      success: true,
      message: "User search completed successfully",
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({
      success: false,
      message: "User search failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Search reviews
 * @route   GET /api/v1/search/reviews
 * @access  Public
 */
const searchReviews = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, spoilers = false } = req.validatedQuery;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        errors: { query: "Please provide a search query" },
        data: null,
      });
    }

    let query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
      status: "active",
    };

    // Filter spoilers if requested
    if (!spoilers) {
      query.spoilerWarning = false;
    }

    const reviews = await Review.find(query)
      .populate("user", "name avatar")
      .populate("anime", "title image")
      .select("title content rating spoilerWarning helpfulVotes createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Review search completed successfully",
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Review search error:", error);
    res.status(500).json({
      success: false,
      message: "Review search failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

// Placeholder implementations for remaining functions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        message: "Search suggestions retrieved successfully",
        data: { suggestions: [] },
      });
    }

    // Get anime title suggestions
    const animeSuggestions = await Anime.find({
      title: { $regex: `^${q}`, $options: "i" },
      isActive: true,
    })
      .select("title")
      .limit(5)
      .sort({ popularity: -1 });

    const suggestions = animeSuggestions.map((anime) => ({
      text: anime.title,
      type: "anime",
    }));

    res.status(200).json({
      success: true,
      message: "Search suggestions retrieved successfully",
      data: { suggestions },
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get search suggestions",
      data: { suggestions: [] },
    });
  }
};

const getPopularSearches = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Popular searches retrieved successfully",
    data: {
      searches: [
        "Attack on Titan",
        "Demon Slayer",
        "One Piece",
        "My Hero Academia",
        "Naruto",
      ],
    },
  });
};

const saveSearchHistory = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Search saved to history successfully",
    data: null,
  });
};

const getSearchHistory = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Search history retrieved successfully",
    data: { history: [] },
  });
};

const clearSearchHistory = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Search history cleared successfully",
    data: null,
  });
};

const getSearchFilters = async (req, res) => {
  try {
    // Get available genres
    const genres = await Anime.distinct("genres", { isActive: true });

    // Get available years
    const years = await Anime.distinct("year", { isActive: true });
    years.sort((a, b) => b - a); // Sort descending

    // Get available statuses
    const statuses = ["airing", "completed", "upcoming"];

    res.status(200).json({
      success: true,
      message: "Search filters retrieved successfully",
      data: {
        filters: {
          genres: genres.sort(),
          years: years.slice(0, 20), // Last 20 years
          statuses,
          ratings: [
            { label: "9+ Excellent", min: 9, max: 10 },
            { label: "8+ Very Good", min: 8, max: 10 },
            { label: "7+ Good", min: 7, max: 10 },
            { label: "6+ Fair", min: 6, max: 10 },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Get search filters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve search filters",
      data: { filters: { genres: [], years: [], statuses: [] } },
    });
  }
};

module.exports = {
  globalSearch,
  searchAnime,
  searchUsers,
  searchReviews,
  getSearchSuggestions,
  getPopularSearches,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getSearchFilters,
};
