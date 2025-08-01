import { useState } from "react";
import { FaFilter, FaTimes, FaCalendar } from "react-icons/fa";

const LogFilters = ({ filters, onFilterChange, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
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
    });
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "sortBy" || key === "sortOrder" || key === "limit") return false;
      return value && value !== "";
    });
  };

  const logTypes = [
    { value: "", label: "All Types" },
    { value: "request", label: "Request" },
    { value: "auth", label: "Authentication" },
    { value: "admin", label: "Admin" },
    { value: "error", label: "Error" },
    { value: "security", label: "Security" },
  ];

  const logLevels = [
    { value: "", label: "All Levels" },
    { value: "info", label: "Info" },
    { value: "warn", label: "Warning" },
    { value: "error", label: "Error" },
    { value: "critical", label: "Critical" },
  ];

  const httpMethods = [
    { value: "", label: "All Methods" },
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "DELETE", label: "DELETE" },
    { value: "PATCH", label: "PATCH" },
  ];

  const statusCodeRanges = [
    { value: "", label: "All Status Codes" },
    { value: "200-299", label: "2xx Success" },
    { value: "300-399", label: "3xx Redirect" },
    { value: "400-499", label: "4xx Client Error" },
    { value: "500-599", label: "5xx Server Error" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "responseTime", label: "Response Time" },
    { value: "statusCode", label: "Status Code" },
    { value: "method", label: "HTTP Method" },
    { value: "endpoint", label: "Endpoint" },
  ];

  return (
    <div
      className="p-6 rounded-xl"
      style={{
        backgroundColor: "rgba(71, 85, 105, 0.15)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaFilter className="text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters() && (
            <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            {showAdvanced ? "Simple" : "Advanced"}
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              disabled={isLoading}
              className="flex items-center text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              <FaTimes className="mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleInputChange("search", e.target.value)}
            placeholder="Search logs..."
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Log Type */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Log Type
          </label>
          <select
            value={filters.logType || ""}
            onChange={(e) => handleInputChange("logType", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {logTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Log Level */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Log Level
          </label>
          <select
            value={filters.logLevel || ""}
            onChange={(e) => handleInputChange("logLevel", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {logLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Code */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Status Code
          </label>
          <select
            value={filters.statusCode || ""}
            onChange={(e) => handleInputChange("statusCode", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {statusCodeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-slate-600 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* HTTP Method */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                HTTP Method
              </label>
              <select
                value={filters.method || ""}
                onChange={(e) => handleInputChange("method", e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {httpMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={filters.userId || ""}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                placeholder="User ID..."
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={filters.ipAddress || ""}
                onChange={(e) => handleInputChange("ipAddress", e.target.value)}
                placeholder="IP Address..."
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                <FaCalendar className="inline mr-1" />
                Start Date
              </label>
              <input
                type="datetime-local"
                value={filters.startDate || ""}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                <FaCalendar className="inline mr-1" />
                End Date
              </label>
              <input
                type="datetime-local"
                value={filters.endDate || ""}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) => handleInputChange("sortBy", e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder || "desc"}
                  onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilters;