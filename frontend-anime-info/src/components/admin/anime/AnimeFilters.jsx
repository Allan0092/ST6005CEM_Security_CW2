import { useState } from "react";
import { FaFilter, FaSearch, FaSort, FaTimes } from "react-icons/fa";

const AnimeFilters = ({ filters, onFilterChange, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      genre: "",
      year: "",
      status: "",
      type: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.genre ||
      filters.year ||
      filters.status ||
      filters.type
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ];

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: "rgba(71, 85, 105, 0.15)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
      }}
    >
      {/* Basic Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search anime by title, studio, or alternative titles..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              showAdvanced
                ? "bg-purple-600 text-white"
                : "bg-slate-600 hover:bg-slate-500 text-slate-300"
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center"
            >
              <FaTimes className="mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-600">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => handleInputChange("genre", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="airing">Currently Airing</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="TV">TV Series</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="Special">Special</option>
              <option value="Music">Music</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleInputChange("sortBy", e.target.value)}
                disabled={isLoading}
                className="flex-1 p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="rating.average">Rating</option>
                <option value="viewCount">Views</option>
                <option value="popularity">Popularity</option>
              </select>

              <button
                onClick={() =>
                  handleInputChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                disabled={isLoading}
                className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                title={`Sort ${
                  filters.sortOrder === "asc" ? "Descending" : "Ascending"
                }`}
              >
                <FaSort
                  className={`transform ${
                    filters.sortOrder === "asc" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeFilters;