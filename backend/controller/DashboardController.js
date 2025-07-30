const Anime = require("../model/Anime");
const User = require("../model/User");
const Review = require("../model/Review");
const WatchList = require("../model/WatchList");

/**
 * @desc    Get dashboard data for authenticated user
 * @route   GET /api/v1/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's recent activity, stats, etc.
    const [
      recentAnime,
      popularAnime,
      userStats,
      recentReviews,
      watchListPreview,
    ] = await Promise.all([
      Anime.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title image rating year"),

      Anime.find({ isActive: true })
        .sort({ popularity: -1, "rating.average": -1 })
        .limit(6)
        .select("title image rating year"),

      WatchList.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Review.find({ status: "active" })
        .populate("user", "name avatar")
        .populate("anime", "title image")
        .sort({ createdAt: -1 })
        .limit(3)
        .select("title rating createdAt"),

      WatchList.find({ user: userId })
        .populate("anime", "title image rating")
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    const dashboardData = {
      recentAnime,
      popularAnime,
      userStats: {
        totalWatched: userStats.find((s) => s._id === "completed")?.count || 0,
        currentlyWatching:
          userStats.find((s) => s._id === "watching")?.count || 0,
        planToWatch:
          userStats.find((s) => s._id === "plan-to-watch")?.count || 0,
      },
      recentReviews,
      watchListPreview,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get user activity feed
 * @route   GET /api/v1/dashboard/activity
 * @access  Private
 */
const getActivityFeed = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Activity feed retrieved successfully",
    data: { activities: [] },
  });
};

/**
 * @desc    Get trending anime
 * @route   GET /api/v1/dashboard/trending
 * @access  Public
 */
const getTrendingAnime = async (req, res) => {
  try {
    const trending = await Anime.find({ isActive: true })
      .sort({ viewCount: -1, "rating.average": -1 })
      .limit(10)
      .select("title image rating year genres viewCount");

    res.status(200).json({
      success: true,
      message: "Trending anime retrieved successfully",
      data: { trending },
    });
  } catch (error) {
    console.error("Trending anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve trending anime",
      data: { trending: [] },
    });
  }
};

/**
 * @desc    Get seasonal anime
 * @route   GET /api/v1/dashboard/seasonal
 * @access  Public
 */
const getSeasonalAnime = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let currentSeason;
    if (currentMonth >= 3 && currentMonth <= 5) currentSeason = "spring";
    else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = "summer";
    else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = "fall";
    else currentSeason = "winter";

    const seasonal = await Anime.find({
      year: currentYear,
      season: currentSeason,
      isActive: true,
    })
      .sort({ "rating.average": -1 })
      .limit(12)
      .select("title image rating year season status");

    res.status(200).json({
      success: true,
      message: "Seasonal anime retrieved successfully",
      data: {
        seasonal,
        season: currentSeason,
        year: currentYear,
      },
    });
  } catch (error) {
    console.error("Seasonal anime error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve seasonal anime",
      data: { seasonal: [] },
    });
  }
};

module.exports = {
  getDashboardData,
  getActivityFeed,
  getTrendingAnime,
  getSeasonalAnime,
};
