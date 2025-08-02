const Review = require("../model/Review");
const Anime = require("../model/Anime");
const User = require("../model/User");

/**
 * @desc    Get all reviews with filtering and pagination
 * @route   GET /api/v1/reviews
 * @access  Public
 */
const getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      anime,
      user,
      rating,
      spoilers = "false",
    } = req.query;

    // Build query
    let query = { status: "active" };

    // Filter by anime
    if (anime) {
      query.anime = anime;
    }

    // Filter by user
    if (user) {
      query.user = user;
    }

    // Filter by rating
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 10) {
        query.rating = ratingNum;
      }
    }

    // Filter spoilers
    if (spoilers === "false") {
      query.spoilerWarning = false;
    }

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Get total count
    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get single review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type")
      .lean();

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: { review },
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Create new review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const {
      anime,
      rating,
      title,
      content,
      pros,
      cons,
      spoilerWarning,
      episodeWatched,
      watchStatus,
    } = req.validatedData;

    // Check if anime exists
    const animeExists = await Anime.findById(anime);
    if (!animeExists || !animeExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found or is not active" },
        data: null,
      });
    }

    // Check if user already reviewed this anime
    const existingReview = await Review.findOne({
      user: req.user.id,
      anime: anime,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this anime",
        errors: { review: "You can only review an anime once" },
        data: null,
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      anime,
      rating,
      title,
      content,
      pros: pros || [],
      cons: cons || [],
      spoilerWarning: spoilerWarning || false,
      episodeWatched,
      watchStatus,
    });

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: { review: populatedReview },
    });
  } catch (error) {
    console.error("Create review error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this anime",
        errors: { review: "You can only review an anime once" },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
        errors: { auth: "You can only update your own reviews" },
        data: null,
      });
    }

    const {
      rating,
      title,
      content,
      pros,
      cons,
      spoilerWarning,
      episodeWatched,
      watchStatus,
    } = req.validatedData;

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        title,
        content,
        pros: pros || [],
        cons: cons || [],
        spoilerWarning: spoilerWarning || false,
        episodeWatched,
        watchStatus,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found" },
        data: null,
      });
    }

    // Check admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
        errors: { auth: "You can only delete your own reviews" },
        data: null,
      });
    }

    // Soft delete - change status to deleted
    await Review.findByIdAndUpdate(req.params.id, {
      status: "deleted",
      updatedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get reviews by user
 * @route   GET /api/v1/reviews/user/:userId
 * @access  Public
 */
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    // Check if user exists
    const user = await User.findById(userId).select("name");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User not found" },
        data: null,
      });
    }

    const reviews = await Review.find({
      user: userId,
      status: "active",
    })
      .populate("anime", "title image rating year type")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Review.countDocuments({
      user: userId,
      status: "active",
    });

    res.status(200).json({
      success: true,
      message: "User reviews retrieved successfully",
      data: {
        reviews,
        user: user.name,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user reviews",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get reviews for specific anime
 * @route   GET /api/v1/reviews/anime/:animeId
 * @access  Public
 */
const getAnimeReviews = async (req, res) => {
  try {
    const { animeId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "-helpfulVotes.count",
      spoilers = "false",
    } = req.query;

    // Check if anime exists 
    const anime = await Anime.findById(animeId).select("title isActive");
    if (!anime || !anime.isActive) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found or is not active" },
        data: null,
      });
    }

    let query = {
      anime: animeId,
      status: "active",
    };

    // Filter spoilers if requested
    if (spoilers === "false") {
      query.spoilerWarning = false;
    }

    const reviews = await Review.find(query)
      .populate("user", "name avatar country")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Review.countDocuments(query);

    const mongoose = require("mongoose");

    // Get review statistics for this anime
    const reviewStats = await Review.aggregate([
      {
        $match: {
          anime: new mongoose.Types.ObjectId(animeId),
          status: "active",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingsDistribution: {
            $push: "$rating",
          },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          ratingsDistribution: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Anime reviews retrieved successfully",
      data: {
        reviews,
        anime: anime.title,
        stats: reviewStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          ratingsDistribution: [],
        },
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
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

/**
 * @desc    Like a review
 * @route   POST /api/v1/reviews/:id/like
 * @access  Private
 */
const likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    // Check if user already liked this review
    const hasLiked = review.helpfulVotes.users.includes(req.user.id);

    if (hasLiked) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this review",
        errors: { like: "You can only like a review once" },
        data: null,
      });
    }

    // Add user to helpful votes
    review.helpfulVotes.users.push(req.user.id);
    review.helpfulVotes.count = review.helpfulVotes.users.length;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review liked successfully",
      data: {
        helpfulVotes: {
          count: review.helpfulVotes.count,
          hasLiked: true,
        },
      },
    });
  } catch (error) {
    console.error("Like review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Unlike a review
 * @route   DELETE /api/v1/reviews/:id/like
 * @access  Private
 */
const unlikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    // Check if user has liked this review
    const hasLiked = review.helpfulVotes.users.includes(req.user.id);

    if (!hasLiked) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this review",
        errors: { like: "You can only unlike a review you've liked" },
        data: null,
      });
    }

    // Remove user from helpful votes
    review.helpfulVotes.users = review.helpfulVotes.users.filter(
      (userId) => userId.toString() !== req.user.id
    );
    review.helpfulVotes.count = review.helpfulVotes.users.length;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review unliked successfully",
      data: {
        helpfulVotes: {
          count: review.helpfulVotes.count,
          hasLiked: false,
        },
      },
    });
  } catch (error) {
    console.error("Unlike review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlike review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Report a review
 * @route   POST /api/v1/reviews/:id/report
 * @access  Private
 */
const reportReview = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    // Check if user already reported this review
    const hasReported = review.reports.some(
      (report) => report.user.toString() === req.user.id
    );

    if (hasReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this review",
        errors: { report: "You can only report a review once" },
        data: null,
      });
    }

    // Add report
    review.reports.push({
      user: req.user.id,
      reason,
      description,
    });

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review reported successfully",
      data: null,
    });
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report review",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get review likes
 * @route   GET /api/v1/reviews/:id/likes
 * @access  Public
 */
const getReviewLikes = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("helpfulVotes.users", "name avatar")
      .select("helpfulVotes");

    if (!review || review.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        errors: { review: "Review not found or has been deleted" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Review likes retrieved successfully",
      data: {
        likes: review.helpfulVotes.users,
        count: review.helpfulVotes.count,
      },
    });
  } catch (error) {
    console.error("Get review likes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review likes",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get top reviews
 * @route   GET /api/v1/reviews/top
 * @access  Public
 */
const getTopReviews = async (req, res) => {
  try {
    const { limit = 10, timeframe = "all" } = req.query;

    let dateFilter = {};
    if (timeframe !== "all") {
      const days = timeframe === "week" ? 7 : timeframe === "month" ? 30 : 365;
      dateFilter.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }

    const reviews = await Review.find({
      status: "active",
      ...dateFilter,
    })
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type")
      .sort({ "helpfulVotes.count": -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: "Top reviews retrieved successfully",
      data: { reviews },
    });
  } catch (error) {
    console.error("Get top reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve top reviews",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get recent reviews
 * @route   GET /api/v1/reviews/recent
 * @access  Public
 */
const getRecentReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await Review.find({
      status: "active",
    })
      .populate("user", "name avatar country")
      .populate("anime", "title image rating year type")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: "Recent reviews retrieved successfully",
      data: { reviews },
    });
  } catch (error) {
    console.error("Get recent reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent reviews",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getAnimeReviews,
  likeReview,
  unlikeReview,
  reportReview,
  getReviewLikes,
  getTopReviews,
  getRecentReviews,
};
