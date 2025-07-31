const Joi = require("joi");

// Password validation schema - strong password requirements
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
    )
  )
  .messages({
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 128 characters",
    "string.pattern.base":
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
  });

// Email validation schema
const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: {
      allow: [
        "com",
        "net",
        "org",
        "edu",
        "gov",
        "mil",
        "int",
        "co",
        "uk",
        "de",
        "fr",
        "jp",
        "au",
        "ca",
        "in",
      ],
    },
  })
  .lowercase()
  .trim()
  .max(254)
  .required()
  .messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "string.max": "Email cannot exceed 254 characters",
  });

// Name validation schema
const nameSchema = Joi.string()
  .trim()
  .min(2)
  .max(50)
  .pattern(/^[a-zA-Z\s'-]+$/)
  .required()
  .messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "string.pattern.base":
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    "string.empty": "Name is required",
  });

// Username validation schema
const usernameSchema = Joi.string()
  .trim()
  .min(3)
  .max(30)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .required()
  .messages({
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "string.pattern.base": "Username can only contain letters, numbers, and underscores",
    "string.empty": "Username is required",
  });

// Country validation schema
const countrySchema = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .required()
  .messages({
    "string.empty": "Country is required",
    "string.min": "Country name must be at least 2 characters",
    "string.max": "Country name cannot exceed 100 characters",
    "any.required": "Country is required",
  });

/**
 * Validate registration data
 */
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    country: countrySchema,
    password: passwordSchema.required(),
    agreeToTerms: Joi.boolean().valid(true).required().messages({
      "any.only": "You must agree to the terms of service",
      "boolean.base": "Terms agreement must be a boolean value",
    }),
    marketingEmails: Joi.boolean().default(false),
  }).options({
    stripUnknown: true, // Remove unknown fields
    abortEarly: false, // Return all validation errors, not just the first one
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
    rememberMe: Joi.boolean().default(false),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate forgot password data
 */
const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate reset password data
 */
const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    password: passwordSchema.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "string.empty": "Password confirmation is required",
      }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  // Validate reset token from URL params
  const tokenSchema = Joi.string()
    .required()
    .alphanum()
    .min(20)
    .max(100)
    .messages({
      "string.empty": "Reset token is required",
      "string.alphanum": "Invalid reset token format",
      "string.min": "Invalid reset token length",
      "string.max": "Invalid reset token length",
    });

  const { error: tokenError } = tokenSchema.validate(req.params.resetToken);

  if (tokenError) {
    return res.status(400).json({
      success: false,
      message: "Invalid reset token",
      errors: { token: tokenError.details[0].message },
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate change password data
 */
const validateChangePassword = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
    }),
    newPassword: passwordSchema.required(),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .optional()
      .messages({
        "any.only": "Passwords do not match",
      }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  // Check if current password and new password are the same
  if (value.currentPassword === value.newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password",
      errors: { newPassword: "New password must be different from current password" },
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate resend verification data
 */
const validateResendVerification = (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate refresh token data
 */
const validateRefreshToken = (req, res, next) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
    }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate email verification token from URL params
 */
const validateEmailVerification = (req, res, next) => {
  const schema = Joi.string().required().alphanum().min(20).max(100).messages({
    "string.empty": "Verification token is required",
    "string.alphanum": "Invalid verification token format",
    "string.min": "Invalid verification token length",
    "string.max": "Invalid verification token length",
  });

  const { error } = schema.validate(req.params.token);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification token",
      errors: { token: error.details[0].message },
      data: null,
    });
  }

  next();
};

/**
 * Validate OTP verification data
 */
const validateVerifyOTP = (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
    otpCode: Joi.string()
      .required()
      .pattern(/^\d{6}$/)
      .messages({
        "string.empty": "OTP code is required",
        "string.pattern.base": "OTP code must be 6 digits",
        "any.required": "OTP code is required",
      }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate resend OTP data
 */
const validateResendOTP = (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * General input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts and trim whitespace
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ""); // Remove event handlers
  };

  const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "string") {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateResendVerification,
  validateRefreshToken,
  validateEmailVerification,
  validateVerifyOTP,
  validateResendOTP,
  sanitizeInput,
};
