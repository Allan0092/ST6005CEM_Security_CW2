const Joi = require("joi");

// Name validation schema
const nameSchema = Joi.string()
  .trim()
  .min(2)
  .max(50)
  .pattern(/^[a-zA-Z\s'-]+$/)
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
  .messages({
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "string.pattern.base":
      "Username can only contain letters, numbers, and underscores",
  });

// Country validation schema
const countrySchema = Joi.string().trim().min(2).max(100).messages({
  "string.min": "Country name must be at least 2 characters",
  "string.max": "Country name cannot exceed 100 characters",
});

// Bio validation schema
const bioSchema = Joi.string().trim().max(500).allow("").messages({
  "string.max": "Bio cannot exceed 500 characters",
});

/**
 * Validate update profile data
 */
const validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    name: nameSchema.optional(),
    username: usernameSchema.optional(),
    country: countrySchema.optional(),
    bio: bioSchema.optional(),
    dateOfBirth: Joi.date().max("now").optional().messages({
      "date.max": "Date of birth cannot be in the future",
    }),
    location: Joi.string().trim().max(100).optional().messages({
      "string.max": "Location cannot exceed 100 characters",
    }),
    website: Joi.string().uri().optional().messages({
      "string.uri": "Website must be a valid URL",
    }),
    socialMedia: Joi.object({
      twitter: Joi.string().trim().max(50).optional(),
      instagram: Joi.string().trim().max(50).optional(),
      discord: Joi.string().trim().max(50).optional(),
    }).optional(),
    privacy: Joi.object({
      showEmail: Joi.boolean().optional(),
      showWatchList: Joi.boolean().optional(),
      showFavorites: Joi.boolean().optional(),
      allowFollowers: Joi.boolean().optional(),
    }).optional(),
    preferences: Joi.object({
      preferredGenres: Joi.array().items(Joi.string()).optional(),
      notifications: Joi.boolean().optional(),
      marketingEmails: Joi.boolean().optional(),
      language: Joi.string().valid("en", "ja", "es", "fr", "de").optional(),
      theme: Joi.string().valid("light", "dark", "auto").optional(),
    }).optional(),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path.join(".");
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
 * Validate watch list data
 */
const validateWatchList = (req, res, next) => {
  const schema = Joi.object({
    animeId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "Anime ID is required",
        "string.pattern.base": "Invalid anime ID format",
      }),
    status: Joi.string()
      .valid("watching", "completed", "plan-to-watch", "dropped", "on-hold")
      .required()
      .messages({
        "string.empty": "Status is required",
        "any.only":
          "Status must be one of: watching, completed, plan-to-watch, dropped, on-hold",
      }),
    rating: Joi.number().integer().min(1).max(10).optional().messages({
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 10",
      "number.integer": "Rating must be a whole number",
    }),
    progress: Joi.object({
      episodesWatched: Joi.number().integer().min(0).optional().messages({
        "number.min": "Episodes watched cannot be negative",
        "number.integer": "Episodes watched must be a whole number",
      }),
    }).optional(),
    notes: Joi.string().trim().max(500).optional().messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
    favorite: Joi.boolean().optional(),
    priority: Joi.string().valid("low", "medium", "high").optional().messages({
      "any.only": "Priority must be one of: low, medium, high",
    }),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    rewatching: Joi.boolean().optional(),
    tags: Joi.array()
      .items(Joi.string().trim().max(20))
      .max(10)
      .optional()
      .messages({
        "array.max": "Cannot have more than 10 tags",
      }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path.join(".");
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      data: null,
    });
  }

  // Additional validation: end date should be after start date
  if (value.startDate && value.endDate && value.startDate >= value.endDate) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: {
        endDate: "End date must be after start date",
      },
      data: null,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate add to favorites
 */
const validateAddFavorite = (req, res, next) => {
  const schema = Joi.object({
    animeId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "Anime ID is required",
        "string.pattern.base": "Invalid anime ID format",
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
 * Validate preferences update
 */
const validatePreferences = (req, res, next) => {
  const schema = Joi.object({
    preferredGenres: Joi.array()
      .items(Joi.string())
      .max(10)
      .optional()
      .messages({
        "array.max": "Cannot select more than 10 preferred genres",
      }),
    marketingEmails: Joi.boolean().optional(),
    language: Joi.string()
      .valid("en", "ja", "es", "fr", "de")
      .optional()
      .messages({
        "any.only": "Language must be one of: en, ja, es, fr, de",
      }),
    theme: Joi.string().valid("light", "dark", "auto").optional().messages({
      "any.only": "Theme must be one of: light, dark, auto",
    }),
    autoplay: Joi.boolean().optional(),
    showAdultContent: Joi.boolean().optional(),
    defaultWatchStatus: Joi.string()
      .valid("watching", "plan-to-watch")
      .optional()
      .messages({
        "any.only":
          "Default watch status must be either watching or plan-to-watch",
      }),
  }).options({
    stripUnknown: true,
    abortEarly: false,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path.join(".");
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
 * Validate email update data
 */
const validateUpdateEmail = (req, res, next) => {
  const schema = Joi.object({
    newEmail: Joi.string().email().required().lowercase().trim().messages({
      "string.empty": "New email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "New email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Current password is required",
      "any.required": "Current password is required",
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

module.exports = {
  validateUpdateProfile,
  validateWatchList,
  validateAddFavorite,
  validatePreferences,
  validateUpdateEmail,
};
