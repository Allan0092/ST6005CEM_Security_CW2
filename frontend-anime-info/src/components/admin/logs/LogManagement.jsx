import { useEffect, useState } from "react";
import {
  FaDownload,
  FaFilter,
  FaSync, 
  FaSearch,
  FaServer,
  FaTrash,
} from "react-icons/fa";
import { adminAPI } from "../../../utils/api";
import LogFilters from "./LogFilters";
import LogList from "./LogList";
import LogStats from "./LogStats";

const LogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [logStats, setLogStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    logType: "",
    logLevel: "",
    userId: "",
    ipAddress: "",
    statusCode: "",
    method: "",
    startDate: "",
    endDate: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 50,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchLogStats();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        ...filters,
      };

      const response = await adminAPI.getLogs(queryParams);

      if (response.success) {
        setLogs(response.data.logs);
        setTotalPages(response.data.pagination.pages);
        setTotalLogs(response.data.pagination.total);
      } else {
        setError(response.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setError("Failed to load logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogStats = async () => {
    try {
      const response = await adminAPI.getLogStats({ timeframe: 24 });
      if (response.success) {
        setLogStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch log stats:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchLogs();
    fetchLogStats();
  };

  const handleExportLogs = async () => {
    try {
      const queryParams = {
        ...filters,
        format: "csv",
      };

      // Create a form to submit for file download
      const form = document.createElement("form");
      form.method = "GET";
      form.action = `https://localhost:3000/api/v1/admin/logs/export`;
      form.target = "_blank";

      // Add query parameters as hidden inputs
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
      });

      // Add authorization header as a hidden input
      const token = localStorage.getItem("token");
      if (token) {
        const authInput = document.createElement("input");
        authInput.type = "hidden";
        authInput.name = "token";
        authInput.value = token;
        form.appendChild(authInput);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      console.error("Failed to export logs:", error);
    }
  };

  const handleCleanupLogs = async () => {
    if (!confirm("Are you sure you want to delete logs older than 90 days? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await adminAPI.cleanupLogs({ daysToKeep: 90 });
      if (response.success) {
        alert(`Successfully deleted ${response.data.deletedCount} old log entries.`);
        handleRefresh();
      }
    } catch (error) {
      console.error("Failed to cleanup logs:", error);
      alert("Failed to cleanup logs. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaServer className="mr-3 text-green-400" />
            System Logs
          </h2>
          <p className="text-slate-400 mt-1">
            Monitor system activity and requests ({totalLogs.toLocaleString()} total logs)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showFilters
                ? "bg-purple-600 text-white"
                : "bg-slate-600 hover:bg-slate-500 text-white"
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors flex items-center"
          >
            <FaSync className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportLogs}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>

          <button
            onClick={handleCleanupLogs}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center"
          >
            <FaTrash className="mr-2" />
            Cleanup
          </button>
        </div>
      </div>

      {/* Log Statistics */}
      <LogStats stats={logStats} isLoading={isLoading} />

      {/* Filters */}
      {showFilters && (
        <LogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <FaServer className="text-red-400 mr-2" />
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

      {/* Log List */}
      <LogList
        logs={logs}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default LogManagement;