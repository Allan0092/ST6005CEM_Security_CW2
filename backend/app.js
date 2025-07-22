const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");

// Database connection
const connectDB = require("./config/db");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const routes = require("./routes");

require("dotenv").config({ path: "./config/config.env" });

connectDB();

const app = express();
