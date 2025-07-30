const express = require("express");
const {
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
} = require("../controller/AdminController");
const { protect, authorize } = require("../security/authMiddleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard & Analytics
router.get("/stats", getAdminStats);
router.get("/analytics", getAnalytics);
router.get("/content-stats", getContentStats);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Anime Management
router.get("/anime", getAllAnime);
router.get("/anime/:id", getAnimeDetails);
router.put("/anime/:id/approve", approveAnime);
router.put("/anime/:id/reject", rejectAnime);

// Review Moderation
router.get("/reviews", getAllReviews);
router.put("/reviews/:id/moderate", moderateReview);
router.delete("/reviews/:id", deleteReview);

// Reports & Moderation
router.get("/reports", getReports);
router.put("/reports/:id", handleReport);

// System Management
router.get("/logs", getSystemLogs);
router.post("/backup", backupDatabase);
router.put("/featured", manageFeatured);

module.exports = router;
