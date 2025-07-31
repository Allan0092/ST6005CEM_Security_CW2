const User = require("../model/User");
const Anime = require("../model/Anime");
const Review = require("../model/Review");
const WatchList = require("../model/WatchList");

// Dashboard & Analytics
const getAdminStats = async (req, res) => {
  try {
    // Get basic counts in parallel
    const [
      totalUsers,
      verifiedUsers, 
      adminUsers,
      totalAnime,
      airingAnime,
      completedAnime,
      totalReviews,
      recentReviews
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ role: "admin" }),
      Anime.countDocuments({ isActive: true }),
      Anime.countDocuments({ status: "airing", isActive: true }),
      Anime.countDocuments({ status: "completed", isActive: true }),
      Review.countDocuments({ status: "active" }),
      Review.countDocuments({
        status: "active",
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
    ]);

    // Calculate pending users (unverified)
    const pendingUsers = totalUsers - verifiedUsers;

    const stats = {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        pending: pendingUsers,
        admins: adminUsers,
      },
      anime: {
        total: totalAnime,
        airing: airingAnime,
        completed: completedAnime,
      },
      reviews: {
        total: totalReviews,
        recent: recentReviews,
      },
      system: {
        lastBackup: "Never",
        status: "operational"
      }
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

const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      role = '',
      verified = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Search by name or email
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by verification status
    if (verified === 'true') {
      query.isEmailVerified = true;
    } else if (verified === 'false') {
      query.isEmailVerified = false;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -resetPasswordToken -emailVerificationToken -otpCode')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort(sort)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Add computed fields to users
    const enhancedUsers = users.map(user => ({
      ...user,
      reviewCount: 0, // Placeholder - could be computed if needed
      favoriteCount: user.favorites ? user.favorites.length : 0,
    }));

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: enhancedUsers,
        pagination: {
          totalUsers: total,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
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
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -resetPasswordToken -emailVerificationToken -otpCode")
      .populate("favorites", "title image")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Add computed fields
    const enhancedUser = {
      ...user,
      reviewCount: 0, // Could be computed from Review model if needed
      favoriteCount: user.favorites ? user.favorites.length : 0,
      watchListCount: user.watchList ? user.watchList.length : 0,
    };

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: { user: enhancedUser },
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
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Prepare allowed updates (only basic fields)
    const allowedUpdates = {};
    
    // Allow updating basic user info
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.email !== undefined) allowedUpdates.email = updates.email;
    if (updates.country !== undefined) allowedUpdates.country = updates.country;
    
    // Allow role changes (user ↔ admin)
    if (updates.role !== undefined && ['user', 'admin'].includes(updates.role)) {
      allowedUpdates.role = updates.role;
    }
    
    // Allow manual email verification
    if (updates.isEmailVerified !== undefined) {
      allowedUpdates.isEmailVerified = updates.isEmailVerified;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -resetPasswordToken -emailVerificationToken -otpCode');

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });

  } catch (error) {
    console.error("Update user status error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        data: null,
      });
    }

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: { email: "This email is already registered" },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      data: null,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
        data: null,
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last administrator account",
          data: null,
        });
      }
    }

    // Clean up related data
    await Promise.all([
      // Delete user's reviews
      Review.deleteMany({ user: id }),
      
      // Delete user's watchlist entries
      WatchList.deleteMany({ user: id }),
      
      // Remove user from anime favorites (FIXED)
      Anime.updateMany(
        { favorites: id }, // Find anime where user is in favorites array
        { $pull: { favorites: id } } // Remove user ID from favorites array
      ),
    ]);

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      data: null,
    });
  }
};

// Keep existing placeholder implementations for other functions
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
