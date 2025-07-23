const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const https = require("https");
const http = require("http");
const fs = require("fs");

const connectDB = require("./config/db");

// Load SSL certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, "../cert/server.key")),
  cert: fs.readFileSync(path.join(__dirname, "../cert/server.crt")),
};

// Middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const routes = require("./routes");

require("dotenv").config({ path: "./config/config.env" });

connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    data: null,
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "file_storage")));

// Security headers for HTTPS
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// API routes
app.use(routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running with HTTPS",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      protocol: "HTTPS",
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// Create HTTP server for redirect 
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(
    301,
    `https://${req.headers.host.replace(/:\d+$/, "")}:${PORT}${req.url}`
  );
});
const httpServer = http.createServer(httpApp);

// Start HTTPS server
httpsServer.listen(PORT, () => {
  console.log(
    ` HTTPS Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(` Server URL: https://localhost:${PORT}`);
});

// Start HTTP redirect server
httpServer.listen(HTTP_PORT, () => {
  console.log(
    ` HTTP redirect server running on port ${HTTP_PORT} -> HTTPS:${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  httpsServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

module.exports = app;
