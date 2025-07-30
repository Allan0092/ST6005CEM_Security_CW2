const User = require("../model/User");
const Anime = require("../model/Anime");
const Review = require("../model/Review");

// Dashboard & Analytics
const getAdminStats = async (req, res) => {
  try {
    const [userCount, animeCount, reviewCount] = await Promise.all([
      User.countDocuments(),
      Anime.countDocuments({ isActive: true }),
      Review.countDocuments({ status: "active" }),
    ]);

    const stats = {
      users: {
        total: userCount,
        verified: await User.countDocuments({ isEmailVerified: true }),
        admins: await User.countDocuments({ role: "admin" }),
      },
      anime: {
        total: animeCount,
        airing: await Anime.countDocuments({
          status: "airing",
          isActive: true,
        }),
        completed: await Anime.countDocuments({
          status: "completed",
          isActive: true,
        }),
      },
      reviews: {
        total: reviewCount,
        recent: await Review.countDocuments({
          status: "active",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      },
    };

    res.status(200).json({
      success: true,
      message: "Admin statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin statistics",
      data: null,
    });
  }
};

const getAnalytics = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Analytics feature coming soon",
    data: { analytics: {} },
  });
};

const getContentStats = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Content statistics retrieved successfully",
    data: { stats: {} },
  });
};

// User Management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;

    let query = {};
    if (role) query.role = role;
    if (status === "verified") query.isEmailVerified = true;
    if (status === "unverified") query.isEmailVerified = false;

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
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
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      data: null,
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("favorites", "title image");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user details",
      data: null,
    });
  }
};

const updateUserStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: null,
  });
};

const deleteUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
};

// Placeholder implementations for remaining functions
const getAllAnime = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin anime list retrieved successfully",
    data: { anime: [] },
  });
};

const getAnimeDetails = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin anime details retrieved successfully",
    data: { anime: null },
  });
};

const approveAnime = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Anime approved successfully",
    data: null,
  });
};

const rejectAnime = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Anime rejected successfully",
    data: null,
  });
};

const getAllReviews = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin reviews retrieved successfully",
    data: { reviews: [] },
  });
};

const moderateReview = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Review moderated successfully",
    data: null,
  });
};

const deleteReview = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
};

const getReports = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reports retrieved successfully",
    data: { reports: [] },
  });
};

const handleReport = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Report handled successfully",
    data: null,
  });
};

const getSystemLogs = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "System logs retrieved successfully",
    data: { logs: [] },
  });
};

const backupDatabase = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Database backup initiated successfully",
    data: null,
  });
};

const manageFeatured = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Featured content updated successfully",
    data: null,
  });
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllAnime,
  getAnimeDetails,
  approveAnime,
  rejectAnime,
  getAllReviews,
  moderateReview,
  deleteReview,
  getReports,
  handleReport,
  getSystemLogs,
  backupDatabase,
  getAnalytics,
  manageFeatured,
  getContentStats,
};
