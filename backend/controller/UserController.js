const User = require("../model/User");
const WatchList = require("../model/WatchList");
const Anime = require("../model/Anime");
const { deleteFile, getFileUrl } = require("./fileUpload");
const path = require("path");

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favorites", "title image rating year")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User profile not found" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.validatedData;
    const userId = req.user.id;

    // Check if username is being updated and if it's already taken
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username.toLowerCase(),
        _id: { $ne: userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
          errors: { username: "This username is already in use" },
          data: null,
        });
      }
      
      // Convert username to lowercase for consistency
      updates.username = updates.username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User not found" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);

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

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === 'username' ? 'Username already taken' : 'Field already exists';
      
      return res.status(400).json({
        success: false,
        message: "Update failed",
        errors: { [field]: message },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Delete user profile
 * @route   DELETE /api/v1/users/profile
 * @access  Private
 */
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User not found" },
        data: null,
      });
    }

    // Deletes user's avatar file
    if (
      user.avatar &&
      user.avatar !== "placeholder.jpg" &&
      user.avatar !== "placeholder1.jpg" &&
      user.avatar !== "placeholder.png"
    ) {
      const filename = path.basename(user.avatar);
      const filePath = path.join(__dirname, "../file_storage/avatar", filename);
      deleteFile(filePath);
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(req.user.id),
      WatchList.deleteMany({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/v1/users/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
        errors: { file: "Please select an image file" },
        data: null,
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar file
    if (
      user.avatar &&
      user.avatar !== "placeholder.jpg" &&
      user.avatar !== "placeholder1.jpg" &&
      user.avatar !== "placeholder.png" &&
      !user.avatar.includes("placeholder")
    ) {
      // Extract filename from URL if it's a full URL
      let oldFilename;
      if (user.avatar.startsWith('http')) {
        oldFilename = path.basename(user.avatar);
      } else {
        oldFilename = path.basename(user.avatar);
      }
      
      const oldFilePath = path.join(
        __dirname,
        "../file_storage/avatar",
        oldFilename
      );
      deleteFile(oldFilePath);
    }

    // Update user with new avatar URL
    const avatarUrl = getFileUrl(req.file.filename, "avatar");
    
    // Store the full URL in the database
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: avatarUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);

    // Delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "../file_storage/avatar",
        req.file.filename
      );
      deleteFile(filePath);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [watchListStats, user] = await Promise.all([
      WatchList.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRating: { $sum: "$rating" },
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
      User.findById(userId).populate("favorites"),
    ]);

    const stats = {
      totalAnime: watchListStats.reduce((acc, curr) => acc + curr.count, 0),
      watching: watchListStats.find((s) => s._id === "watching")?.count || 0,
      completed: watchListStats.find((s) => s._id === "completed")?.count || 0,
      planToWatch:
        watchListStats.find((s) => s._id === "plan-to-watch")?.count || 0,
      dropped: watchListStats.find((s) => s._id === "dropped")?.count || 0,
      onHold: watchListStats.find((s) => s._id === "on-hold")?.count || 0,
      favorites: user.favorites.length,
      averageRating:
        watchListStats.length > 0
          ? (
              watchListStats.reduce(
                (acc, curr) => acc + (curr.avgRating || 0),
                0
              ) / watchListStats.length
            ).toFixed(1)
          : 0,
    };

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user statistics",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get user watch list
 * @route   GET /api/v1/users/watchlist
 * @access  Private
 */
const getWatchList = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = "-updatedAt" } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const watchList = await WatchList.find(query)
      .populate("anime", "title image rating year episodes status")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WatchList.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Watch list retrieved successfully",
      data: {
        watchList,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get watch list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve watch list",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Update watch list entry
 * @route   POST /api/v1/users/watchlist
 * @access  Private
 */
const updateWatchList = async (req, res) => {
  try {
    const { animeId, ...updateData } = req.validatedData;

    // Check if anime exists
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found" },
        data: null,
      });
    }

    // Update or create watch list entry
    const watchListEntry = await WatchList.findOneAndUpdate(
      { user: req.user.id, anime: animeId },
      { ...updateData, "progress.totalEpisodes": anime.episodes?.total },
      { upsert: true, new: true, runValidators: true }
    ).populate("anime", "title image rating year episodes");

    res.status(200).json({
      success: true,
      message: "Watch list updated successfully",
      data: { watchListEntry },
    });
  } catch (error) {
    console.error("Update watch list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update watch list",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Remove from watch list
 * @route   DELETE /api/v1/users/watchlist/:animeId
 * @access  Private
 */
const removeFromWatchList = async (req, res) => {
  try {
    const { animeId } = req.params;

    const deleted = await WatchList.findOneAndDelete({
      user: req.user.id,
      anime: animeId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Watch list entry not found",
        errors: { watchlist: "Entry not found in your watch list" },
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from watch list successfully",
      data: null,
    });
  } catch (error) {
    console.error("Remove from watch list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from watch list",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get user favorites
 * @route   GET /api/v1/users/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      select: "title image rating year genres status episodes",
      options: { sort: { createdAt: -1 } },
    });

    res.status(200).json({
      success: true,
      message: "Favorites retrieved successfully",
      data: {
        favorites: user.favorites,
        total: user.favorites.length,
      },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve favorites",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Add to favorites
 * @route   POST /api/v1/users/favorites
 * @access  Private
 */
const addToFavorites = async (req, res) => {
  try {
    const { animeId } = req.body;

    // Check if anime exists
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({
        success: false,
        message: "Anime not found",
        errors: { anime: "Anime not found" },
        data: null,
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already in favorites
    if (user.favorites.includes(animeId)) {
      return res.status(400).json({
        success: false,
        message: "Already in favorites",
        errors: { favorite: "This anime is already in your favorites" },
        data: null,
      });
    }

    user.favorites.push(animeId);
    await user.save();

    // Update anime favorites count
    anime.favorites += 1;
    await anime.save();

    res.status(200).json({
      success: true,
      message: "Added to favorites successfully",
      data: { animeId },
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Remove from favorites
 * @route   DELETE /api/v1/users/favorites/:animeId
 * @access  Private
 */
const removeFromFavorites = async (req, res) => {
  try {
    const { animeId } = req.params;

    const user = await User.findById(req.user.id);

    // Check if in favorites
    const favoriteIndex = user.favorites.indexOf(animeId);
    if (favoriteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Not in favorites",
        errors: { favorite: "This anime is not in your favorites" },
        data: null,
      });
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    // Update anime favorites count
    const anime = await Anime.findById(animeId);
    if (anime && anime.favorites > 0) {
      anime.favorites -= 1;
      await anime.save();
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites successfully",
      data: null,
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from favorites",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Update user email
 * @route   PUT /api/v1/users/email
 * @access  Private
 */
const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.validatedData;
    const userId = req.user.id;

    // Get the current user with password for verification
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: { user: "User not found" },
        data: null,
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        errors: { password: "Current password is incorrect" },
        data: null,
      });
    }

    // Check if new email is different from current email
    if (user.email === newEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from current email",
        errors: { newEmail: "Please provide a different email address" },
        data: null,
      });
    }

    // Check if new email is already in use by another user
    const existingUser = await User.findOne({ 
      email: newEmail.toLowerCase(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email address already in use",
        errors: { newEmail: "This email address is already registered" },
        data: null,
      });
    }

    // Also check if the new email is someone else's pending email
    const existingPendingUser = await User.findOne({ 
      pendingEmail: newEmail.toLowerCase(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingPendingUser) {
      return res.status(400).json({
        success: false,
        message: "Email address is already pending verification by another user",
        errors: { newEmail: "This email address is already being verified by another user" },
        data: null,
      });
    }

    // Generate email verification token for new email
    const crypto = require("crypto");
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Store the new email as pending and set verification token
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        pendingEmail: newEmail.toLowerCase(),
        emailVerificationToken: hashedVerificationToken,
        // Keeps isEmailVerified as true for current email, 
        // it will be updated only after new email verification
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    console.log(`Email change request: User ${userId} wants to change from ${user.email} to ${newEmail}`);

    // Send verification email to new email address
    try {
      const sendEmail = require("../utils/sendEmail");
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Verify Your New Email Address</h2>
          <p>Hello ${user.name},</p>
          <p>You've requested to change your email address from <strong>${user.email}</strong> to <strong>${newEmail}</strong>.</p>
          <p>Please click the button below to verify your new email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify New Email
            </a>
          </div>
          <p><strong>Important:</strong> Your email address will only be updated after you verify this new email. Until then, you can continue using your current email address (${user.email}) to log in.</p>
          <p>If you didn't request this change, please contact our support team immediately.</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
        </div>
      `;

      await sendEmail({
        email: newEmail,
        subject: "Verify Your New Email Address - AnimeInfo",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Verification email sent to your new email address",
        data: {
          message: "Please check your new email and click the verification link to complete the email change",
          pendingEmail: newEmail,
          currentEmail: user.email,
        },
      });

    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // Rollback the pending email change
      await User.findByIdAndUpdate(userId, {
        $unset: { 
          pendingEmail: 1, 
          emailVerificationToken: 1 
        },
      });

      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
        errors: { email: "Could not send verification email. Please try again." },
        data: null,
      });
    }

  } catch (error) {
    console.error("Update email error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = {};
      Object.values(error.errors).forEach((err) => {
        errors[err.path] = err.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        data: null,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email address already exists",
        errors: { newEmail: "This email address is already registered" },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update email",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

// Placeholder implementations for remaining functions
const getRecommendations = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Recommendations feature coming soon",
    data: { recommendations: [] },
  });
};

// Update preferences validation 
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          preferences: { ...req.user.preferences, ...req.validatedData },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: { preferences: user.preferences },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      data: null,
    });
  }
};

const getUserActivity = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User activity feature coming soon",
    data: { activities: [] },
  });
};

const followUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Follow feature coming soon",
    data: null,
  });
};

const unfollowUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Unfollow feature coming soon",
    data: null,
  });
};

const getFollowers = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Followers feature coming soon",
    data: { followers: [] },
  });
};

const getFollowing = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Following feature coming soon",
    data: { following: [] },
  });
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  getUserStats,
  getWatchList,
  updateWatchList,
  removeFromWatchList,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getRecommendations,
  updatePreferences,
  getUserActivity,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateEmail,
};
