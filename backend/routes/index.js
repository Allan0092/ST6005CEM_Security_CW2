const express = require("express");
const userRoutes = require("./user");

const router = express.Router();

// API versioning
const API_VERSION = "/api/v1";

// Mount routes
router.use(`${API_VERSION}/users`, userRoutes);

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
      users: `${API_VERSION}/users`,
    },
  });
});

module.exports = router;
