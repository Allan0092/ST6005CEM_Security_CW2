import { useState } from "react";
import { FaHeart, FaPlay, FaSearch, FaStar } from "react-icons/fa";
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
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Background Animation - Enhanced visibility */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.4) 0%, rgba(71, 85, 105, 0.2) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.35) 0%, rgba(100, 116, 139, 0.18) 100%)",
          }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            background:
              "radial-gradient(circle, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.15) 100%)",
          }}
        ></div>
      </div>

      {/* Main Content - Full width layout */}
      <main className="w-full px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
              Welcome back, {user.name}!
            </h2>
            <p className="text-2xl text-slate-300">
              Discover amazing anime and track your favorites
            </p>
          </div>

          {/* Quick Stats - Better spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
            <div
              className="backdrop-blur-lg border rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.2)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
              }}
            >
              <div className="text-4xl font-bold text-slate-200 mb-3">156</div>
              <div className="text-slate-300 text-lg">Anime Watched</div>
            </div>
            <div
              className="backdrop-blur-lg border rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.2)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
              }}
            >
              <div className="text-4xl font-bold text-red-400 mb-3">23</div>
              <div className="text-slate-300 text-lg">Favorites</div>
            </div>
            <div
              className="backdrop-blur-lg border rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.2)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
              }}
            >
              <div className="text-4xl font-bold text-slate-200 mb-3">8.7</div>
              <div className="text-slate-300 text-lg">Avg Rating</div>
            </div>
          </div>

          {/* Featured Anime - Enhanced layout */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Featured Anime
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {featuredAnime.map((anime) => (
                <div
                  key={anime.id}
                  className="backdrop-blur-lg border rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.2)",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                  }}
                >
                  <div className="relative">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-72 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        className="hover:bg-white/10 text-white rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                        }}
                      >
                        <FaPlay className="text-xl" />
                      </button>
                    </div>
                    <div
                      className="absolute top-3 right-3 text-white px-3 py-2 rounded-lg text-sm flex items-center font-semibold"
                      style={{ backgroundColor: "rgba(32, 31, 49, 0.9)" }}
                    >
                      <FaStar className="text-amber-400 mr-1" />
                      {anime.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {anime.title}
                    </h4>
                    <p className="text-slate-400">{anime.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Enhanced layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              to="/search"
              className="text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                boxShadow: "0 15px 35px rgba(100, 116, 139, 0.4)",
              }}
            >
              <FaSearch className="text-4xl mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3">
                Discover New Anime
              </h3>
              <p className="text-slate-200 text-lg">
                Find your next favorite series
              </p>
            </Link>
            <Link
              to="/favorites"
              className="text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 15px 35px rgba(220, 38, 38, 0.4)",
              }}
            >
              <FaHeart className="text-4xl mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold mb-3">My Favorites</h3>
              <p className="text-red-100 text-lg">
                View your saved anime collection
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
