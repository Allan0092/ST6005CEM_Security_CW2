const jwt = require("jsonwebtoken");
const User = require("../model/User");

/**
 * Protect routes need to verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route - No token provided",
        errors: { auth: "Authentication required" },
        data: null,
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id from token payload
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized - User not found",
          errors: { auth: "Invalid token - user does not exist" },
          data: null,
        });
      }

      // Check if user is verified (if email verification is required)
      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: "Email verification required",
          errors: {
            auth: "Please verify your email before accessing this resource",
          },
          data: null,
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);

      if (tokenError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          errors: { auth: "Your session has expired. Please log in again." },
          data: null,
        });
      }

      if (tokenError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
          errors: { auth: "Invalid authentication token" },
          data: null,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
        errors: { auth: "Token verification failed" },
        data: null,
      });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
      errors: { server: "Internal authentication error" },
      data: null,
    });
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - No user found",
        errors: { auth: "Authentication required before role check" },
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(
          " or "
        )}. Your role: ${req.user.role}`,
        errors: { auth: "Insufficient permissions" },
        data: null,
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.isEmailVerified) {
          req.user = user;
        }
      } catch (tokenError) {
        // Silently fail for optional auth
        console.log(
          "Optional auth token verification failed:",
          tokenError.message
        );
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 */
const checkOwnership = (resourceUserField = "user") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: { auth: "Must be logged in to access this resource" },
        data: null,
      });
    }

    // Admin can access anything
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource
      ? req.resource[resourceUserField]
      : req.params.userId;

    if (
      !resourceUserId ||
      resourceUserId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied - You can only access your own resources",
        errors: { auth: "Insufficient permissions" },
        data: null,
      });
    }

    next();
  };
};

/**
 * Rate limiting for auth endpoints
 */
const authRateLimit = (windowMs = 15 * 60 * 1000, maxAttempts = 50) => { //TODO: Change 50 -> 5 after testing
  const attempts = new Map();

  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old attempts
    for (const [ip, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(ip);
      }
    }

    // Check current attempts
    const clientAttempts = attempts.get(clientIp);

    if (!clientAttempts) {
      attempts.set(clientIp, { count: 1, firstAttempt: now });
      return next();
    }

    if (clientAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil(
        (windowMs - (now - clientAttempts.firstAttempt)) / 1000 / 60
      );
      return res.status(429).json({
        success: false,
        message: `Too many authentication attempts. Try again in ${timeLeft} minutes.`,
        errors: { rateLimit: "Authentication rate limit exceeded" },
        data: { retryAfter: timeLeft },
      });
    }

    clientAttempts.count++;
    next();
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  authRateLimit,
};
