const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    // Request Information
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    },
    url: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    endpoint: {
      type: String,
      required: true,
      maxlength: 500,
    },
    
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userEmail: {
      type: String,
      default: null,
    },
    userRole: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "guest",
    },
    
    // Client Information
    ipAddress: {
      type: String,
      required: true,
      maxlength: 45, // IPv6 max length
    },
    userAgent: {
      type: String,
      maxlength: 1000,
    },
    
    // Response Information
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number, // in milliseconds
      required: true,
    },
    
    // Request Details
    requestSize: {
      type: Number, // in bytes
      default: 0,
    },
    responseSize: {
      type: Number, // in bytes
      default: 0,
    },
    
    // Error Information 
    errorMessage: {
      type: String,
      maxlength: 1000,
    },
    errorStack: {
      type: String,
      maxlength: 5000,
    },
    
    // Log Type and Level
    logType: {
      type: String,
      enum: ["request", "auth", "error", "admin", "security"],
      default: "request",
    },
    logLevel: {
      type: String,
      enum: ["info", "warn", "error", "critical"],
      default: "info",
    },
    
    // Additional Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Geolocation 
    location: {
      country: String,
      city: String,
      region: String,
    },
    
    // Security flags
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    
    // Retention
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
logSchema.index({ createdAt: -1 }); // Recent logs first
logSchema.index({ userId: 1, createdAt: -1 }); // User activity
logSchema.index({ ipAddress: 1, createdAt: -1 }); // IP tracking
logSchema.index({ logType: 1, createdAt: -1 }); // Filter by type
logSchema.index({ statusCode: 1, createdAt: -1 }); // Error tracking
logSchema.index({ isSuspicious: 1, createdAt: -1 }); // Security monitoring
logSchema.index({ endpoint: 1, method: 1, createdAt: -1 }); // Endpoint analysis

// Compound index for admin dashboard queries
logSchema.index({ 
  logType: 1, 
  logLevel: 1, 
  createdAt: -1 
});

// Virtual for formatted timestamp
logSchema.virtual("formattedTimestamp").get(function () {
  return this.createdAt.toISOString();
});

// Virtual for request summary
logSchema.virtual("requestSummary").get(function () {
  return `${this.method} ${this.endpoint} - ${this.statusCode}`;
});

// Static method to clean old logs
logSchema.statics.cleanOldLogs = async function (daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

// Static method to get log statistics
logSchema.statics.getStatistics = async function (timeframe = 24) {
  const startTime = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startTime } } },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
        uniqueIPs: { $addToSet: "$ipAddress" },
        errors: {
          $sum: {
            $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
          }
        },
        averageResponseTime: { $avg: "$responseTime" },
        suspiciousActivity: {
          $sum: {
            $cond: ["$isSuspicious", 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalRequests: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        uniqueIPs: { $size: "$uniqueIPs" },
        errors: 1,
        averageResponseTime: { $round: ["$averageResponseTime", 2] },
        suspiciousActivity: 1,
        errorRate: {
          $round: [
            { $multiply: [{ $divide: ["$errors", "$totalRequests"] }, 100] },
            2
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model("Log", logSchema);