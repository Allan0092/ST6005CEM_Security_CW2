const Joi = require("joi");

/**
 * Validate search parameters
 */
const validateSearch = (req, res, next) => {
  const schema = Joi.object({
    q: Joi.string().trim().min(1).max(100).optional().messages({
      "string.min": "Search query must be at least 1 character long",
      "string.max": "Search query cannot exceed 100 characters",
    }),
    type: Joi.string()
      .valid("anime", "users", "reviews", "all")
      .optional()
      .default("all")
      .messages({
        "any.only": "Search type must be one of: anime, users, reviews, all",
      }),
    category: Joi.string()
      .valid("title", "genre", "studio", "year", "all")
      .optional()
      .default("all")
      .messages({
        "any.only":
          "Search category must be one of: title, genre, studio, year, all",
      }),
    genre: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .optional()
      .messages({
        "number.min": "Year cannot be before 1900",
        "number.max": "Year cannot be more than 5 years in the future",
      }),
    status: Joi.string()
      .valid("airing", "completed", "upcoming", "cancelled")
      .optional()
      .messages({
        "any.only":
          "Status must be one of: airing, completed, upcoming, cancelled",
      }),
    rating: Joi.object({
      min: Joi.number().min(0).max(10).optional(),
      max: Joi.number().min(0).max(10).optional(),
    }).optional(),
    sort: Joi.string()
      .valid(
        "relevance",
        "title",
        "-title",
        "rating",
        "-rating",
        "year",
        "-year",
        "createdAt",
        "-createdAt"
      )
      .optional()
      .default("relevance")
      .messages({
        "any.only":
          "Sort must be one of: relevance, title, -title, rating, -rating, year, -year, createdAt, -createdAt",
      }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 50",
      }),
  }).options({
    stripUnknown: true,
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });

    return res.status(400).json({
      success: false,
      message: "Invalid search parameters",
      errors,
      data: null,
    });
  }

  // Additional validation: ensure min rating is less than max rating
  if (
    value.rating &&
    value.rating.min &&
    value.rating.max &&
    value.rating.min > value.rating.max
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: {
        rating: "Minimum rating cannot be greater than maximum rating",
      },
      data: null,
    });
  }

  req.validatedQuery = value;
  next();
};

/**
 * Validate search history data
 */
const validateSearchHistory = (req, res, next) => {
  const schema = Joi.object({
    query: Joi.string().trim().required().min(1).max(100).messages({
      "string.empty": "Search query is required",
      "string.min": "Search query must be at least 1 character long",
      "string.max": "Search query cannot exceed 100 characters",
    }),
    type: Joi.string()
      .valid("anime", "users", "reviews", "all")
      .optional()
      .default("all"),
    filters: Joi.object().optional(),
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
  validateSearch,
  validateSearchHistory,
};
