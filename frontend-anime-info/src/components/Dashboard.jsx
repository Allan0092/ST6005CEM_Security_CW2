import { useState } from "react";
import {
  FaHeart,
  FaHome,
  FaPlay,
  FaSearch,
  FaSignOutAlt,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://via.placeholder.com/150",
  });

  const [featuredAnime] = useState([
    {
      id: 1,
      title: "Attack on Titan",
      image: "https://via.placeholder.com/300x400",
      rating: 9.0,
      year: 2023,
    },
    {
      id: 2,
      title: "Demon Slayer",
      image: "https://via.placeholder.com/300x400",
      rating: 8.7,
      year: 2023,
    },
    {
      id: 3,
      title: "One Piece",
      image: "https://via.placeholder.com/300x400",
      rating: 9.2,
      year: 2023,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AnimeInfo
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/dashboard"
                  className="text-white hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <FaHome className="mr-2" />
                  Home
                </Link>
                <Link
                  to="/search"
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <FaSearch className="mr-2" />
                  Search
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <FaHeart className="mr-2" />
                  Favorites
                </Link>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
              </div>
              <Link
                to="/login"
                className="text-gray-300 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user.name}!
            </h2>
            <p className="text-xl text-gray-300">
              Discover amazing anime and track your favorites
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
              <div className="text-gray-300">Anime Watched</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">23</div>
              <div className="text-gray-300">Favorites</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">8.7</div>
              <div className="text-gray-300">Avg Rating</div>
            </div>
          </div>

          {/* Featured Anime */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Featured Anime
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAnime.map((anime) => (
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
                      <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <FaPlay />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      {anime.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {anime.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{anime.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/search"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105"
            >
              <FaSearch className="text-3xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Discover New Anime</h3>
              <p className="text-purple-100">Find your next favorite series</p>
            </Link>
            <Link
              to="/favorites"
              className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105"
            >
              <FaHeart className="text-3xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">My Favorites</h3>
              <p className="text-pink-100">View your saved anime collection</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
