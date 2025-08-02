const Joi = require("joi");

/**
 * Validate review creation/update data
 */
const validateReview = (req, res, next) => {
  const schema = Joi.object({
    anime: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Anime ID is required",
        "string.pattern.base": "Invalid anime ID format",
        "any.required": "Anime ID is required",
      }),
    rating: Joi.number().integer().min(1).max(10).required().messages({
      "number.base": "Rating must be a number",
      "number.integer": "Rating must be a whole number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 10",
      "any.required": "Rating is required",
    }),
    title: Joi.string().trim().required().min(5).max(100).messages({
      "string.empty": "Review title is required",
      "string.min": "Title must be at least 5 characters long",
      "string.max": "Title cannot exceed 100 characters",
      "any.required": "Review title is required",
    }),
    content: Joi.string().trim().required().min(10).max(2000).messages({
      "string.empty": "Review content is required",
      "string.min": "Content must be at least 10 characters long",
      "string.max": "Content cannot exceed 2000 characters",
      "any.required": "Review content is required",
    }),
    pros: Joi.array()
      .items(
        Joi.string().trim().max(200).messages({
          "string.max": "Each pro cannot exceed 200 characters",
        })
      )
      .max(10)
      .optional()
      .messages({
        "array.max": "Cannot have more than 10 pros",
      }),
    cons: Joi.array()
      .items(
        Joi.string().trim().max(200).messages({
          "string.max": "Each con cannot exceed 200 characters",
        })
      )
      .max(10)
      .optional()
      .messages({
        "array.max": "Cannot have more than 10 cons",
      }),
    spoilerWarning: Joi.boolean().optional().default(false),
    episodeWatched: Joi.number().integer().min(1).optional().messages({
      "number.base": "Episode watched must be a number",
      "number.integer": "Episode watched must be a whole number",
      "number.min": "Episode watched must be at least 1",
    }),
    watchStatus: Joi.string()
      .valid("watching", "completed", "dropped")
      .required()
      .messages({
        "string.empty": "Watch status is required",
        "any.only": "Watch status must be one of: watching, completed, dropped",
        "any.required": "Watch status is required",
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
 * Validate report review data
 */
const validateReportReview = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string()
      .valid("spam", "inappropriate", "spoiler", "harassment", "other")
      .required()
      .messages({
        "string.empty": "Report reason is required",
        "any.only":
          "Reason must be one of: spam, inappropriate, spoiler, harassment, other",
        "any.required": "Report reason is required",
      }),
    description: Joi.string().trim().max(500).optional().messages({
      "string.max": "Description cannot exceed 500 characters",
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
 * Validate review query parameters
 */
const validateReviewQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(50).optional().default(10),
    sort: Joi.string()
      .valid(
        "createdAt",
        "-createdAt",
        "rating",
        "-rating",
        "helpfulVotes.count",
        "-helpfulVotes.count"
      )
      .optional()
      .default("-createdAt"),
    spoilers: Joi.string().valid("true", "false").optional().default("false"),
    anime: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    rating: Joi.number().integer().min(1).max(10).optional(),
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
 * Validate ObjectId parameter
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        errors: { [paramName]: "Invalid ID format" },
        data: null,
      });
    }

    next();
  };
};

module.exports = {
  validateReview,
  validateReportReview,
  validateReviewQuery,
  validateObjectId,
};
