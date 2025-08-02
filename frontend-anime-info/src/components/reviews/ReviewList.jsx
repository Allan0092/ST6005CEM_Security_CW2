import { useEffect, useState } from "react";
import { FaStar, FaThumbsUp, FaFlag, FaUser, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { reviewAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/imageHelper";

const ReviewList = ({ animeId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    sort: "-helpfulVotes.count",
    spoilers: "false",
  });
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (animeId) {
      fetchReviews();
    }
  }, [animeId, currentPage, filters]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        ...filters,
      };

      const response = await reviewAPI.getAnimeReviews(animeId, params);

      if (response.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) return;

    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));

      const review = reviews.find(r => r._id === reviewId);
      const hasLiked = review.helpfulVotes.users.some(u => u._id === user.id);

      let response;
      if (hasLiked) {
        response = await reviewAPI.unlikeReview(reviewId);
      } else {
        response = await reviewAPI.likeReview(reviewId);
      }

      if (response.success) {
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? {
                  ...review,
                  helpfulVotes: {
                    ...review.helpfulVotes,
                    count: response.data.helpfulVotes.count,
                    users: hasLiked
                      ? review.helpfulVotes.users.filter(u => u._id !== user.id)
                      : [...review.helpfulVotes.users, { _id: user.id }]
                  }
                }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Failed to like/unlike review:", error);
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleReportReview = async (reviewId, reportData) => {
    if (!isAuthenticated) return;

    try {
      const response = await reviewAPI.reportReview(reviewId, reportData);
      if (response.success) {
        alert("Review reported successfully. Thank you for helping keep our community safe.");
      }
    } catch (error) {
      console.error("Failed to report review:", error);
      alert("Failed to report review. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-sm ${
          index < rating ? "text-yellow-400" : "text-slate-600"
        }`}
      />
    ));
  };

  const getWatchStatusColor = (status) => {
    const colors = {
      completed: "text-green-400",
      watching: "text-blue-400",
      dropped: "text-red-400",
    };
    return colors[status] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div
        className="p-8 rounded-xl text-center"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <FaSpinner className="text-4xl text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-8 rounded-xl text-center"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats.totalReviews > 0 && (
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-slate-400 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.totalReviews}
              </div>
              <div className="text-slate-400 text-sm">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-white mb-2">Distribution</div>
              <div className="space-y-1">
                {[10, 9, 8, 7, 6].map(rating => {
                  const count = stats.ratingsDistribution?.filter(r => r === rating).length || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="text-slate-400 w-6">{rating}</span>
                      <div className="flex-1 mx-2 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-slate-400 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Sort by</label>
            <select
              value={filters.sort}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, sort: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="-helpfulVotes.count">Most Helpful</option>
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-rating">Highest Rating</option>
              <option value="rating">Lowest Rating</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Spoilers</label>
            <select
              value={filters.spoilers}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, spoilers: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="false">Hide Spoilers</option>
              <option value="true">Show All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <FaUser className="text-4xl text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No reviews yet. Be the first to review this anime!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const hasLiked = isAuthenticated && review.helpfulVotes.users.some(u => u._id === user?.id);
            
            return (
              <div
                key={review._id}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getImageUrl(review.user.avatar)}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/images/default-avatar.png";
                      }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">{review.user.name}</h4>
                        {review.user.country && (
                          <span className="text-xs text-slate-400">
                            {review.user.country}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <span>{formatDate(review.createdAt)}</span>
                        <span>•</span>
                        <span className={getWatchStatusColor(review.watchStatus)}>
                          {review.watchStatus}
                        </span>
                        {review.episodeWatched && (
                          <>
                            <span>•</span>
                            <span>{review.episodeWatched} episodes</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="font-bold text-white ml-2">{review.rating}/10</span>
                  </div>
                </div>

                {/* Spoiler Warning */}
                {review.spoilerWarning && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <div className="flex items-center text-yellow-400 text-sm">
                      <FaExclamationTriangle className="mr-2" />
                      This review contains spoilers
                    </div>
                  </div>
                )}

                {/* Review Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white mb-2">{review.title}</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>

                {/* Pros and Cons */}
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {review.pros?.length > 0 && (
                      <div>
                        <h5 className="text-green-400 font-medium mb-2">Pros:</h5>
                        <ul className="text-slate-300 text-sm space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-400 mr-2">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.cons?.length > 0 && (
                      <div>
                        <h5 className="text-red-400 font-medium mb-2">Cons:</h5>
                        <ul className="text-slate-300 text-sm space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-400 mr-2">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                  <div className="flex items-center space-x-4">
                    {isAuthenticated && (
                      <button
                        onClick={() => handleLikeReview(review._id)}
                        disabled={actionLoading[review._id]}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                          hasLiked
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        <FaThumbsUp className="text-sm" />
                        <span className="text-sm">{review.helpfulVotes.count}</span>
                      </button>
                    )}

                    {!isAuthenticated && (
                      <div className="flex items-center space-x-2 text-slate-400 text-sm">
                        <FaThumbsUp />
                        <span>{review.helpfulVotes.count} helpful</span>
                      </div>
                    )}
                  </div>

                  {isAuthenticated && user?.id !== review.user._id && (
                    <button
                      onClick={() => {
                        const reason = prompt("Report reason (spam, inappropriate, spoiler, harassment, other):");
                        if (reason) {
                          const description = prompt("Additional details (optional):");
                          handleReportReview(review._id, { reason, description });
                        }
                      }}
                      className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors text-sm"
                    >
                      <FaFlag />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;