const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../file_storage"); // parent directory
const avatarDir = path.join(uploadDir, "avatar"); // for user's avatar
const animeDir = path.join(uploadDir, "anime"); // for storing images related to anime

[uploadDir, avatarDir, animeDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDir;

    if (file.fieldname === "avatar") {
      uploadPath = avatarDir;
    } else if (file.fieldname === "image" || file.fieldname === "bannerImage") {
      uploadPath = animeDir;
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix + extension;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    // Allowed image types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        ),
        false
      );
    }
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: fileFilter,
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
        errors: { file: "File size cannot exceed 5MB" },
        data: null,
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
        errors: { file: "Cannot upload more than 5 files at once" },
        data: null,
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field",
        errors: { file: "Unexpected file field" },
        data: null,
      });
    }
  }

  if (err.message) {
    return res.status(400).json({
      success: false,
      message: "File upload error",
      errors: { file: err.message },
      data: null,
    });
  }

  next(err);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
  return false;
};

// Utility function to get file URL
const getFileUrl = (filename, type = "avatar") => {
  if (!filename) return null;

  const baseUrl = process.env.BASE_URL || "https://localhost:3000";
  return `${baseUrl}/api/v1/uploads/${type}/${filename}`;
};

module.exports = {
  upload,
  handleMulterError,
  deleteFile,
  getFileUrl,
};
