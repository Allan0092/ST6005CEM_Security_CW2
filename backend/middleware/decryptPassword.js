const CryptoJS = require("crypto-js");

// Same key as in the frontend
const ENCRYPTION_KEY = "secret-key"; //TODO change key after testing

const decryptPassword = (req, res, next) => {
  try {
    // Decrypt currentPassword if present
    if (req.body.currentPassword) {
      const bytes = CryptoJS.AES.decrypt(
        req.body.currentPassword,
        ENCRYPTION_KEY
      );
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid current password encryption",
          errors: { currentPassword: "Current password decryption failed" },
          data: null,
        });
      }

      req.body.currentPassword = decryptedPassword;
    }

    // Decrypt newPassword if present
    if (req.body.newPassword) {
      const bytes = CryptoJS.AES.decrypt(req.body.newPassword, ENCRYPTION_KEY);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid new password encryption",
          errors: { newPassword: "New password decryption failed" },
          data: null,
        });
      }

      req.body.newPassword = decryptedPassword;
    }

    // Decrypt password 
    if (req.body.password) {
      // Decrypt the password
      const bytes = CryptoJS.AES.decrypt(req.body.password, ENCRYPTION_KEY);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid password encryption",
          errors: { password: "Password decryption failed" },
          data: null,
        });
      }

      req.body.password = decryptedPassword;
    }

    next();
  } catch (error) {
    console.error("Password decryption error:", error);
    return res.status(400).json({
      success: false,
      message: "Password decryption failed",
      errors: { password: "Invalid password format" },
      data: null,
    });
  }
};

module.exports = decryptPassword;
