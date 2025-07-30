const express = require("express");
const {
  globalSearch,
  searchAnime,
  searchUsers,
  searchReviews,
  getSearchSuggestions,
  getPopularSearches,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getSearchFilters,
} = require("../controller/SearchController");
const { protect } = require("../security/authMiddleware");
const { validateSearch } = require("../validation/searchValidation");

const router = express.Router();

// Public routes
router.get("/global", validateSearch, globalSearch);
router.get("/anime", validateSearch, searchAnime);
router.get("/users", validateSearch, searchUsers);
router.get("/reviews", validateSearch, searchReviews);
router.get("/suggestions", getSearchSuggestions);
router.get("/popular", getPopularSearches);
router.get("/filters", getSearchFilters);

// Protected routes
router.use(protect);

router.post("/history", saveSearchHistory);
router.get("/history", getSearchHistory);
router.delete("/history", clearSearchHistory);

module.exports = router;
