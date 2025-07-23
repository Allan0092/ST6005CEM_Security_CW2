const express = require("express");
const {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
} = require("../controller/UserController");
const { upload } = require("../controller/fileUpload");

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router
  .route("/profile")
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

router.post("/avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;
