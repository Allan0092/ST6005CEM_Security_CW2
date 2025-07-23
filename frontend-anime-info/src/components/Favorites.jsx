import { useState } from "react";
import { FaHeart, FaStar, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const Favorites = () => {
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
