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

    const user = await User.findByIdAndUpdate(
      req.user.id,
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
      user.avatar !== "placeholder.png"
    ) {
      const oldFilename = path.basename(user.avatar);
      const oldFilePath = path.join(
        __dirname,
        "../file_storage/avatar",
        oldFilename
      );
      deleteFile(oldFilePath);
    }

    // Update user with new avatar URL
    const avatarUrl = getFileUrl(req.file.filename, "avatar");
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
