import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaEye,
  FaHeart,
  FaPlay,
  FaSpinner,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaTv,
  FaExclamationTriangle,
} from "react-icons/fa";
import { animeAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Get initial search query from URL or location state
  const initialQuery = new URLSearchParams(location.search).get("q") || location.state?.searchQuery || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    type: "",
    status: "",
    rating: "",
    sort: "relevance",
  });

  // Available filter options
  const filterOptions = {
    genres: [
      "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
      "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
      "Supernatural", "Thriller", "Historical", "Military", "School",
      "Mecha", "Magic", "Demons", "Vampire", "Game", "Ecchi", "Harem",
      "Josei", "Seinen", "Shoujo", "Shounen", "Kids", "Music", "Parody"
    ],
    types: ["TV", "Movie", "OVA", "ONA", "Special", "Music"],
    statuses: ["airing", "completed", "upcoming", "cancelled"],
    ratings: [
      { value: "9-10", label: "9.0+ (Excellent)" },
      { value: "8-9", label: "8.0-8.9 (Very Good)" },
      { value: "7-8", label: "7.0-7.9 (Good)" },
      { value: "6-7", label: "6.0-6.9 (Fair)" },
      { value: "0-6", label: "Below 6.0" },
    ],
    sortOptions: [
      { value: "relevance", label: "Relevance" },
      { value: "-rating.average", label: "Highest Rated" },
      { value: "rating.average", label: "Lowest Rated" },
      { value: "-year", label: "Newest" },
      { value: "year", label: "Oldest" },
      { value: "title", label: "A-Z" },
      { value: "-title", label: "Z-A" },
      { value: "-viewCount", label: "Most Popular" },
      { value: "-createdAt", label: "Recently Added" },
    ],
  };

  // Generate years (current year + 2 down to 1960)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1959 }, (_, i) => currentYear + 2 - i);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    // Focus search input on page load
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const performSearch = async (query = searchQuery, page = 1, currentFilters = filters) => {
    if (!query.trim() && !hasActiveFilters(currentFilters)) {
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const searchParams = {
        q: query.trim(),
        page,
        limit: 20,
        ...currentFilters,
      };

      // Remove empty filters
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === "" || searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      const response = await animeAPI.searchAnime(searchParams);

      if (response.success) {
        setSearchResults(response.data.anime);
        setTotalResults(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(page);
        setHasSearched(true);

        // Update URL with search params
        const urlParams = new URLSearchParams();
        if (query.trim()) urlParams.set("q", query.trim());
        if (page > 1) urlParams.set("page", page.toString());
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value) urlParams.set(key, value);
        });

        const newUrl = `/search${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
        navigate(newUrl, { replace: true });
      } else {
        setError(response.message || "Search failed");
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query = searchQuery) => {
    setCurrentPage(1);
    performSearch(query, 1, filters);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    performSearch(searchQuery, 1, newFilters);
  };

  const hasActiveFilters = (currentFilters = filters) => {
    return Object.values(currentFilters).some(value => value !== "" && value !== "relevance");
  };

  const clearFilters = () => {
    const clearedFilters = {
      genre: "",
      year: "",
      type: "",
      status: "",
      rating: "",
      sort: "relevance",
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    performSearch(searchQuery, 1, clearedFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(searchQuery, page, filters);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      TV: "text-purple-400",
      Movie: "text-blue-400",
      OVA: "text-green-400",
      ONA: "text-orange-400",
      Special: "text-pink-400",
      Music: "text-red-400",
    };
    return colors[type] || "text-slate-400";
  };

  const getStatusColor = (status) => {
    const colors = {
      airing: "text-green-400",
      completed: "text-blue-400",
      upcoming: "text-yellow-400",
      cancelled: "text-red-400",
    };
    return colors[status] || "text-slate-400";
  };

  const formatYear = (year) => {
    return year || "Unknown";
  };

  const AnimeCard = ({ anime }) => (
    <Link to={`/anime/${anime._id}`}>
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={getImageUrl(anime.image?.url)}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/images/anime-placeholder.jpg";
            }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <FaPlay className="text-white text-2xl" />
          </div>

          {/* Rating badge */}
          {anime.rating?.average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 flex items-center">
              <FaStar className="text-yellow-400 text-xs mr-1" />
              <span className="text-white text-xs font-medium">
                {anime.rating.average.toFixed(1)}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded ${getTypeColor(anime.type)} bg-black/70`}>
              {anime.type}
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {anime.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{formatYear(anime.year)}</span>
            <span className="flex items-center">
              <FaEye className="mr-1" />
              {(anime.viewCount || 0).toLocaleString()}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`capitalize ${getStatusColor(anime.status)}`}>
              {anime.status}
            </span>
            <span className="flex items-center text-slate-400">
              <FaHeart className="mr-1" />
              {anime.favoritesCount || 0}
            </span>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded"
                >
                  {genre}
                </span>
              ))}
              {anime.genres.length > 2 && (
                <span className="text-xs text-slate-400">
                  +{anime.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <FaSearch className="mr-3 text-purple-400" />
            Search Anime
          </h1>
          <p className="text-slate-400">
            Discover your next favorite anime from our extensive collection
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.25)",
                border: "2px solid rgba(148, 163, 184, 0.3)",
              }}
            >
              <FaSearch className="text-slate-400 ml-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for anime titles, genres, studios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setHasSearched(false);
                    searchInputRef.current?.focus();
                  }}
                  className="text-slate-400 hover:text-white mr-2 transition-colors"
                >
                  <FaTimes />
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white px-6 py-4 transition-colors flex items-center"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters()
                  ? "bg-purple-600 text-white"
                  : "bg-slate-600 hover:bg-slate-500 text-white"
              }`}
            >
              <FaFilter className="mr-2" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>

            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-slate-400 hover:text-white transition-colors text-sm flex items-center"
              >
                <FaTimes className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Genre</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange("genre", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">All Genres</option>
                    {filterOptions.genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">All Types</option>
                    {filterOptions.types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">All Status</option>
                    {filterOptions.statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange("rating", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">All Ratings</option>
                    {filterOptions.ratings.map((rating) => (
                      <option key={rating.value} value={rating.value}>
                        {rating.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sort by</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  >
                    {filterOptions.sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        {hasSearched && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isLoading ? "Searching..." : `Search Results`}
              </h2>
              {!isLoading && (
                <p className="text-slate-400 text-sm">
                  {totalResults > 0 
                    ? `Found ${totalResults.toLocaleString()} anime${searchQuery ? ` for "${searchQuery}"` : ""}`
                    : `No anime found${searchQuery ? ` for "${searchQuery}"` : ""}`
                  }
                </p>
              )}
            </div>

            {!isLoading && totalResults > 0 && (
              <div className="flex items-center text-sm text-slate-400">
                <span className="mr-2">Page {currentPage} of {totalPages}</span>
                {filters.sort === "relevance" ? (
                  <FaSortAmountDown className="text-purple-400" />
                ) : (
                  <FaSortAmountUp className="text-purple-400" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => handleSearch()}
              className="text-red-300 hover:text-red-200 underline text-sm mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl animate-pulse"
                style={{ backgroundColor: "rgba(71, 85, 105, 0.15)" }}
              />
            ))}
          </div>
        )}

        {/* Search Results */}
        {!isLoading && hasSearched && (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map((anime) => (
                  <AnimeCard key={anime._id} anime={anime} />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-16 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <FaSearch className="text-6xl text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Results Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery
                    ? `We couldn't find any anime matching "${searchQuery}" with your current filters.`
                    : "Try adjusting your search filters to find what you're looking for."
                  }
                </p>
                <div className="space-x-4">
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setHasSearched(false);
                      searchInputRef.current?.focus();
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Try New Search
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Popular searches or suggestions when no search is performed */}
        {!hasSearched && !isLoading && (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <FaSearch className="text-6xl text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Search</h3>
            <p className="text-slate-400 mb-8">
              Search for anime by title, genre, studio, or use filters to discover new favorites
            </p>
            
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-white mb-4">Popular Searches</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Attack on Titan", "Demon Slayer", "One Piece", "Naruto", "Dragon Ball", "Studio Ghibli"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
