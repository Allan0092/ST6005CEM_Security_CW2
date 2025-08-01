const Log = require("../model/Log");

/**
 * @desc    Get system logs with filtering and pagination
 * @route   GET /api/v1/admin/logs
 * @access  Private (Admin only)
 */
const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      logType = "",
      logLevel = "",
      userId = "",
      ipAddress = "",
      statusCode = "",
      method = "",
      startDate = "",
      endDate = "",
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    // Filter by log type
    if (logType) {
      query.logType = logType;
    }

    // Filter by log level
    if (logLevel) {
      query.logLevel = logLevel;
    }

    // Filter by user
    if (userId) {
      query.userId = userId;
    }

    // Filter by IP address
    if (ipAddress) {
      query.ipAddress = ipAddress;
    }

    // Filter by status code
    if (statusCode) {
      if (statusCode.includes('-')) {
        // Range query (e.g., "400-499")
        const [min, max] = statusCode.split('-').map(Number);
        query.statusCode = { $gte: min, $lte: max };
      } else {
        query.statusCode = parseInt(statusCode);
      }
    }

    // Filter by HTTP method
    if (method) {
      query.method = method.toUpperCase();
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search in URL, endpoint, or error message
    if (search.trim()) {
      query.$or = [
        { url: { $regex: search, $options: "i" } },
        { endpoint: { $regex: search, $options: "i" } },
        { errorMessage: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const logs = await Log.find(query)
      .populate("userId", "name email role")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Log.countDocuments(query);

    // Format logs for response
    const formattedLogs = logs.map(log => ({
      ...log,
      user: log.userId ? {
        id: log.userId._id,
        name: log.userId.name,
        email: log.userId.email,
        role: log.userId.role,
      } : null,
      formattedTimestamp: log.createdAt.toISOString(),
      requestSummary: `${log.method} ${log.endpoint} - ${log.statusCode}`,
    }));

    res.status(200).json({
      success: true,
      message: "Logs retrieved successfully",
      data: {
        logs: formattedLogs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
        filters: {
          logType,
          logLevel,
          userId,
          ipAddress,
          statusCode,
          method,
          startDate,
          endDate,
          search,
        },
      },
    });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve logs",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Get log statistics for dashboard
 * @route   GET /api/v1/admin/logs/stats
 * @access  Private (Admin only)
 */
const getLogStats = async (req, res) => {
  try {
    const { timeframe = 24 } = req.query; // hours

    // Get basic statistics
    const stats = await Log.getStatistics(Number(timeframe));
    
    // Get log type distribution
    const logTypeStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - Number(timeframe) * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: "$logType",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get status code distribution
    const statusCodeStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - Number(timeframe) * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$statusCode", 300] }, then: "2xx Success" },
                { case: { $lt: ["$statusCode", 400] }, then: "3xx Redirect" },
                { case: { $lt: ["$statusCode", 500] }, then: "4xx Client Error" },
                { case: { $gte: ["$statusCode", 500] }, then: "5xx Server Error" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get hourly request distribution
    const hourlyStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          requests: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get top endpoints
    const topEndpoints = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - Number(timeframe) * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { endpoint: "$endpoint", method: "$method" },
          requests: { $sum: 1 },
          averageResponseTime: { $avg: "$responseTime" },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { requests: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          endpoint: "$_id.endpoint",
          method: "$_id.method",
          requests: 1,
          averageResponseTime: { $round: ["$averageResponseTime", 2] },
          errors: 1,
          errorRate: {
            $round: [
              { $multiply: [{ $divide: ["$errors", "$requests"] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    // Get recent suspicious activity
    const suspiciousActivity = await Log.find({
      isSuspicious: true,
      createdAt: { $gte: new Date(Date.now() - Number(timeframe) * 60 * 60 * 1000) }
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      message: "Log statistics retrieved successfully",
      data: {
        overview: stats[0] || {
          totalRequests: 0,
          uniqueUsers: 0,
          uniqueIPs: 0,
          errors: 0,
          averageResponseTime: 0,
          suspiciousActivity: 0,
          errorRate: 0,
        },
        logTypeDistribution: logTypeStats,
        statusCodeDistribution: statusCodeStats,
        hourlyActivity: hourlyStats,
        topEndpoints,
        suspiciousActivity: suspiciousActivity.map(log => ({
          ...log,
          user: log.userId ? {
            name: log.userId.name,
            email: log.userId.email,
          } : null,
        })),
        timeframe: Number(timeframe),
      },
    });
  } catch (error) {
    console.error("Get log stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve log statistics",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Delete old logs
 * @route   DELETE /api/v1/admin/logs/cleanup
 * @access  Private (Admin only)
 */
const cleanupLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const result = await Log.cleanOldLogs(Number(daysToKeep));

    res.status(200).json({
      success: true,
      message: `Log cleanup completed. Deleted ${result.deletedCount} old log entries.`,
      data: {
        deletedCount: result.deletedCount,
        daysToKeep: Number(daysToKeep),
      },
    });
  } catch (error) {
    console.error("Log cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup logs",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

/**
 * @desc    Export logs to CSV
 * @route   GET /api/v1/admin/logs/export
 * @access  Private (Admin only)
 */
const exportLogs = async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString(),
      logType = "",
      format = "csv",
    } = req.query;

    let query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (logType) {
      query.logType = logType;
    }

    const logs = await Log.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      // Generate CSV content
      const csvHeaders = [
        "Timestamp",
        "Method",
        "Endpoint",
        "Status Code",
        "Response Time (ms)",
        "IP Address",
        "User Email",
        "User Role",
        "Log Type",
        "Log Level",
        "Error Message",
        "User Agent"
      ];

      const csvRows = logs.map(log => [
        log.createdAt.toISOString(),
        log.method,
        log.endpoint,
        log.statusCode,
        log.responseTime,
        log.ipAddress,
        log.userId?.email || "Guest",
        log.userRole,
        log.logType,
        log.logLevel,
        log.errorMessage || "",
        log.userAgent || ""
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="logs_${startDate.split('T')[0]}_to_${endDate.split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.status(200).json({
        success: true,
        message: "Logs exported successfully",
        data: { logs },
      });
    }
  } catch (error) {
    console.error("Export logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export logs",
      errors: { server: "Internal server error" },
      data: null,
    });
  }
};

module.exports = {
  getLogs,
  getLogStats,
  cleanupLogs,
  exportLogs,
};