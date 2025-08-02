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
const {
  validateReview,
  validateReportReview,
  validateReviewQuery,
  validateObjectId,
} = require("../validation/reviewValidation");

const router = express.Router();

// Public routes
router.get("/", validateReviewQuery, getReviews);
router.get("/top", getTopReviews);
router.get("/recent", getRecentReviews);
router.get("/:id", validateObjectId(), getReview);
router.get("/:id/likes", validateObjectId(), getReviewLikes);
router.get(
  "/anime/:animeId",
  validateObjectId("animeId"),
  validateReviewQuery,
  getAnimeReviews
);
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  validateReviewQuery,
  getUserReviews
);

// Protected routes
router.use(protect);

router.post("/", validateReview, createReview);
router
  .route("/:id")
  .put(validateObjectId(), validateReview, updateReview)
  .delete(validateObjectId(), deleteReview);

router.post("/:id/like", validateObjectId(), likeReview);
router.delete("/:id/like", validateObjectId(), unlikeReview);
router.post(
  "/:id/report",
  validateObjectId(),
  validateReportReview,
  reportReview
);

module.exports = router;
