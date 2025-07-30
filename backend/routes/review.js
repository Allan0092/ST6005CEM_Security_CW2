const express = require("express");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getAnimeReviews,
  likeReview,
  unlikeReview,
  reportReview,
  getReviewLikes,
  getTopReviews,
  getRecentReviews,
} = require("../controller/ReviewController");
const { protect, authorize } = require("../security/authMiddleware");
const { validateReview } = require("../validation/reviewValidation");

const router = express.Router();

// Public routes
router.get("/", getReviews);
router.get("/top", getTopReviews);
router.get("/recent", getRecentReviews);
router.get("/:id", getReview);
router.get("/:id/likes", getReviewLikes);
router.get("/anime/:animeId", getAnimeReviews);
router.get("/user/:userId", getUserReviews);

// Protected routes
router.use(protect);

router.post("/", validateReview, createReview);
router.route("/:id").put(validateReview, updateReview).delete(deleteReview);

router.post("/:id/like", likeReview);
router.delete("/:id/like", unlikeReview);
router.post("/:id/report", reportReview);

module.exports = router;
