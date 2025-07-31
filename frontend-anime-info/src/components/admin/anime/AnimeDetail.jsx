import { useEffect, useState } from "react";
import {
  FaEdit,
  FaEye,
  FaFilm,
  FaHeart,
  FaPlay,
  FaStar,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { adminAPI } from "../../../utils/api";

const AnimeDetail = ({
  anime,
  isOpen,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
}) => {
  const [animeDetails, setAnimeDetails] = useState(anime);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (anime && isOpen) {
      fetchAnimeDetails();
    }
  }, [anime, isOpen]);

  const fetchAnimeDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminAPI.getAnimeDetails(anime._id);

      if (response.success) {
        setAnimeDetails(response.data.anime);
      } else {
        setError(response.message || "Failed to fetch anime details");
      }
    } catch (error) {
      console.error("Failed to fetch anime details:", error);
      setError("Failed to load anime details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action, animeId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [action]: true }));
      setError(null);

      let response;

      switch (action) {
        case "delete":
          response = await adminAPI.deleteAnime(animeId);
          break;
        default:
          throw new Error("Unknown action");
      }

      if (response.success) {
        if (action === "delete") {
          onDelete(animeId);
          onClose();
        }
      } else {
        setError(response.message || `Failed to ${action} anime`);
      }
    } catch (error) {
      console.error(`Failed to ${action} anime:`, error);
      setError(`Failed to ${action} anime. Please try again.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
        className={`px-3 py-1 text-sm font-medium rounded-full border ${
          statusStyles[status] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div className="flex items-center space-x-3">
            <FaFilm className="text-purple-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Anime Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading anime details...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={fetchAnimeDetails}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Anime Header */}
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Anime Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      animeDetails.image?.url || "/images/anime-placeholder.jpg"
                    }
                    alt={animeDetails.title}
                    className="w-64 h-96 object-cover rounded-lg border border-slate-600"
                  />
                </div>

                {/* Anime Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {animeDetails.title}
                    </h1>
                    {animeDetails.alternativeTitles?.english && (
                      <p className="text-lg text-slate-300 mb-2">
                        {animeDetails.alternativeTitles.english}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {getStatusBadge(animeDetails.status)}
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {animeDetails.type}
                      </span>
                      <span className="text-slate-400">
                        {animeDetails.year}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                      <FaStar className="text-yellow-400 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">
                        {animeDetails.rating?.average?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400">Rating</div>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                      <FaPlay className="text-blue-400 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">
                        {animeDetails.episodes?.total || "?"}
                      </div>
                      <div className="text-xs text-slate-400">Episodes</div>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                      <FaEye className="text-green-400 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">
                        {(animeDetails.viewCount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">Views</div>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-slate-700/30">
                      <FaHeart className="text-red-400 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">
                        {(animeDetails.favoritesCount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">Favorites</div>
                    </div>
                  </div>

                  {/* Description */}
                  {animeDetails.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Synopsis
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {animeDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Basic Information */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white">{animeDetails.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-white">{animeDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Year:</span>
                      <span className="text-white">{animeDetails.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Episodes:</span>
                      <span className="text-white">
                        {animeDetails.episodes?.total || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">
                        {animeDetails.episodes?.duration || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Studio:</span>
                      <span className="text-white">
                        {animeDetails.studio || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Genres & Tags */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Genres
                  </h3>
                  {animeDetails.genres && animeDetails.genres.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {animeDetails.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No genres specified</p>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Admin Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Edit Anime */}
                  <button
                    onClick={() => onEdit(animeDetails)}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    Edit Anime
                  </button>

                  {/* Delete Anime */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading.delete}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="mr-2" />
                    {actionLoading.delete ? "Deleting..." : "Delete Anime"}
                  </button>
                </div>

                {/* System Info */}
                <div className="mt-6 pt-4 border-t border-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">
                        {formatDate(animeDetails.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Updated:</span>
                      <span className="text-white ml-2">
                        {formatDate(animeDetails.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirm Deletion
              </h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete "{animeDetails.title}"? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAction("delete", animeDetails._id);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={actionLoading.delete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                >
                  {actionLoading.delete ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;
