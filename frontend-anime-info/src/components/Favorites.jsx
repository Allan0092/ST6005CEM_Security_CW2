import { useState } from "react";
import { FaHeart, FaSignInAlt, FaStar, FaTrash, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Favorites = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "Attack on Titan",
      image: "/images/anime-placeholder.jpg",
      rating: 9.0,
      year: 2023,
      genre: "Action, Drama",
      dateAdded: "2025-01-15",
    },
    {
      id: 2,
      title: "Demon Slayer",
      image: "/images/anime-placeholder.jpg",
      rating: 8.7,
      year: 2023,
      genre: "Action, Supernatural",
      dateAdded: "2025-01-10",
    },
    {
      id: 3,
      title: "One Piece",
      image: "/images/anime-placeholder.jpg",
      rating: 9.2,
      year: 2023,
      genre: "Adventure, Comedy",
      dateAdded: "2025-01-05",
    },
  ]);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((anime) => anime.id !== id));
  };

  // Show login prompt for unauthenticated users
  if (!isLoading && !isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
            }}
          ></div>
          <div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              background:
                "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.12) 100%)",
            }}
          ></div>
        </div>

        {/* Header */}
        <div
          className="backdrop-blur-lg border-b p-6 relative z-10"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            borderColor: "rgba(148, 163, 184, 0.2)",
          }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
              <FaHeart className="text-red-400 mr-3" />
              My Favorites
            </h1>
            <p className="text-slate-400 mt-2">Your personal anime collection</p>
          </div>
        </div>

        {/* Login Required Message */}
        <div className="max-w-4xl mx-auto p-6 relative z-10">
          <div className="text-center py-20">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 mx-auto"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 15px 35px rgba(220, 38, 38, 0.4)",
              }}
            >
              <FaHeart className="text-white text-4xl" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">
              Sign in to view your favorites
            </h2>
            <p className="text-slate-300 mb-12 text-lg max-w-2xl mx-auto">
              Create an account or sign in to save your favorite anime and build your personal collection. 
              Track what you love and discover new shows based on your preferences.
            </p>

            {/* Feature Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div
                className="backdrop-blur-lg border rounded-xl p-6 text-center"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <FaHeart className="text-red-400 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-3">Save Favorites</h3>
                <p className="text-slate-300">Keep track of anime you love and want to recommend to others</p>
              </div>
              
              <div
                className="backdrop-blur-lg border rounded-xl p-6 text-center"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <FaStar className="text-amber-400 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-3">Rate & Review</h3>
                <p className="text-slate-300">Share your thoughts and ratings with the anime community</p>
              </div>
              
              <div
                className="backdrop-blur-lg border rounded-xl p-6 text-center"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="text-slate-400 text-3xl mb-4 mx-auto">📊</div>
                <h3 className="text-xl font-semibold text-white mb-3">Track Progress</h3>
                <p className="text-slate-300">Monitor your watching progress and get personalized recommendations</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-white text-lg"
                style={{
                  background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: "0 15px 35px rgba(100, 116, 139, 0.4)",
                }}
              >
                <FaUserPlus className="mr-3 text-xl" />
                Create Free Account
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-slate-200 hover:text-white border border-slate-500 hover:border-slate-400 text-lg"
              >
                <FaSignInAlt className="mr-3 text-xl" />
                Sign In
              </Link>
            </div>

            {/* Continue as Guest */}
            <div className="mt-8">
              <p className="text-slate-400 mb-4">Or continue exploring without an account</p>
              <Link
                to="/search"
                className="text-slate-300 hover:text-white font-medium transition-colors hover:underline underline-offset-4"
              >
                Browse Anime Collection →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  // Show favorites for authenticated users
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.12) 100%)",
          }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.1) 100%)",
          }}
        ></div>
      </div>

      {/* Header */}
      <div
        className="backdrop-blur-lg border-b p-6 relative z-10"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          borderColor: "rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
            <FaHeart className="text-red-400 mr-3" />
            My Favorites
          </h1>
          <p className="text-slate-400 mt-2">Your personal anime collection</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {favorites.length > 0 ? (
          <>
            {/* Stats */}
            <div
              className="backdrop-blur-lg border rounded-xl p-6 mb-8"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {favorites.length}
                  </div>
                  <div className="text-slate-300">Total Favorites</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-400 mb-2">
                    {(
                      favorites.reduce((sum, anime) => sum + anime.rating, 0) /
                      favorites.length
                    ).toFixed(1)}
                  </div>
                  <div className="text-slate-300">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-300 mb-2">
                    {new Set(favorites.map((anime) => anime.year)).size}
                  </div>
                  <div className="text-slate-300">Different Years</div>
                </div>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((anime) => (
                <div
                  key={anime.id}
                  className="backdrop-blur-lg border rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="relative">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = "/images/anime-placeholder.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => removeFavorite(anime.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300"
                        title="Remove from favorites"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div
                      className="absolute top-2 right-2 text-white px-2 py-1 rounded-lg text-sm flex items-center"
                      style={{ backgroundColor: "rgba(32, 31, 49, 0.8)" }}
                    >
                      <FaStar className="text-amber-400 mr-1" />
                      {anime.rating}
                    </div>
                    <div className="absolute top-2 left-2">
                      <FaHeart className="text-red-400 text-xl" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {anime.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-1">{anime.genre}</p>
                    <p className="text-slate-400 text-sm mb-2">{anime.year}</p>
                    <p className="text-slate-500 text-xs">
                      Added: {new Date(anime.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-8xl text-slate-600 mb-6">💔</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              No favorites yet
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start adding your favorite anime to build your personal
              collection. You can add favorites from the search page.
            </p>
            <Link
              to="/search"
              className="inline-block font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-white"
              style={{
                background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                boxShadow: "0 10px 25px rgba(100, 116, 139, 0.3)",
              }}
            >
              Discover Anime
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
