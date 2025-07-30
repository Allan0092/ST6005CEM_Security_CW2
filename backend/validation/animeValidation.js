const Joi = require("joi");

/**
 * Validate anime creation data
 */
const validateCreateAnime = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().required().max(200).messages({
      "string.empty": "Anime title is required",
      "string.max": "Title cannot exceed 200 characters",
    }),
    alternativeTitles: Joi.array().items(Joi.string().trim()).optional(),
    synopsis: Joi.string().trim().required().max(2000).messages({
      "string.empty": "Synopsis is required",
      "string.max": "Synopsis cannot exceed 2000 characters",
    }),
    year: Joi.number()
      .integer()
      .required()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .messages({
        "number.base": "Year must be a number",
        "number.integer": "Year must be a whole number",
        "number.min": "Year cannot be before 1900",
        "number.max": "Year cannot be more than 5 years in the future",
        "any.required": "Release year is required",
      }),
    season: Joi.string()
      .valid("winter", "spring", "summer", "fall")
      .optional()
      .messages({
        "any.only": "Season must be one of: winter, spring, summer, fall",
      }),
    status: Joi.string()
      .valid("airing", "completed", "upcoming", "cancelled")
      .required()
      .messages({
        "any.only":
          "Status must be one of: airing, completed, upcoming, cancelled",
        "any.required": "Status is required",
      }),
    type: Joi.string()
      .valid("TV", "Movie", "OVA", "ONA", "Special", "Music")
      .required()
      .messages({
        "any.only": "Type must be one of: TV, Movie, OVA, ONA, Special, Music",
        "any.required": "Type is required",
      }),
    episodes: Joi.object({
      total: Joi.number().integer().min(1).optional(),
      duration: Joi.number().integer().min(1).optional(),
    }).optional(),
    genres: Joi.array().items(Joi.string().trim()).min(1).required().messages({
      "array.min": "At least one genre is required",
      "any.required": "Genres are required",
    }),
    studios: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().required(),
          role: Joi.string().valid("main", "supporting").optional(),
        })
      )
      .optional(),
    source: Joi.string()
      .valid(
        "manga",
        "light-novel",
        "web-novel",
        "visual-novel",
        "video-game",
        "original",
        "other"
      )
      .optional(),
    ageRating: Joi.string()
      .valid("G", "PG", "PG-13", "R", "R+", "Rx")
      .optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    trailer: Joi.object({
      url: Joi.string().uri().optional(),
      site: Joi.string().valid("youtube", "vimeo").optional(),
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
 * Validate anime update data
 */
const validateUpdateAnime = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(200).optional().messages({
      "string.max": "Title cannot exceed 200 characters",
    }),
    alternativeTitles: Joi.array().items(Joi.string().trim()).optional(),
    synopsis: Joi.string().trim().max(2000).optional().messages({
      "string.max": "Synopsis cannot exceed 2000 characters",
    }),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .optional()
      .messages({
        "number.base": "Year must be a number",
        "number.integer": "Year must be a whole number",
        "number.min": "Year cannot be before 1900",
        "number.max": "Year cannot be more than 5 years in the future",
      }),
    season: Joi.string()
      .valid("winter", "spring", "summer", "fall")
      .optional()
      .messages({
        "any.only": "Season must be one of: winter, spring, summer, fall",
      }),
    status: Joi.string()
      .valid("airing", "completed", "upcoming", "cancelled")
      .optional()
      .messages({
        "any.only":
          "Status must be one of: airing, completed, upcoming, cancelled",
      }),
    type: Joi.string()
      .valid("TV", "Movie", "OVA", "ONA", "Special", "Music")
      .optional()
      .messages({
        "any.only": "Type must be one of: TV, Movie, OVA, ONA, Special, Music",
      }),
    episodes: Joi.object({
      total: Joi.number().integer().min(1).optional(),
      duration: Joi.number().integer().min(1).optional(),
    }).optional(),
    genres: Joi.array().items(Joi.string().trim()).min(1).optional().messages({
      "array.min": "At least one genre is required",
    }),
    studios: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().required(),
          role: Joi.string().valid("main", "supporting").optional(),
        })
      )
      .optional(),
    source: Joi.string()
      .valid(
        "manga",
        "light-novel",
        "web-novel",
        "visual-novel",
        "video-game",
        "original",
        "other"
      )
      .optional(),
    ageRating: Joi.string()
      .valid("G", "PG", "PG-13", "R", "R+", "Rx")
      .optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    trailer: Joi.object({
      url: Joi.string().uri().optional(),
      site: Joi.string().valid("youtube", "vimeo").optional(),
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
 * Validate anime search/filter parameters
 */
const validateAnimeQuery = (req, res, next) => {
  const schema = Joi.object({
    search: Joi.string().trim().max(100).optional(),
    genre: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .optional(),
    season: Joi.string().valid("winter", "spring", "summer", "fall").optional(),
    status: Joi.string()
      .valid("airing", "completed", "upcoming", "cancelled")
      .optional(),
    type: Joi.string()
      .valid("TV", "Movie", "OVA", "ONA", "Special", "Music")
      .optional(),
    sort: Joi.string()
      .valid(
        "title",
        "-title",
        "year",
        "-year",
        "rating",
        "-rating",
        "createdAt",
        "-createdAt",
        "popularity",
        "-popularity"
      )
      .optional()
      .default("-createdAt"),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(50).optional().default(20),
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
      message: "Invalid query parameters",
      errors,
      data: null,
    });
  }

  req.validatedQuery = value;
  next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid anime ID",
      errors: { id: "Invalid anime ID format" },
      data: null,
    });
  }

  next();
};

module.exports = {
  validateCreateAnime,
  validateUpdateAnime,
  validateAnimeQuery,
  validateObjectId,
};
