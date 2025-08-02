import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaStar,
  FaCalendarAlt,
  FaTv,
  FaUser,
  FaEye,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { animeAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";
import ReviewList from "./reviews/ReviewList";
import ReviewForm from "./reviews/ReviewForm";

const AnimeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [anime, setAnime] = useState(null);
  const [relatedAnime, setRelatedAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [hasUserReview, setHasUserReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
      fetchRelatedAnime();
      if (isAuthenticated) {
        checkUserReview();
      }
    }
  }, [id, isAuthenticated]);

  const fetchAnimeDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await animeAPI.getAnime(id);
      
      if (response.success) {
        setAnime(response.data.anime);
        setIsFavorite(response.data.anime.isFavorite || false);
        
        // Track view
        if (isAuthenticated) {
          animeAPI.addView(id).catch(console.error);
        }
      } else {
        setError(response.message || "Anime not found");
      }
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      setError("Failed to load anime details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedAnime = async () => {
    try {
      const response = await animeAPI.getRelatedAnime(id);
      if (response.success) {
        setRelatedAnime(response.data.relatedAnime || []);
      }
    } catch (error) {
      console.error("Failed to fetch related anime:", error);
    }
  };

  const checkUserReview = async () => {
    if (!user?.id) return;
    
    try {
      setHasUserReview(false);
    } catch (error) {
      console.error("Failed to check user review:", error);
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
        setIsFavorite(response.data.isFavorite);
        setAnime(prev => ({
          ...prev,
          favoritesCount: response.data.favoritesCount
        }));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleReviewSubmit = (newReview) => {
    setUserReview(newReview);
    setHasUserReview(true);
    setShowReviewForm(false);
    if (activeTab === "reviews") {
      setActiveTab("overview");
      setTimeout(() => setActiveTab("reviews"), 100);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowReviewForm(true);
  };

  const handleEditReview = () => {
    setShowReviewForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      airing: "text-green-400",
      completed: "text-blue-400",
      upcoming: "text-yellow-400",
      cancelled: "text-red-400",
    };
    return colors[status] || "text-slate-400";
  };

  const getTypeColor = (type) => {
    const colors = {
      TV: "text-purple-400",
      Movie: "text-blue-400",
      OVA: "text-green-400",
      ONA: "text-orange-400",
      Special: "text-pink-400",
      Music: "text-red-400",
    };
    return colors[type] || "text-slate-400";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaTv },
    { id: "reviews", label: "Reviews", icon: FaStar },
    { id: "related", label: "Related", icon: FaPlay },
  ];

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
          <FaSpinner className="text-4xl text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading anime details...</p>
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
        <div
          className="text-center p-12 rounded-2xl backdrop-blur-lg max-w-md"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Anime Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={getImageUrl(anime.image?.url)}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/anime-placeholder.jpg";
                }}
              />
              
              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-black/50 text-white hover:bg-red-500"
                }`}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>

              {/* Rating Badge */}
              {anime.rating?.average > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg px-3 py-2 flex items-center">
                  <FaStar className="text-yellow-400 mr-2" />
                  <span className="text-white font-bold">
                    {anime.rating.average.toFixed(1)}
                  </span>
                  <span className="text-slate-300 text-sm ml-1">
                    ({anime.rating.count})
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={toggleFavorite}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                  isFavorite
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-slate-600 hover:bg-slate-500 text-white"
                }`}
              >
                {isFavorite ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleWriteReview}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors flex items-center justify-center"
                >
                  {hasUserReview ? (
                    <>
                      <FaEdit className="mr-2" />
                      Edit Review
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      Write Review
                    </>
                  )}
                </button>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors flex items-center justify-center"
                >
                  <FaUser className="mr-2" />
                  Login to Review
                </button>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="lg:col-span-2">
            <div
              className="p-8 rounded-2xl h-full"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              {/* Title */}
              <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>

              {/* Alternative Titles */}
              {anime.alternativeTitles && (
                <div className="mb-6">
                  {anime.alternativeTitles.english && (
                    <p className="text-slate-300 text-lg">
                      {anime.alternativeTitles.english}
                    </p>
                  )}
                  {anime.alternativeTitles.japanese && (
                    <p className="text-slate-400">
                      {anime.alternativeTitles.japanese}
                    </p>
                  )}
                </div>
              )}

              {/* Meta Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <FaCalendarAlt className="text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-medium">{anime.year}</div>
                  <div className="text-slate-400 text-sm">Year</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <FaTv className={`mx-auto mb-2 ${getTypeColor(anime.type)}`} />
                  <div className="text-white font-medium">{anime.type}</div>
                  <div className="text-slate-400 text-sm">Type</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    anime.status === 'airing' ? 'bg-green-400' :
                    anime.status === 'completed' ? 'bg-blue-400' :
                    anime.status === 'upcoming' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <div className={`font-medium capitalize ${getStatusColor(anime.status)}`}>
                    {anime.status}
                  </div>
                  <div className="text-slate-400 text-sm">Status</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <FaEye className="text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-medium">
                    {(anime.viewCount || 0).toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">Views</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
                <p className="text-slate-300 leading-relaxed">
                  {showFullDescription
                    ? anime.description
                    : `${anime.description.substring(0, 300)}${
                        anime.description.length > 300 ? "..." : ""
                      }`}
                </p>
                {anime.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-purple-400 hover:text-purple-300 transition-colors mt-2"
                  >
                    {showFullDescription ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-600/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Studio & Episodes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anime.studio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Studio</h3>
                    <p className="text-slate-300">{anime.studio}</p>
                  </div>
                )}

                {anime.episodes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Episodes</h3>
                    <p className="text-slate-300">
                      {anime.episodes.total || "TBA"}
                      {anime.episodes.duration && ` • ${anime.episodes.duration}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 p-1 rounded-xl" style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "overview" && (
            <div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Overview</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {anime.description}
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewList animeId={id} />
          )}

          {activeTab === "related" && (
            <div>
              {relatedAnime.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {relatedAnime.map((related) => (
                    <Link
                      key={related._id}
                      to={`/anime/${related._id}`}
                      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.15)",
                        border: "1px solid rgba(148, 163, 184, 0.25)",
                      }}
                    >
                      <div className="aspect-[3/4]">
                        <img
                          src={getImageUrl(related.image?.url)}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/images/anime-placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {related.title}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">{related.year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-12 rounded-xl"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <FaPlay className="text-4xl text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No related anime found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          anime={anime}
          existingReview={userReview}
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default AnimeDetailPage;
