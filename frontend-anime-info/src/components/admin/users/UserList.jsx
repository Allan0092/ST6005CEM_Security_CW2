import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaShieldAlt,
  FaUser,
  FaUserCheck,
  FaUsers,
  FaUserTimes,
} from "react-icons/fa";

const UserList = ({
  users,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onUserSelect,
  onUserUpdate,
  onUserDelete,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaShieldAlt className="text-red-400" />;
      case "moderator":
        return <FaUserCheck className="text-yellow-400" />;
      default:
        return <FaUser className="text-blue-400" />;
    }
  };

  const getStatusBadge = (user) => {
    if (!user.isEmailVerified) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Unverified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
        Active
      </span>
    );
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl border"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-slate-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className="p-12 text-center rounded-xl border"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <FaUsers className="text-4xl text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
        <p className="text-slate-400">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "rgba(71, 85, 105, 0.15)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
      }}
    >
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={
                selectedUsers.length === users.length && users.length > 0
              }
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-400">
              {selectedUsers.length > 0
                ? `${selectedUsers.length} selected`
                : `${users.length} users`}
            </span>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors">
                Ban Selected
              </button>
              <button className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors">
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-slate-600">
        {users.map((user) => (
          <div
            key={user._id}
            className="px-6 py-4 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleSelectUser(user._id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />

              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                }}
              >
                {getRoleIcon(user.role)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  {getStatusBadge(user)}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    Joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* User Stats */}
              <div className="hidden md:flex items-center space-x-6 text-xs text-slate-400">
                <div className="text-center">
                  <div className="text-white font-medium">
                    {user.reviewCount || 0}
                  </div>
                  <div>Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">
                    {user.favoriteCount || 0}
                  </div>
                  <div>Favorites</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUserSelect(user)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="View Details"
                >
                  <FaEye />
                </button>

                <button
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <FaUserTimes />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
