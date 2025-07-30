const express = require("express");
const {
  getAllAnime,
  getAnime,
  createAnime,
  updateAnime,
  deleteAnime,
  searchAnime,
  getPopularAnime,
  getTopRatedAnime,
  getRecentAnime,
  getAnimeByGenre,
  getAnimeByYear,
  getAnimeByStatus,
  getRelatedAnime,
  getFeaturedAnime,
  getAnimeStats,
  uploadAnimeImage,
  getAnimeReviews,
  addAnimeView,
  reportAnime,
  getAnimeCharacters,
  getAnimeStaff,
  toggleAnimeFavorite,
} = require("../controller/AnimeController");
const { protect, authorize } = require("../security/authMiddleware");
const {
  validateCreateAnime,
  validateUpdateAnime,
  validateAnimeQuery,
  validateObjectId,
} = require("../validation/animeValidation");
const { upload } = require("../controller/fileUpload");

const router = express.Router();

// Public routes
router.get("/", validateAnimeQuery, getAllAnime);
router.get("/search", validateAnimeQuery, searchAnime);
router.get("/popular", getPopularAnime);
router.get("/top-rated", getTopRatedAnime);
router.get("/recent", getRecentAnime);
router.get("/featured", getFeaturedAnime);
router.get("/genre/:genre", getAnimeByGenre);
router.get("/year/:year", getAnimeByYear);
router.get("/status/:status", getAnimeByStatus);

router.route("/:id").get(validateObjectId, getAnime);

router.get("/:id/related", validateObjectId, getRelatedAnime);
router.get("/:id/reviews", validateObjectId, getAnimeReviews);
router.get("/:id/characters", validateObjectId, getAnimeCharacters);
router.get("/:id/staff", validateObjectId, getAnimeStaff);
router.get("/:id/stats", validateObjectId, getAnimeStats);

// Protected routes
router.use(protect);

router.post("/:id/view", validateObjectId, addAnimeView);
router.post("/:id/favorite", validateObjectId, toggleAnimeFavorite);
router.post("/:id/report", validateObjectId, reportAnime);

// Admin only routes
router.use(authorize("admin"));

router.post("/", validateCreateAnime, createAnime);
router
  .route("/:id")
  .put(validateObjectId, validateUpdateAnime, updateAnime)
  .delete(validateObjectId, deleteAnime);

router.post(
  "/:id/upload-image",
  validateObjectId,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  uploadAnimeImage
);

module.exports = router;
