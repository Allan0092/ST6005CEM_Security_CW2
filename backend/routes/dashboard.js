const express = require("express");
const {
  getDashboardData,
  getActivityFeed,
  getTrendingAnime,
  getSeasonalAnime,
} = require("../controller/DashboardController");
const { protect } = require("../security/authMiddleware");

const router = express.Router();

// Public routes
router.get("/trending", getTrendingAnime);
router.get("/seasonal", getSeasonalAnime);

// Protected routes
router.use(protect);

router.get("/", getDashboardData);
router.get("/activity", getActivityFeed);

module.exports = router;
