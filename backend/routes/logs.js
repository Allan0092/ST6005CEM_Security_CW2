const express = require("express");
const {
  getLogs,
  getLogStats,
  cleanupLogs,
  exportLogs,
} = require("../controller/LogController");
const { protect, authorize } = require("../security/authMiddleware");

const router = express.Router();

// All log routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// Log management routes
router.get("/", getLogs);
router.get("/stats", getLogStats);
router.delete("/cleanup", cleanupLogs);
router.get("/export", exportLogs);

module.exports = router;