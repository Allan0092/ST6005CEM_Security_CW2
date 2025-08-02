const express = require("express");
const {
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
} = require("../controller/UserController");
const { protect, authorize } = require("../security/authMiddleware");
const {
  validateUpdateProfile,
  validateWatchList,
  validateUpdateEmail,
} = require("../validation/userValidation");
const { upload } = require("../controller/fileUpload");
const decryptPassword = require("../middleware/decryptPassword");

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router
  .route("/profile")
  .get(getProfile)
  .put(validateUpdateProfile, updateProfile)
  .delete(deleteProfile);

router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.get("/stats", getUserStats);
router.get("/activity", getUserActivity);

// Email update route 
router.put("/email", decryptPassword, validateUpdateEmail, updateEmail);

// Watch list routes
router
  .route("/watchlist")
  .get(getWatchList)
  .post(validateWatchList, updateWatchList);

router.delete("/watchlist/:animeId", removeFromWatchList);

// Favorites routes
router.route("/favorites").get(getFavorites).post(addToFavorites);
router.delete("/favorites/:animeId", removeFromFavorites);

// Recommendations
router.get("/recommendations", getRecommendations);

// User preferences
router.put("/preferences", updatePreferences);

// Social features
router.post("/follow/:userId", followUser);
router.delete("/follow/:userId", unfollowUser);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

module.exports = router;
