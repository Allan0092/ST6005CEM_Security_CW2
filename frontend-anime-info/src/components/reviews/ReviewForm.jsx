import { useState, useEffect } from "react";
import {
  FaStar,
  FaTimes,
  FaPlus,
  FaMinus,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { reviewAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ReviewForm = ({ anime, existingReview, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
    pros: [""],
    cons: [""],
    spoilerWarning: false,
    episodeWatched: "",
    watchStatus: "watching",
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        title: existingReview.title || "",
        content: existingReview.content || "",
        pros: existingReview.pros?.length > 0 ? existingReview.pros : [""],
        cons: existingReview.cons?.length > 0 ? existingReview.cons : [""],
        spoilerWarning: existingReview.spoilerWarning || false,
        episodeWatched: existingReview.episodeWatched || "",
        watchStatus: existingReview.watchStatus || "watching",
      });
    } else {
      // Reset form for new review
      setFormData({
        rating: 0,
        title: "",
        content: "",
        pros: [""],
        cons: [""],
        spoilerWarning: false,
        episodeWatched: "",
        watchStatus: "watching",
      });
    }
    setError(null);
  }, [existingReview, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleProsChange = (index, value) => {
    const newPros = [...formData.pros];
    newPros[index] = value;
    setFormData((prev) => ({ ...prev, pros: newPros }));
  };

  const handleConsChange = (index, value) => {
    const newCons = [...formData.cons];
    newCons[index] = value;
    setFormData((prev) => ({ ...prev, cons: newCons }));
  };

  const addPro = () => {
    if (formData.pros.length < 10) {
      setFormData((prev) => ({ ...prev, pros: [...prev.pros, ""] }));
    }
  };

  const removePro = (index) => {
    if (formData.pros.length > 1) {
      const newPros = formData.pros.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, pros: newPros }));
    }
  };

  const addCon = () => {
    if (formData.cons.length < 10) {
      setFormData((prev) => ({ ...prev, cons: [...prev.cons, ""] }));
    }
  };

  const removeCon = (index) => {
    if (formData.cons.length > 1) {
      const newCons = formData.cons.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, cons: newCons }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.rating) {
        throw new Error("Please provide a rating");
      }
      if (!formData.title.trim()) {
        throw new Error("Please provide a review title");
      }
      if (!formData.content.trim()) {
        throw new Error("Please provide review content");
      }

      // Clean up pros and cons - remove empty strings
      const cleanedPros = formData.pros.filter((pro) => pro.trim() !== "");
      const cleanedCons = formData.cons.filter((con) => con.trim() !== "");

      const reviewData = {
        anime: anime._id,
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
        pros: cleanedPros,
        cons: cleanedCons,
        spoilerWarning: formData.spoilerWarning,
        episodeWatched: formData.episodeWatched
          ? parseInt(formData.episodeWatched)
          : undefined,
        watchStatus: formData.watchStatus,
      };

      let response;
      if (existingReview) {
        response = await reviewAPI.updateReview(existingReview._id, reviewData);
      } else {
        response = await reviewAPI.createReview(reviewData);
      }

      if (response.success) {
        onSubmit(response.data.review);
        onClose();
      } else {
        setError(response.message || "Failed to save review");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      setError(error.message || "Failed to save review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 10 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoverRating || formData.rating);

      return (
        <button
          key={index}
          type="button"
          onClick={() => handleRatingClick(starNumber)}
          onMouseEnter={() => setHoverRating(starNumber)}
          onMouseLeave={() => setHoverRating(0)}
          className={`text-2xl transition-colors ${
            isActive
              ? "text-yellow-400"
              : "text-slate-600 hover:text-yellow-300"
          }`}
        >
          <FaStar />
        </button>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div>
            <h2 className="text-xl font-bold text-white">
              {existingReview ? "Edit Review" : "Write Review"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{anime.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars()}
              </div>
              <p className="text-slate-400 text-sm">
                {hoverRating || formData.rating
                  ? `${hoverRating || formData.rating}/10`
                  : "Click to rate"}
              </p>
            </div>

            {/* Watch Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Watch Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="watchStatus"
                  value={formData.watchStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  required
                >
                  <option value="watching">Currently Watching</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Episodes Watched
                </label>
                <input
                  type="number"
                  name="episodeWatched"
                  value={formData.episodeWatched}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Review Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                placeholder="Give your review a title..."
                maxLength={100}
                required
              />
              <p className="text-slate-400 text-sm mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Review Content <span className="text-red-400">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none resize-none"
                placeholder="Share your thoughts about this anime..."
                maxLength={2000}
                required
              />
              <p className="text-slate-400 text-sm mt-1">
                {formData.content.length}/2000 characters
              </p>
            </div>

            {/* Pros */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Pros (Optional)
              </label>
              <div className="space-y-2">
                {formData.pros.map((pro, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => handleProsChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                      placeholder="What did you like?"
                      maxLength={200}
                    />
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      disabled={formData.pros.length === 1}
                      className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                {formData.pros.length < 10 && (
                  <button
                    type="button"
                    onClick={addPro}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm"
                  >
                    <FaPlus />
                    <span>Add Pro</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cons */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cons (Optional)
              </label>
              <div className="space-y-2">
                {formData.cons.map((con, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => handleConsChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-400 focus:outline-none"
                      placeholder="What could be improved?"
                      maxLength={200}
                    />
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      disabled={formData.cons.length === 1}
                      className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                {formData.cons.length < 10 && (
                  <button
                    type="button"
                    onClick={addCon}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm"
                  >
                    <FaPlus />
                    <span>Add Con</span>
                  </button>
                )}
              </div>
            </div>

            {/* Spoiler Warning */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="spoilerWarning"
                  checked={formData.spoilerWarning}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-400"
                />
                <span className="text-white">This review contains spoilers</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-slate-600">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.rating ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {existingReview ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  existingReview ? "Update Review" : "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;