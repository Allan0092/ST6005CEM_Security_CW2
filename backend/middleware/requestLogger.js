const Log = require("../model/Log");

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Track response data
  let responseBody = null;
  let responseSize = 0;
  
  // Override res.send to capture response
  res.send = function (body) {
    responseBody = body;
    responseSize = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body || '', 'utf8');
    return originalSend.call(this, body);
  };
  
  // Override res.json to capture response
  res.json = function (obj) {
    responseBody = obj;
    const jsonString = JSON.stringify(obj);
    responseSize = Buffer.byteLength(jsonString, 'utf8');
    return originalJson.call(this, obj);
  };
  
  // Log the request when response finishes
  res.on('finish', async () => {
    try {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Get client IP (handle proxies)
      const getClientIP = (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               req.ip ||
               'unknown';
      };
      
      // Determine log type and level
      const getLogTypeAndLevel = (req, statusCode) => {
        if (req.url.includes('/auth/')) {
          return { logType: 'auth', logLevel: statusCode >= 400 ? 'warn' : 'info' };
        }
        if (req.url.includes('/admin/')) {
          return { logType: 'admin', logLevel: statusCode >= 400 ? 'warn' : 'info' };
        }
        if (statusCode >= 500) {
          return { logType: 'error', logLevel: 'critical' };
        }
        if (statusCode >= 400) {
          return { logType: 'error', logLevel: 'warn' };
        }
        return { logType: 'request', logLevel: 'info' };
      };
      
      // Check for suspicious activity
      const isSuspicious = (req, statusCode) => {
        // Multiple failed login attempts
        if (req.url.includes('/auth/login') && statusCode === 401) return true;
        
        // SQL injection patterns
        const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(\b(OR|AND)\s+\d+\s*=\s*\d+)/i;
        if (sqlPatterns.test(req.url) || sqlPatterns.test(JSON.stringify(req.body))) return true;
        
        // XSS patterns
        const xssPatterns = /<script|javascript:|onload=|onerror=/i;
        if (xssPatterns.test(req.url) || xssPatterns.test(JSON.stringify(req.body))) return true;
        
        // Path traversal
        if (req.url.includes('../') || req.url.includes('..\\')) return true;
        
        // Admin access from non-admin
        if (req.url.includes('/admin/') && req.user?.role !== 'admin') return true;
        
        return false;
      };
      
      const { logType, logLevel } = getLogTypeAndLevel(req, res.statusCode);
      
      // Create log entry
      const logEntry = {
        method: req.method,
        url: req.originalUrl || req.url,
        endpoint: req.route?.path || req.url.split('?')[0],
        
        // User info (if authenticated)
        userId: req.user?._id || req.user?.id || null,
        userEmail: req.user?.email || null,
        userRole: req.user?.role || 'guest',
        
        // Client info
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        
        // Response info
        statusCode: res.statusCode,
        responseTime,
        
        // Request/Response size
        requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length']) : 0,
        responseSize,
        
        // Log classification
        logType,
        logLevel,
        
        // Security
        isSuspicious: isSuspicious(req, res.statusCode),
        
        // Additional metadata
        metadata: {
          referer: req.headers.referer || null,
          requestBody: req.method !== 'GET' ? sanitizeRequestBody(req.body) : null,
          query: Object.keys(req.query).length > 0 ? req.query : null,
          headers: sanitizeHeaders(req.headers),
        },
      };
      
      // Add error info if applicable
      if (res.statusCode >= 400 && responseBody) {
        try {
          const parsedResponse = typeof responseBody === 'string' 
            ? JSON.parse(responseBody) 
            : responseBody;
          
          if (parsedResponse.message) {
            logEntry.errorMessage = parsedResponse.message;
          }
        } catch (e) {
          // Response is not JSON, store as string if it's an error
          if (res.statusCode >= 400) {
            logEntry.errorMessage = String(responseBody).substring(0, 1000);
          }
        }
      }
      
      // Save to database (async, don't block response)
      Log.create(logEntry).catch(error => {
        console.error('Failed to save request log:', error);
      });
      
    } catch (error) {
      console.error('Request logging error:', error);
    }
  });
  
  next();
};

// Helper function to sanitize request body (remove sensitive data)
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'otp'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Helper function to sanitize headers 
const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return {
    'content-type': sanitized['content-type'],
    'user-agent': sanitized['user-agent'],
    'accept': sanitized['accept'],
    'origin': sanitized['origin'],
    'referer': sanitized['referer'],
  };
};

module.exports = requestLogger;