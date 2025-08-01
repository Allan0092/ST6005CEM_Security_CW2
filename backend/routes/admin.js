const express = require("express");
const {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllAnime,
  getAnimeDetails,
  createAnime,
  updateAnime,
  deleteAnime,
  getAnalytics,
  getContentStats,
} = require("../controller/AdminController");
const { protect, authorize } = require("../security/authMiddleware");
const { upload } = require("../controller/fileUpload");

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
router.post("/anime", upload.single("image"), createAnime);
router.put("/anime/:id", upload.single("image"), updateAnime);
router.delete("/anime/:id", deleteAnime);

module.exports = router;
