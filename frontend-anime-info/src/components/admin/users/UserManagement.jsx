import { useEffect, useState } from "react";
import { FaDownload, FaSync, FaUsers } from "react-icons/fa";
import { adminAPI } from "../../../utils/api";
import UserDetail from "./UserDetail";
import UserFilters from "./UserFilters";
import UserList from "./UserList";
import UserStats from "./UserStats";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    verified: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats(); // Add separate stats fetch
  }, [currentPage, filters]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setUserStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        ...filters,
      };

      const response = await adminAPI.getAllUsers(queryParams);

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setTotalUsers(response.data.pagination.totalUsers);
        // Don't overwrite stats from getAllUsers - use dedicated stats endpoint
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
    );
    setSelectedUser(updatedUser);
    // Refresh stats after update
    fetchStats();
  };

  const handleUserDelete = (deletedUserId) => {
    setUsers((prev) => prev.filter((user) => user._id !== deletedUserId));
    setShowUserDetail(false);
    setSelectedUser(null);
    setTotalUsers((prev) => prev - 1);
    // Refresh stats after deletion
    fetchStats();
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  const handleExportUsers = async () => {
    try {
      // TODO: Implement user export functionality
      console.log("Exporting users...");
    } catch (error) {
      console.error("Failed to export users:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaUsers className="mr-3 text-blue-400" />
            User Management
          </h2>
          <p className="text-slate-400 mt-1">
            Manage {totalUsers} registered users
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
            onClick={handleExportUsers}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <UserStats stats={userStats} isLoading={isLoading} />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <FaUsers className="text-red-400 mr-2" />
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

      {/* User List */}
      <UserList
        users={users}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onUserSelect={handleUserSelect}
        onUserUpdate={handleUserUpdate}
        onUserDelete={handleUserDelete}
      />

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <UserDetail
          user={selectedUser}
          isOpen={showUserDetail}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
          onUserUpdate={handleUserUpdate}
          onUserDelete={handleUserDelete}
        />
      )}
    </div>
  );
};

export default UserManagement;
