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
        $or: [
          { title: { $regex: q, $options: "i" } },
          { "alternativeTitles.english": { $regex: q, $options: "i" } },
          { "alternativeTitles.japanese": { $regex: q, $options: "i" } },
          { "alternativeTitles.romaji": { $regex: q, $options: "i" } },
          { studio: { $regex: q, $options: "i" } },
          { genres: { $elemMatch: { $regex: q, $options: "i" } } },
        ],
        isActive: true,
      })
        .select("title image rating year genres")
        .limit(type === "anime" ? limit : 5)
        .sort({ "rating.average": -1, viewCount: -1 });

      results.anime = animeResults;
    }

    // Search users (only if authenticated)
    if ((type === "all" || type === "users") && req.user) {
      const userResults = await User.find({
        name: { $regex: q, $options: "i" },
        isEmailVerified: true,
      })
        .select("name avatar role createdAt")
        .limit(type === "users" ? limit : 5)
        .sort({ name: 1 });

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
        .select("title rating createdAt")
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
      type,
      rating,
      sort = "relevance",
      page = 1,
      limit = 20,
    } = req.validatedQuery;

    let query = { isActive: true };
    let sortOption = {};

    // Enhanced text search with partial matching
    if (q && q.trim()) {
      const searchTerm = q.trim();
      
      query.$or = [
        // Main title search - case insensitive
        { title: { $regex: searchTerm, $options: "i" } },
        
        // Alternative titles search
        { "alternativeTitles.english": { $regex: searchTerm, $options: "i" } },
        { "alternativeTitles.japanese": { $regex: searchTerm, $options: "i" } },
        { "alternativeTitles.romaji": { $regex: searchTerm, $options: "i" } },
        
        // Studio search
        { studio: { $regex: searchTerm, $options: "i" } },
        
        // Genre search (partial genre matching)
        { genres: { $elemMatch: { $regex: searchTerm, $options: "i" } } },
        
        // Description search (for specific terms)
        { description: { $regex: searchTerm, $options: "i" } }
      ];
    }

    if (genre && genre.trim()) {
      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { genres: { $in: [genre] } },
            { isActive: true }
          ]
        };
      } else {
        query.genres = { $in: [genre] };
      }
    }

    if (year && year.trim()) {
      const yearValue = parseInt(year);
      if (!isNaN(yearValue)) {
        if (query.$and) {
          query.$and.push({ year: yearValue });
        } else if (query.$or) {
          query = {
            $and: [
              { $or: query.$or },
              { year: yearValue },
              { isActive: true }
            ]
          };
        } else {
          query.year = yearValue;
        }
      }
    }

    if (status && status.trim()) {
      if (query.$and) {
        query.$and.push({ status: status });
      } else if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { status: status },
            { isActive: true }
          ]
        };
      } else {
        query.status = status;
      }
    }

    if (type && type.trim() && type !== "all") {
      if (query.$and) {
        query.$and.push({ type: type });
      } else if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { type: type },
            { isActive: true }
          ]
        };
      } else {
        query.type = type;
      }
    }

    if (rating && rating.trim()) {
      const [min, max] = rating.split('-').map(Number);
      const ratingFilter = max ? 
        { "rating.average": { $gte: min, $lt: max === 10 ? 11 : max } } :
        { "rating.average": { $gte: min } };

      if (query.$and) {
        query.$and.push(ratingFilter);
      } else if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            ratingFilter,
            { isActive: true }
          ]
        };
      } else {
        query = { ...query, ...ratingFilter };
      }
    }

    // Set sort option
    if (sort === "relevance" && q && q.trim()) {
      sortOption = {
        "rating.average": -1,
        "rating.count": -1,
        viewCount: -1,
        createdAt: -1
      };
    } else if (sort !== "relevance") {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortDirection = sort.startsWith('-') ? -1 : 1;
      sortOption[sortField] = sortDirection;
    } else {
      sortOption = { "rating.average": -1, "rating.count": -1, viewCount: -1 };
    }

    console.log("Search Query:", JSON.stringify(query, null, 2));
    console.log("Sort Option:", sortOption);

    // Execute query
    const anime = await Anime.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select("title alternativeTitles image rating year genres status type studio episodes viewCount favorites")
      .lean();

    // Get total count
    const total = await Anime.countDocuments(query);

    // Add favoritesCount virtual field
    const animeWithCounts = anime.map(item => ({
      ...item,
      favoritesCount: item.favorites?.length || 0,
    }));

    console.log(`Search Results: Found ${total} anime for query "${q}"`);

    res.status(200).json({
      success: true,
      message: "Anime search completed successfully",
      data: {
        anime: animeWithCounts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
        filters: { q, genre, year, status, type, rating, sort },
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
    const { q, page = 1, limit = 20 } = req.validatedQuery;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        errors: { query: "Please provide a search query" },
        data: null,
      });
    }

    const reviews = await Review.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
      status: "active",
    })
      .populate("user", "name avatar")
      .populate("anime", "title image")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
      status: "active",
    });

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

    // Get suggestions from anime titles
    const suggestions = await Anime.find({
      $or: [
        { title: { $regex: `^${q}`, $options: "i" } },
        { "alternativeTitles.english": { $regex: `^${q}`, $options: "i" } },
        { studio: { $regex: `^${q}`, $options: "i" } },
      ],
      isActive: true,
    })
      .select("title alternativeTitles.english studio")
      .limit(10)
      .lean();

    const suggestionList = [];
    suggestions.forEach((anime) => {
      if (anime.title.toLowerCase().startsWith(q.toLowerCase())) {
        suggestionList.push(anime.title);
      }
      if (
        anime.alternativeTitles?.english
          ?.toLowerCase()
          .startsWith(q.toLowerCase())
      ) {
        suggestionList.push(anime.alternativeTitles.english);
      }
      if (anime.studio?.toLowerCase().startsWith(q.toLowerCase())) {
        suggestionList.push(anime.studio);
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = [...new Set(suggestionList)].slice(0, 8);

    res.status(200).json({
      success: true,
      message: "Search suggestions retrieved successfully",
      data: { suggestions: uniqueSuggestions },
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve search suggestions",
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
        "Dragon Ball",
        "Death Note",
        "Fullmetal Alchemist",
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

    // Get available types
    const types = await Anime.distinct("type", { isActive: true });

    // Get available statuses
    const statuses = await Anime.distinct("status", { isActive: true });

    res.status(200).json({
      success: true,
      message: "Search filters retrieved successfully",
      data: {
        filters: {
          genres: genres.sort(),
          years: years.sort((a, b) => b - a), 
          types: types.sort(),
          statuses: statuses.sort(),
        },
      },
    });
  } catch (error) {
    console.error("Search filters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve search filters",
      data: { filters: {} },
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
