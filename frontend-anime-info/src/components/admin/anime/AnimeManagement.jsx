import { useEffect, useState } from "react";
import { FaFilm, FaPlus, FaSync, FaDownload } from "react-icons/fa";
import { adminAPI } from "../../../utils/api";
import AnimeStats from "./AnimeStats";
import AnimeFilters from "./AnimeFilters";
import AnimeList from "./AnimeList";
import AnimeDetail from "./AnimeDetail";
import AnimeForm from "./AnimeForm";

const AnimeManagement = () => {
  const [anime, setAnime] = useState([]);
  const [animeStats, setAnimeStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showAnimeDetail, setShowAnimeDetail] = useState(false);
  const [showAnimeForm, setShowAnimeForm] = useState(false);
  const [editingAnime, setEditingAnime] = useState(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnime, setTotalAnime] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    year: "",
    status: "",
    type: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 12,
  });

  useEffect(() => {
    fetchAnime();
    fetchStats();
  }, [currentPage, filters]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setAnimeStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch anime stats:", error);
    }
  };

  const fetchAnime = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        ...filters,
      };

      const response = await adminAPI.getAdminAnime(queryParams);

      if (response.success) {
        setAnime(response.data.anime);
        setTotalPages(response.data.pagination.totalPages);
        setTotalAnime(response.data.pagination.total);
      } else {
        setError(response.message || "Failed to fetch anime");
      }
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      setError("Failed to load anime. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleAnimeSelect = (anime) => {
    setSelectedAnime(anime);
    setShowAnimeDetail(true);
  };

  const handleAnimeEdit = (anime) => {
    setEditingAnime(anime);
    setShowAnimeForm(true);
  };

  const handleAnimeCreate = () => {
    setEditingAnime(null);
    setShowAnimeForm(true);
  };

  const handleAnimeUpdate = (updatedAnime) => {
    setAnime((prev) =>
      prev.map((item) => (item._id === updatedAnime._id ? updatedAnime : item))
    );
    if (selectedAnime?._id === updatedAnime._id) {
      setSelectedAnime(updatedAnime);
    }
    fetchStats();
  };

  const handleAnimeAdd = (newAnime) => {
    setAnime((prev) => [newAnime, ...prev]);
    setTotalAnime((prev) => prev + 1);
    fetchStats();
  };

  const handleAnimeDelete = (deletedAnimeId) => {
    setAnime((prev) => prev.filter((item) => item._id !== deletedAnimeId));
    setShowAnimeDetail(false);
    setSelectedAnime(null);
    setTotalAnime((prev) => prev - 1);
    fetchStats();
  };

  const handleRefresh = () => {
    fetchAnime();
    fetchStats();
  };

  const handleExportAnime = async () => {
    try {
      // TODO: Implement anime export functionality
      console.log("Exporting anime...");
    } catch (error) {
      console.error("Failed to export anime:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaFilm className="mr-3 text-purple-400" />
            Anime Management
          </h2>
          <p className="text-slate-400 mt-1">
            Manage {totalAnime} anime in database
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors flex items-center"
          >
            <FaSync className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportAnime}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>

          <button
            onClick={handleAnimeCreate}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Anime
          </button>
        </div>
      </div>

      {/* Anime Statistics */}
      <AnimeStats stats={animeStats} isLoading={isLoading} />

      {/* Filters */}
      <AnimeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <FaFilm className="text-red-400 mr-2" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-red-300 hover:text-red-200 underline text-sm mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Anime List */}
      <AnimeList
        anime={anime}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onAnimeSelect={handleAnimeSelect}
        onAnimeEdit={handleAnimeEdit}
        onAnimeUpdate={handleAnimeUpdate}
        onAnimeDelete={handleAnimeDelete}
      />

      {/* Anime Detail Modal */}
      {showAnimeDetail && selectedAnime && (
        <AnimeDetail
          anime={selectedAnime}
          isOpen={showAnimeDetail}
          onClose={() => {
            setShowAnimeDetail(false);
            setSelectedAnime(null);
          }}
          onEdit={handleAnimeEdit}
          onUpdate={handleAnimeUpdate}
          onDelete={handleAnimeDelete}
        />
      )}

      {/* Anime Form Modal */}
      {showAnimeForm && (
        <AnimeForm
          anime={editingAnime}
          isOpen={showAnimeForm}
          onClose={() => {
            setShowAnimeForm(false);
            setEditingAnime(null);
          }}
          onSubmit={editingAnime ? handleAnimeUpdate : handleAnimeAdd}
        />
      )}
    </div>
  );
};

export default AnimeManagement;