const express = require("express");
const authRoutes = require("../security/auth");
const userRoutes = require("./user");
const animeRoutes = require("./anime");
const reviewRoutes = require("./review");
const searchRoutes = require("./search");
const dashboardRoutes = require("./dashboard");
const adminRoutes = require("./admin");
const logRoutes = require("./logs"); 

const router = express.Router();

// API versioning
const API_VERSION = "/api/v1";

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/anime`, animeRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/search`, searchRoutes);
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);
router.use(`${API_VERSION}/admin`, adminRoutes);
router.use(`${API_VERSION}/admin/logs`, logRoutes); 

// to check if api is running properly
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Anime Info API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      anime: `${API_VERSION}/anime`,
      reviews: `${API_VERSION}/reviews`,
      search: `${API_VERSION}/search`,
      dashboard: `${API_VERSION}/dashboard`,
      admin: `${API_VERSION}/admin`,
      logs: `${API_VERSION}/admin/logs`,
    },
  });
});

module.exports = router;
