import { useState } from "react";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaStar,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaFilm,
} from "react-icons/fa";

const AnimeList = ({
  anime,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onAnimeSelect,
  onAnimeEdit,
  onAnimeUpdate,
  onAnimeDelete,
}) => {
  const [selectedAnime, setSelectedAnime] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      airing: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          statusStyles[status] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      TV: "text-purple-400",
      Movie: "text-blue-400",
      OVA: "text-green-400",
      ONA: "text-yellow-400",
      Special: "text-orange-400",
      Music: "text-pink-400",
    };

    return (
      <span className={`text-xs ${typeColors[type] || "text-slate-400"}`}>
        {type}
      </span>
    );
  };

  const handleSelectAnime = (animeId) => {
    setSelectedAnime((prev) =>
      prev.includes(animeId)
        ? prev.filter((id) => id !== animeId)
        : [...prev, animeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnime.length === anime.length) {
      setSelectedAnime([]);
    } else {
      setSelectedAnime(anime.map((item) => item._id));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden animate-pulse"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div className="aspect-[3/4] bg-slate-600"></div>
            <div className="p-4">
              <div className="h-4 bg-slate-600 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (anime.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <FaFilm className="text-4xl text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Anime Found</h3>
        <p className="text-slate-400 mb-4">
          No anime matches your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedAnime.length === anime.length && anime.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-slate-400">
              {selectedAnime.length > 0
                ? `${selectedAnime.length} selected`
                : `${anime.length} anime`}
            </span>
          </div>

          {selectedAnime.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors">
                Bulk Edit
              </button>
              <button className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors">
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {anime.map((item) => (
          <div
            key={item._id}
            className="group rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-300"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            {/* Anime Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={item.image?.url || "/images/anime-placeholder.jpg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAnimeSelect(item)}
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => onAnimeEdit(item)}
                    className="p-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onAnimeDelete(item._id)}
                    className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedAnime.includes(item._id)}
                  onChange={() => handleSelectAnime(item._id)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Anime Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3
                  className="font-semibold text-white text-sm leading-tight cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => onAnimeSelect(item)}
                >
                  {item.title}
                </h3>
                {getTypeBadge(item.type)}
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400 mb-2">
                <span>{item.year}</span>
                {item.rating?.average > 0 && (
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span>{item.rating.average.toFixed(1)}</span>
                  </div>
                )}
                {item.episodes?.total && (
                  <div className="flex items-center">
                    <FaPlay className="mr-1" />
                    <span>{item.episodes.total} eps</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                  {item.genres.length > 2 && (
                    <span className="px-2 py-1 text-xs text-slate-400">
                      +{item.genres.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{(item.viewCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FaHeart className="mr-1" />
                    <span>{(item.favoritesCount || 0).toLocaleString()}</span>
                  </div>
                </div>
                <span>Added {formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        pageNum === currentPage
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeList;