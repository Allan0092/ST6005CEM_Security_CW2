import { useState } from "react";
import { FaArrowLeft, FaHeart, FaStar, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "Attack on Titan",
      image: "https://via.placeholder.com/300x400",
      rating: 9.0,
      year: 2023,
      genre: "Action, Drama",
      dateAdded: "2025-01-15",
    },
    {
      id: 2,
      title: "Demon Slayer",
      image: "https://via.placeholder.com/300x400",
      rating: 8.7,
      year: 2023,
      genre: "Action, Supernatural",
      dateAdded: "2025-01-10",
    },
    {
      id: 3,
      title: "One Piece",
      image: "https://via.placeholder.com/300x400",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FaHeart className="text-red-400 mr-2" />
            My Favorites
          </h1>
          <div></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {favorites.length > 0 ? (
          <>
            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {favorites.length}
                  </div>
                  <div className="text-gray-300">Total Favorites</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {(
                      favorites.reduce((sum, anime) => sum + anime.rating, 0) /
                      favorites.length
                    ).toFixed(1)}
                  </div>
                  <div className="text-gray-300">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {new Set(favorites.map((anime) => anime.year)).size}
                  </div>
                  <div className="text-gray-300">Different Years</div>
                </div>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((anime) => (
                <div
                  key={anime.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-64 object-cover"
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
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
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
                    <p className="text-gray-400 text-sm mb-1">{anime.genre}</p>
                    <p className="text-gray-500 text-sm mb-2">{anime.year}</p>
                    <p className="text-gray-600 text-xs">
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
            <div className="text-8xl text-gray-600 mb-6">💔</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start adding your favorite anime to build your personal
              collection. You can add favorites from the search page or
              dashboard.
            </p>
            <div className="space-y-4">
              <Link
                to="/search"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Discover Anime
              </Link>
              <div className="block">
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Go back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
