import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaClock,
  FaFilm,
  FaFire,
  FaHeart,
  FaPlay,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    recentAnime: [],
    popularAnime: [],
    topRatedAnime: [],
    trendingAnime: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);

      const [
        recentResponse,
        popularResponse,
        topRatedResponse,
        trendingResponse,
      ] = await Promise.all([
        dashboardAPI.getRecentAnime(6),
        dashboardAPI.getPopularAnime(6),
        dashboardAPI.getTopRatedAnime(6),
        dashboardAPI.getTrendingAnime(6),
      ]);

      setDashboardData({
        recentAnime: recentResponse.success ? recentResponse.data.anime : [],
        popularAnime: popularResponse.success ? popularResponse.data.anime : [],
        topRatedAnime: topRatedResponse.success
          ? topRatedResponse.data.anime
          : [],
        trendingAnime: trendingResponse.success
          ? trendingResponse.data.anime
          : [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load anime data. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Anime card component
  const AnimeCard = ({ anime, showRating = true, showYear = true }) => (
    <Link to={`/anime/${anime._id}`}>
      {" "}
      {/* Wrap with Link */}
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        {/* Anime Image */}
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
            <div className="text-center">
              <FaPlay className="text-white text-2xl mb-2 mx-auto" />
              <p className="text-white text-sm">View Details</p>
            </div>
          </div>

          {/* Rating Badge */}
          {showRating && anime.rating?.average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 flex items-center">
              <FaStar className="text-yellow-400 text-xs mr-1" />
              <span className="text-white text-xs font-medium">
                {anime.rating.average.toFixed(1)}
              </span>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
              {anime.type}
            </span>
          </div>
        </div>

        {/* Anime Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {anime.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-400">
            {showYear && <span>{anime.year}</span>}
            <span className="flex items-center">
              <FaHeart className="mr-1" />
              {anime.favoritesCount || 0}
            </span>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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

  // Section component
  const AnimeSection = ({ title, anime, icon: Icon, isLoading }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Icon className="mr-3 text-purple-400" />
          {title}
        </h2>
        <Link
          to="/search"
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center"
        >
          View All <FaSearch className="ml-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl animate-pulse"
              style={{ backgroundColor: "rgba(71, 85, 105, 0.15)" }}
            />
          ))}
        </div>
      ) : anime.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {anime.map((item) => (
            <AnimeCard key={item._id} anime={item} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-xl"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <FaFilm className="text-4xl text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No anime found in this category</p>
        </div>
      )}
    </section>
  );

  // Function to get the welcome message based on authentication status
  const getWelcomeMessage = () => {
    if (isAuthenticated && user) {
      return `Welcome back, ${user.name}! 🎌`;
    }
    return "Welcome to AnimeInfo! 🎌";
  };

  // Function to get the subtitle message
  const getSubtitleMessage = () => {
    if (isAuthenticated) {
      return "Discover new anime, track your favorites, and connect with fellow otaku.";
    }
    return "Create an account to track your anime, write reviews, and discover new favorites.";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
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
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {getWelcomeMessage()}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            {getSubtitleMessage()}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Explore Anime
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="text-red-300 hover:text-red-200 underline text-sm mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Anime Sections */}
        <AnimeSection
          title="Recently Added"
          anime={dashboardData.recentAnime}
          icon={FaClock}
          isLoading={isLoadingData}
        />

        <AnimeSection
          title="Trending Now"
          anime={dashboardData.trendingAnime}
          icon={FaFire}
          isLoading={isLoadingData}
        />

        <AnimeSection
          title="Top Rated"
          anime={dashboardData.topRatedAnime}
          icon={FaStar}
          isLoading={isLoadingData}
        />

        <AnimeSection
          title="Most Popular"
          anime={dashboardData.popularAnime}
          icon={FaChartLine} 
          isLoading={isLoadingData}
        />

        {/* Call to Action for Unauthenticated Users */}
        {!isAuthenticated && (
          <section
            className="text-center py-16 rounded-2xl mt-16"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Anime Journey?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of anime fans. Track your watchlist, rate your
              favorites, and discover hidden gems tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
