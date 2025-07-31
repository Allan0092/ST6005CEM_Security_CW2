import { useEffect, useState } from "react";
import { FaImage, FaMinus, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../../utils/api";

const AnimeForm = ({ anime, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    alternativeTitles: {
      english: "",
      japanese: "",
      romaji: "",
    },
    description: "",
    type: "TV",
    status: "upcoming",
    year: new Date().getFullYear(),
    genres: [],
    studio: "",
    episodes: {
      total: "",
      duration: "",
    },
    rating: {
      average: 0,
      count: 0,
    },
    image: null,
  });

  const [newGenre, setNewGenre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const isEditing = !!anime;

  useEffect(() => {
    if (anime && isOpen) {
      setFormData({
        title: anime.title || "",
        alternativeTitles: {
          english: anime.alternativeTitles?.english || "",
          japanese: anime.alternativeTitles?.japanese || "",
          romaji: anime.alternativeTitles?.romaji || "",
        },
        description: anime.description || "",
        type: anime.type || "TV",
        status: anime.status || "upcoming",
        year: anime.year || new Date().getFullYear(),
        genres: anime.genres || [],
        studio: anime.studio || "",
        episodes: {
          total: anime.episodes?.total || "",
          duration: anime.episodes?.duration || "",
        },
        rating: {
          average: anime.rating?.average || 0,
          count: anime.rating?.count || 0,
        },
        image: null,
      });

      if (anime.image?.url) {
        setImagePreview(anime.image.url);
      }
    } else if (!anime && isOpen) {
      // Reset form for new anime
      setFormData({
        title: "",
        alternativeTitles: {
          english: "",
          japanese: "",
          romaji: "",
        },
        description: "",
        type: "TV",
        status: "upcoming",
        year: new Date().getFullYear(),
        genres: [],
        studio: "",
        episodes: {
          total: "",
          duration: "",
        },
        rating: {
          average: 0,
          count: 0,
        },
        image: null,
      });
      setImagePreview(null);
    }
  }, [anime, isOpen]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()],
      }));
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((genre) => genre !== genreToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.year || formData.year < 1900 || formData.year > 2030) {
      newErrors.year = "Please enter a valid year";
    }

    if (
      formData.episodes.total &&
      (isNaN(formData.episodes.total) || formData.episodes.total < 1)
    ) {
      newErrors["episodes.total"] = "Episodes must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare form data for submission
      const submitData = new FormData();

      // Add text fields
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("type", formData.type);
      submitData.append("status", formData.status);
      submitData.append("year", formData.year);
      submitData.append("studio", formData.studio);
      submitData.append("genres", JSON.stringify(formData.genres));
      submitData.append(
        "alternativeTitles",
        JSON.stringify(formData.alternativeTitles)
      );
      submitData.append("episodes", JSON.stringify(formData.episodes));

      // Add image if selected
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      let response;
      if (isEditing) {
        response = await adminAPI.updateAnime(anime._id, submitData);
      } else {
        response = await adminAPI.createAnime(submitData);
      }

      if (response.success) {
        onSubmit(response.data.anime);
        onClose();
      } else {
        setError(
          response.message ||
            `Failed to ${isEditing ? "update" : "create"} anime`
        );
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? "update" : "create"} anime:`,
        error
      );
      setError(
        `Failed to ${isEditing ? "update" : "create"} anime. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const animeTypes = ["TV", "Movie", "OVA", "ONA", "Special", "Music"];
  const animeStatuses = ["airing", "completed", "upcoming", "cancelled"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear + 5 - i);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Edit Anime" : "Add New Anime"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-160px)]"
        >
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full p-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.title ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter anime title"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Alternative Titles */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  English Title
                </label>
                <input
                  type="text"
                  value={formData.alternativeTitles.english}
                  onChange={(e) =>
                    handleInputChange(
                      "alternativeTitles.english",
                      e.target.value
                    )
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="English title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Japanese Title
                </label>
                <input
                  type="text"
                  value={formData.alternativeTitles.japanese}
                  onChange={(e) =>
                    handleInputChange(
                      "alternativeTitles.japanese",
                      e.target.value
                    )
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Japanese title"
                />
              </div>

              {/* Type and Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {animeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {animeStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year and Studio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  className={`w-full p-3 rounded-lg bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.year ? "border-red-500" : "border-slate-600"
                  }`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-400 text-sm mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Studio
                </label>
                <input
                  type="text"
                  value={formData.studio}
                  onChange={(e) => handleInputChange("studio", e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Animation studio"
                />
              </div>

              {/* Episodes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Episodes
                </label>
                <input
                  type="number"
                  value={formData.episodes.total}
                  onChange={(e) =>
                    handleInputChange("episodes.total", e.target.value)
                  }
                  className={`w-full p-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors["episodes.total"]
                      ? "border-red-500"
                      : "border-slate-600"
                  }`}
                  placeholder="Number of episodes"
                  min="1"
                />
                {errors["episodes.total"] && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors["episodes.total"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Episode Duration
                </label>
                <input
                  type="text"
                  value={formData.episodes.duration}
                  onChange={(e) =>
                    handleInputChange("episodes.duration", e.target.value)
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 24 min"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className={`w-full p-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                  errors.description ? "border-red-500" : "border-slate-600"
                }`}
                placeholder="Enter anime description/synopsis"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Genres
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addGenre())
                  }
                  className="flex-1 p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a genre"
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.genres.map((genre) => (
                  <span
                    key={genre}
                    className="flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 text-purple-400 hover:text-purple-200"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cover Image
              </label>
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-48 object-cover rounded-lg border border-slate-600"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <div className="text-center">
                      <FaImage className="text-2xl text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">
                        Click to upload cover image
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Anime"
                : "Create Anime"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimeForm;
