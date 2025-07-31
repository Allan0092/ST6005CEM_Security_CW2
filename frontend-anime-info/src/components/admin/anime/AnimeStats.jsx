import {
  FaFilm,
  FaPlay,
  FaCheck,
  FaClock,
  FaStar,
  FaEye,
  FaHeart,
} from "react-icons/fa";

const AnimeStats = ({ stats, isLoading }) => {
  const statCards = [
    {
      title: "Total Anime",
      value: stats?.anime?.total || 0,
      icon: FaFilm,
      color: "purple",
      description: "All anime in database",
    },
    {
      title: "Currently Airing",
      value: stats?.anime?.airing || 0,
      icon: FaPlay,
      color: "green",
      description: "Ongoing series",
    },
    {
      title: "Completed Series",
      value: stats?.anime?.completed || 0,
      icon: FaCheck,
      color: "blue",
      description: "Finished anime",
    },
    {
      title: "Upcoming",
      value: stats?.anime?.upcoming || 0,
      icon: FaClock,
      color: "yellow",
      description: "Yet to be released",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: "text-purple-400",
      green: "text-green-400",
      blue: "text-blue-400",
      yellow: "text-yellow-400",
      red: "text-red-400",
      orange: "text-orange-400",
    };
    return colors[color] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl animate-pulse"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div className="h-4 bg-slate-600 rounded mb-3"></div>
            <div className="h-6 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border hover:shadow-lg transition-all duration-300"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <stat.icon className={`text-xl ${getColorClasses(stat.color)}`} />
          </div>

          <div className="text-2xl font-bold text-white mb-1">
            {stat.value.toLocaleString()}
          </div>

          <div className="text-xs text-slate-400">{stat.title}</div>

          <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
        </div>
      ))}

      {/* Additional Analytics Cards */}
      <div
        className="md:col-span-2 lg:col-span-4 p-4 rounded-xl border"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">Quick Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-700/30">
            <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {stats?.anime?.averageRating || "0.0"}
            </div>
            <div className="text-xs text-slate-400">Average Rating</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-slate-700/30">
            <FaEye className="text-blue-400 text-2xl mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {(stats?.anime?.totalViews || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total Views</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-slate-700/30">
            <FaHeart className="text-red-400 text-2xl mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {(stats?.anime?.totalFavorites || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total Favorites</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeStats;