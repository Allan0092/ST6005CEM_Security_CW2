import { useState } from "react";
import { FaArrowLeft, FaHeart, FaSearch, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults] = useState([
    {
      id: 1,
      title: "Attack on Titan",
      image: "https://via.placeholder.com/300x400",
      rating: 9.0,
      year: 2023,
      genre: "Action, Drama",
    },
    {
      id: 2,
      title: "Demon Slayer",
      image: "https://via.placeholder.com/300x400",
      rating: 8.7,
      year: 2023,
      genre: "Action, Supernatural",
    },
    {
      id: 3,
      title: "My Hero Academia",
      image: "https://via.placeholder.com/300x400",
      rating: 8.5,
      year: 2023,
      genre: "Action, School",
    },
    {
      id: 4,
      title: "One Piece",
      image: "https://via.placeholder.com/300x400",
      rating: 9.2,
      year: 2023,
      genre: "Adventure, Comedy",
    },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Here you would typically make an API call to search for anime
  };

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
              "radial-gradient(circle, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.05) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.08) 0%, rgba(100, 116, 139, 0.04) 100%)",
          }}
        ></div>
      </div>

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
          <h1 className="text-2xl font-bold text-white">Search Anime</h1>
          <div></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anime..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FaSearch className="text-xl" />
            </button>
          </form>
        </div>

        {/* Search Results */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : "Popular Anime"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((anime) => (
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
                    <div className="flex space-x-3">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <FaStar />
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    {anime.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {anime.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">{anime.genre}</p>
                  <p className="text-gray-500 text-sm">{anime.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results Message (when searching) */}
        {searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-600 mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
