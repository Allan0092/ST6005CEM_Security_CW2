const Anime = require("../model/Anime");
const User = require("../model/User");
const Review = require("../model/Review");
const { deleteFile, getFileUrl } = require("./fileUpload");
const path = require("path");

/**
 * @desc    Get all anime with pagination and filtering
 * @route   GET /api/v1/anime
 * @access  Public
 */
const getAllAnime = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      genre,
      year,
      status,
      type,
      search,
    } = req.query;

    const query = { isActive: true };

    if (genre) {
      query.genres = { $in: [genre] };
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "alternativeTitles.english": { $regex: search, $options: "i" } },
        { "alternativeTitles.japanese": { $regex: search, $options: "i" } },
        { studio: { $regex: search, $options: "i" } },
      ];
    }

    const anime = await Anime.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title image rating year genres viewCount type status studio episodes')
      .lean(); 

    const total = await Anime.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Anime retrieved successfully",
      data: {
        anime,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get single anime by ID
 * @route   GET /api/v1/anime/:id
 * @access  Public
 */
const getAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime || !anime.isActive) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found or is inactive" },
        data: null,
      });
    }

    // Increment view count
    anime.viewCount += 1;
    await anime.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Anime retrieved successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Get anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Create new anime
 * @route   POST /api/v1/anime
 * @access  Private (Admin only)
 */
const createAnime = async (req, res) => {
  try {
    const animeData = {
      ...req.validatedData,
      createdBy: req.user.id,
    };

    const anime = await Anime.create(animeData);

    res.status(201).json({
      success: true,
      message: "Anime created successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Create anime error:", error);

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
      message: "Failed to create anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Update anime
 * @route   PUT /api/v1/anime/:id
 * @access  Private (Admin only)
 */
const updateAnime = async (req, res) => {
  try {
    const anime = await Anime.findByIdAndUpdate(
      req.params.id,
      req.validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Anime updated successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Update anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Delete anime
 * @route   DELETE /api/v1/anime/:id
 * @access  Private (Admin only)
 */
const deleteAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found" },
        data: null,
      });
    }

    // Soft delete by setting isActive to false
    anime.isActive = false;
    await anime.save();

    res.status(200).json({
      success: true,
      message: "Anime deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Search anime
 * @route   GET /api/v1/anime/search
 * @access  Public
 */
const searchAnime = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, sort = "relevance" } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        errors: { search: "Please provide a search query" },
        data: null,
      });
    }

    const searchQuery = {
      $text: { $search: q },
      isActive: true,
    };

    let sortOption = {};
    if (sort === "relevance") {
      sortOption = { score: { $meta: "textScore" } };
    } else {
      sortOption = sort;
    }

    const anime = await Anime.find(searchQuery, {
      score: { $meta: "textScore" },
    })
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Anime.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        anime,
        searchQuery: q,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Search anime error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get popular anime
 * @route   GET /api/v1/anime/popular
 * @access  Public
 */
const getPopularAnime = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const anime = await Anime.find({ isActive: true })
      .sort({ popularity: -1, "rating.average": -1, viewCount: -1 })
      .limit(Number(limit))
      .select("title image rating year genres viewCount favoritesCount type");

    res.status(200).json({
      success: true,
      message: "Popular anime retrieved successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Get popular anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve popular anime",
      data: { anime: [] },
    });
  }
};

/**
 * @desc    Get top rated anime
 * @route   GET /api/v1/anime/top-rated
 * @access  Public
 */
const getTopRatedAnime = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const anime = await Anime.find({
      isActive: true,
      "rating.count": { $gte: 1 }, // Only anime with at least 1 rating
    })
      .sort({ "rating.average": -1, "rating.count": -1 })
      .limit(Number(limit))
      .select("title image rating year genres viewCount favoritesCount type");

    res.status(200).json({
      success: true,
      message: "Top rated anime retrieved successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Get top rated anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve top rated anime",
      data: { anime: [] },
    });
  }
};

/**
 * @desc    Get recent anime
 * @route   GET /api/v1/anime/recent
 * @access  Public
 */
const getRecentAnime = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const anime = await Anime.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("title image rating year genres viewCount favoritesCount type");

    res.status(200).json({
      success: true,
      message: "Recent anime retrieved successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Get recent anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent anime",
      data: { anime: [] },
    });
  }
};

/**
 * @desc    Get trending anime (based on recent views)
 * @route   GET /api/v1/anime/trending
 * @access  Public
 */
const getTrendingAnime = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // Get anime with most views, prioritizing recent activity
    const trending = await Anime.find({ isActive: true })
      .sort({ viewCount: -1, "rating.average": -1, createdAt: -1 })
      .limit(Number(limit))
      .select(
        "title image rating year genres viewCount favoritesCount type status"
      )
      .lean();

    // Add computed fields
    const enhancedTrending = trending.map((item) => ({
      ...item,
      favoritesCount: item.favorites ? item.favorites.length : 0,
    }));

    res.status(200).json({
      success: true,
      message: "Trending anime retrieved successfully",
      data: { anime: enhancedTrending },
    });
  } catch (error) {
    console.error("Get trending anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve trending anime",
      data: { anime: [] },
    });
  }
};

/**
 * @desc    Get anime by genre
 * @route   GET /api/v1/anime/genre/:genre
 * @access  Public
 */
const getAnimeByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const anime = await Anime.find({
      genres: { $in: [genre] },
      isActive: true,
    })
      .sort({ "rating.average": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Anime.countDocuments({
      genres: { $in: [genre] },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: `Anime in genre "${genre}" retrieved successfully`,
      data: {
        anime,
        genre,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get anime by genre error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime by genre",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get anime by year
 * @route   GET /api/v1/anime/year/:year
 * @access  Public
 */
const getAnimeByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const anime = await Anime.find({
      year: parseInt(year),
      isActive: true,
    })
      .sort({ "rating.average": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Anime.countDocuments({
      year: parseInt(year),
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: `Anime from year ${year} retrieved successfully`,
      data: {
        anime,
        year: parseInt(year),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get anime by year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime by year",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get anime by status
 * @route   GET /api/v1/anime/status/:status
 * @access  Public
 */
const getAnimeByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const anime = await Anime.find({
      status: status,
      isActive: true,
    })
      .sort({ "rating.average": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Anime.countDocuments({
      status: status,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: `Anime with status "${status}" retrieved successfully`,
      data: {
        anime,
        status,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get anime by status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime by status",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get related anime
 * @route   GET /api/v1/anime/:id/related
 * @access  Public
 */
const getRelatedAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime || !anime.isActive) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        data: { relations: [] },
      });
    }

    const relatedAnime = await Anime.find({
      _id: { $ne: req.params.id }, // Exclude current anime
      isActive: true,
      genres: { $in: anime.genres }, // Same genres
    })
      .limit(6)
      .select('title image rating year type')
      .sort({ 'rating.average': -1 });

    // Format as relations for compatibility
    const relations = relatedAnime.map(related => ({
      anime: related,
      relationType: 'Similar'
    }));

    res.status(200).json({
      success: true,
      message: "Related anime retrieved successfully",
      data: { relations },
    });
  } catch (error) {
    console.error("Get related anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve related anime",
      data: { relations: [] },
    });
  }
};

/**
 * @desc    Get featured anime
 * @route   GET /api/v1/anime/featured
 * @access  Public
 */
const getFeaturedAnime = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const anime = await Anime.find({
      isActive: true,
      "rating.average": { $gte: 8.0 },
      "rating.count": { $gte: 100 },
    })
      .sort({ popularity: -1, "rating.average": -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Featured anime retrieved successfully",
      data: { anime },
    });
  } catch (error) {
    console.error("Get featured anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve featured anime",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get anime statistics
 * @route   GET /api/v1/anime/:id/stats
 * @access  Public
 */
const getAnimeStats = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found" },
        data: null,
      });
    }

    const stats = {
      viewCount: anime.viewCount,
      favorites: anime.favorites,
      rating: anime.rating,
      popularity: anime.popularity,
    };

    res.status(200).json({
      success: true,
      message: "Anime statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Get anime stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime statistics",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

const uploadAnimeImage = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Image upload feature coming soon",
    data: null,
  });
};

const getAnimeReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      anime: req.params.id,
      status: "active",
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      anime: req.params.id,
      status: "active",
    });

    res.status(200).json({
      success: true,
      message: "Anime reviews retrieved successfully",
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
    console.error("Get anime reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve anime reviews",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

const addAnimeView = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        data: null,
      });
    }

    anime.viewCount += 1;
    await anime.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "View recorded successfully",
      data: { viewCount: anime.viewCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record view",
      data: null,
    });
  }
};

const reportAnime = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Report submitted successfully",
    data: null,
  });
};

const getAnimeCharacters = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Characters retrieved successfully",
      data: { characters: anime.characters || [] },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve characters",
      data: null,
    });
  }
};

const getAnimeStaff = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      data: { staff: anime.staff || [] },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve staff",
      data: null,
    });
  }
};

const toggleAnimeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const animeId = req.params.id;

    const isFavorite = user.favorites.includes(animeId);

    if (isFavorite) {
      user.favorites.pull(animeId);
      // Decrease anime favorites count
      await Anime.findByIdAndUpdate(animeId, { $inc: { favorites: -1 } });
    } else {
      user.favorites.push(animeId);
      // Increase anime favorites count
      await Anime.findByIdAndUpdate(animeId, { $inc: { favorites: 1 } });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      data: { isFavorite: !isFavorite },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      data: null,
    });
  }
};

module.exports = {
  getAllAnime,
  getAnime,
  createAnime,
  updateAnime,
  deleteAnime,
  searchAnime,
  getPopularAnime,
  getTopRatedAnime,
  getRecentAnime,
  getTrendingAnime,
  getAnimeByGenre,
  getAnimeByYear,
  getAnimeByStatus,
  getRelatedAnime,
  getFeaturedAnime,
  getAnimeStats,
  uploadAnimeImage,
  getAnimeReviews,
  addAnimeView,
  reportAnime,
  getAnimeCharacters,
  getAnimeStaff,
  toggleAnimeFavorite,
};
