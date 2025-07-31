import { useState } from "react";
import { FaFilter, FaSearch, FaSort, FaTimes } from "react-icons/fa";

const UserFilters = ({ filters, onFilterChange, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      role: "",
      status: "",
      verified: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.role || filters.status || filters.verified;
  };

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
            placeholder="Search users by name, email, or ID..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              showAdvanced
                ? "bg-blue-600 text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-600">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Account Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Verification
            </label>
            <select
              value={filters.verified}
              onChange={(e) => handleInputChange("verified", e.target.value)}
              disabled={isLoading}
              className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
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
                className="flex-1 p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Join Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="lastLogin">Last Login</option>
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

export default UserFilters;
