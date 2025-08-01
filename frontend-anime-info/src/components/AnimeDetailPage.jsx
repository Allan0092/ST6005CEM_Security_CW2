import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaCalendar,
  FaClock,
  FaEye,
  FaFilm,
  FaHeart,
  FaPlay,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { animeAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";

const AnimeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [anime, setAnime] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedAnime, setRelatedAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
      fetchAnimeReviews();
      fetchRelatedAnime();
    }
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await animeAPI.getAnime(id);

      if (response.success) {
        setAnime(response.data.anime);
        // Check if user has favorited this anime
        if (isAuthenticated && user?.favorites?.includes(id)) {
          setIsFavorite(true);
        }
      } else {
        setError(response.message || "Failed to load anime details");
      }
    } catch (error) {
      console.error("Failed to fetch anime details:", error);
      setError("Failed to load anime details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnimeReviews = async () => {
    try {
      const response = await animeAPI.getAnimeReviews(id);
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const fetchRelatedAnime = async () => {
    try {
      const response = await animeAPI.getRelatedAnime(id);
      if (response.success) {
        setRelatedAnime(response.data.relations || []);
      }
    } catch (error) {
      console.error("Failed to fetch related anime:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const response = await animeAPI.toggleFavorite(id);
      if (response.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      airing: "bg-green-500",
      completed: "bg-blue-500",
      upcoming: "bg-yellow-500",
      cancelled: "bg-red-500",
      hiatus: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getTypeColor = (type) => {
    const colors = {
      TV: "bg-purple-500",
      Movie: "bg-red-500",
      OVA: "bg-blue-500",
      ONA: "bg-green-500",
      Special: "bg-yellow-500",
    };
    return colors[type] || "bg-gray-500";
  };

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div className="text-center">
          <FaFilm className="text-6xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Anime Not Found
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Anime Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Anime Poster */}
          <div className="lg:w-1/4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <img
                src={getImageUrl(anime.image?.url)}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/anime-placeholder.jpg";
                }}
              />
            </div>

            {/* Action Buttons */}
            {isAuthenticated && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={toggleFavorite}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    isFavorite
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-slate-600 hover:bg-slate-500 text-white"
                  }`}
                >
                  <FaHeart className="mr-2" />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>

                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                  <FaBookmark className="mr-2" />
                  Add to Watchlist
                </button>
              </div>
            )}
          </div>

          {/* Anime Info */}
          <div className="lg:w-3/4">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {anime.title}
                </h1>

                {anime.alternativeTitles?.english && (
                  <p className="text-xl text-slate-300 mb-3">
                    {anime.alternativeTitles.english}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(
                      anime.status
                    )}`}
                  >
                    {anime.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${getTypeColor(
                      anime.type
                    )}`}
                  >
                    {anime.type}
                  </span>
                  <span className="text-slate-400 flex items-center">
                    <FaCalendar className="mr-1" />
                    {anime.year}
                  </span>
                  {anime.episodes?.total && (
                    <span className="text-slate-400 flex items-center">
                      <FaPlay className="mr-1" />
                      {anime.episodes.total} episodes
                    </span>
                  )}
                  {anime.episodes?.duration && (
                    <span className="text-slate-400 flex items-center">
                      <FaClock className="mr-1" />
                      {anime.episodes.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className="text-center p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {anime.rating?.average?.toFixed(1) || "N/A"}
                  </div>
                  <div className="text-sm text-slate-400">Rating</div>
                </div>

                <div
                  className="text-center p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <FaEye className="text-blue-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(anime.viewCount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Views</div>
                </div>

                <div
                  className="text-center p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <FaHeart className="text-red-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(anime.favoritesCount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Favorites</div>
                </div>

                <div
                  className="text-center p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <FaUsers className="text-green-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {anime.popularity || 0}
                  </div>
                  <div className="text-sm text-slate-400">Popularity</div>
                </div>
              </div>

              {/* Description */}
              {anime.description && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Synopsis
                  </h3>
                  <div className="text-slate-300 leading-relaxed">
                    {showFullDescription || anime.description.length <= 300
                      ? anime.description
                      : `${anime.description.slice(0, 300)}...`}

                    {anime.description.length > 300 && (
                      <button
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                        className="text-purple-400 hover:text-purple-300 ml-2 transition-colors"
                      >
                        {showFullDescription ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Link
                        key={genre}
                        to={`/search?genre=${encodeURIComponent(genre)}`}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm hover:bg-purple-500/30 transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Information Panel */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Studio:</span>
                <span className="text-white">{anime.studio || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white">{anime.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white">{anime.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Episodes:</span>
                <span className="text-white">
                  {anime.episodes?.total || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white">
                  {anime.episodes?.duration || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Year:</span>
                <span className="text-white">{anime.year}</span>
              </div>
            </div>
          </div>

          {/* Alternative Titles */}
          {anime.alternativeTitles && (
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Alternative Titles
              </h3>
              <div className="space-y-3">
                {anime.alternativeTitles.english && (
                  <div>
                    <span className="text-slate-400 block">English:</span>
                    <span className="text-white">
                      {anime.alternativeTitles.english}
                    </span>
                  </div>
                )}
                {anime.alternativeTitles.japanese && (
                  <div>
                    <span className="text-slate-400 block">Japanese:</span>
                    <span className="text-white">
                      {anime.alternativeTitles.japanese}
                    </span>
                  </div>
                )}
                {anime.alternativeTitles.romaji && (
                  <div>
                    <span className="text-slate-400 block">Romaji:</span>
                    <span className="text-white">
                      {anime.alternativeTitles.romaji}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Reviews</h2>
            {isAuthenticated && (
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
                Write Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review._id}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img
                        src={
                          review.user.avatar || "/images/user-placeholder.jpg"
                        }
                        alt={review.user.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <span className="text-white font-medium">
                        {review.user.name}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <FaStar className="mr-1" />
                      <span>{review.rating}/10</span>
                    </div>
                  </div>
                  <p className="text-slate-300">{review.content}</p>
                </div>
              ))}

              {reviews.length > 3 && (
                <div className="text-center">
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    View All Reviews ({reviews.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-xl"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <FaStar className="text-4xl text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">
                No reviews yet. Be the first to review!
              </p>
            </div>
          )}
        </div>

        {/* Related Anime */}
        {relatedAnime.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Related Anime
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedAnime.map((related) => (
                <Link
                  key={related.anime._id}
                  to={`/anime/${related.anime._id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                    <img
                      src={getImageUrl(related.anime.image?.url)}
                      alt={related.anime.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors line-clamp-2">
                    {related.anime.title}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    {related.relationType}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailPage;
