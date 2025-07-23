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

module.exports = {
  validateUpdateProfile,
};
// TODO: Undo Ancher Point!!
