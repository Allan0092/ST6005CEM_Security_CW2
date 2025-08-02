import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaStar,
  FaEye,
  FaUser,
  FaCalendarAlt,
  FaTv,
  FaFilter,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";

const Favorites = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    type: "",
    sort: "-createdAt",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, currentPage, filters]);

  const fetchFavorites = async () => {
    try {
      setIsLoadingFavorites(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 20,
        ...filters,
      };

      const response = await userAPI.getFavorites(params);

      if (response.success) {
        setFavorites(response.data.favorites);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError(response.message || "Failed to load favorites");
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setError("Failed to load favorites. Please try again.");
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const removeFavorite = async (animeId) => {
    try {
      setActionLoading(prev => ({ ...prev, [animeId]: true }));
      
      const response = await userAPI.removeFromFavorites(animeId);
      
      if (response.success) {
        setFavorites(prev => prev.filter(anime => anime._id !== animeId));
        setStats(prev => ({
          ...prev,
          totalFavorites: prev.totalFavorites - 1,
        }));
      } else {
        setError(response.message || "Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      setError("Failed to remove from favorites. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [animeId]: false }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genre: "",
      year: "",
      type: "",
      sort: "-createdAt",
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Show login prompt for unauthenticated users
  if (!isLoading && !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div
          className="text-center p-12 rounded-2xl backdrop-blur-lg max-w-md"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <FaUser className="text-6xl text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-400 mb-6">
            Please login to view your favorite anime collection.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || isLoadingFavorites) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div className="text-center">
          <FaSpinner className="text-4xl text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading your favorites...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FaHeart className="mr-3 text-red-400" />
                My Favorites
              </h1>
              <p className="text-slate-400 mt-1">
                {stats.totalFavorites || 0} anime in your collection
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                showFilters
                  ? "bg-purple-600 text-white"
                  : "bg-slate-600 hover:bg-slate-500 text-white"
              }`}
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Stats Cards */}
          {stats.totalFavorites > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="flex items-center">
                  <FaHeart className="text-red-400 text-xl mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalFavorites}
                    </div>
                    <div className="text-xs text-slate-400">Total Favorites</div>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="flex items-center">
                  <FaTv className="text-purple-400 text-xl mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.types?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">Different Types</div>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-400 text-xl mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.years?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">Different Years</div>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 text-xl mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.genres?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">Different Genres</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            className="p-6 rounded-xl mb-8"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">All Genres</option>
                  {stats.genres?.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">All Years</option>
                  {stats.years?.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {stats.types?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Sort by</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="-createdAt">Recently Added</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="-title">Title Z-A</option>
                  <option value="-year">Newest Anime</option>
                  <option value="year">Oldest Anime</option>
                  <option value="-rating.average">Highest Rated</option>
                  <option value="rating.average">Lowest Rated</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
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
              onClick={fetchFavorites}
              className="text-red-300 hover:text-red-200 underline text-sm mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <FaHeart className="text-6xl text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              No Favorites Yet
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start building your collection by adding anime to your favorites.
              Discover new shows and keep track of the ones you love!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Explore Anime
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((anime) => (
              <div
                key={anime._id}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                {/* Anime Card */}
                <Link to={`/anime/${anime._id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={getImageUrl(anime.image?.url)}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/images/anime-placeholder.jpg";
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <FaPlay className="text-white text-2xl" />
                    </div>

                    {/* Rating Badge */}
                    {anime.rating?.average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 flex items-center">
                        <FaStar className="text-yellow-400 text-xs mr-1" />
                        <span className="text-white text-xs font-medium">
                          {anime.rating.average.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(anime.type)} bg-black/70`}>
                        {anime.type}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Card Content */}
                <div className="p-4">
                  <Link to={`/anime/${anime._id}`}>
                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {anime.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>{anime.year}</span>
                    <span className="flex items-center">
                      <FaEye className="mr-1" />
                      {(anime.viewCount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Genres */}
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
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

                  {/* Date Added */}
                  <div className="text-xs text-slate-500 mb-3">
                    Added {formatDate(anime.dateAdded)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavorite(anime._id)}
                    disabled={actionLoading[anime._id]}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {actionLoading[anime._id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaTrash className="mr-2" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
