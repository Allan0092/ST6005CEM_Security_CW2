import { useEffect, useState } from "react";
import {
  FaBan,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaCrown,
  FaEdit,
  FaEnvelope,
  FaExclamationTriangle,
  FaGlobe,
  FaShieldAlt,
  FaTimes,
  FaUser,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import { adminAPI } from "../../../utils/api";

const UserDetail = ({ user, isOpen, onClose, onUserUpdate, onUserDelete }) => {
  const [userDetails, setUserDetails] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    country: user.country || "",
  });

  useEffect(() => {
    if (user && user._id) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminAPI.getUserDetails(user._id);

      if (response.success) {
        setUserDetails(response.data.user);
      } else {
        setError(response.message || "Failed to load user details");
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      setError("Failed to load user details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action, userId, data = {}) => {
    try {
      setActionLoading((prev) => ({ ...prev, [action]: true }));
      setError(null);

      let response;

      switch (action) {
        case "verify":
          response = await adminAPI.updateUserStatus(userId, {
            isEmailVerified: true,
          });
          break;
        case "makeAdmin":
          response = await adminAPI.updateUserStatus(userId, {
            role: "admin",
          });
          break;
        case "removeAdmin":
          response = await adminAPI.updateUserStatus(userId, {
            role: "user",
          });
          break;
        case "edit":
          response = await adminAPI.updateUserStatus(userId, data);
          break;
        case "delete":
          response = await adminAPI.deleteUser(userId);
          break;
        default:
          throw new Error("Unknown action");
      }

      if (response.success) {
        if (action === "delete") {
          onUserDelete(userId);
          onClose();
        } else {
          const updatedUser = response.data.user;
          setUserDetails(updatedUser);
          onUserUpdate(updatedUser);
        }
      } else {
        setError(response.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      setError(`Failed to ${action} user. Please try again.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await handleAction("edit", user._id, editForm);
    setShowEditModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (user) => {
    if (user.banned) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          <FaBan className="mr-1" />
          Banned
        </span>
      );
    }
    if (!user.isEmailVerified) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <FaClock className="mr-1" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
        <FaCheck className="mr-1" />
        Active
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <FaCrown className="mr-1" />
          Administrator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        <FaUser className="mr-1" />
        User
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: "rgba(32, 31, 49, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
        >
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
              }}
            >
              {userDetails.role === "admin" ? (
                <FaShieldAlt className="text-white text-xl" />
              ) : (
                <FaUser className="text-white text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <p className="text-slate-400">
                Manage user account and permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-slate-300 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Loading user details...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchUserDetails}
                className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* User Info Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Card */}
                <div
                  className="lg:col-span-1 p-6 rounded-xl border"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="text-center mb-6">
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                      style={{
                        background:
                          userDetails.role === "admin"
                            ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                            : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                      }}
                    >
                      {userDetails.role === "admin" ? (
                        <FaShieldAlt className="text-white" />
                      ) : (
                        <FaUser className="text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {userDetails.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      @{userDetails.username}
                    </p>

                    <div className="space-y-2">
                      {getStatusBadge(userDetails)}
                      {getRoleBadge(userDetails.role)}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Reviews</span>
                      <span className="text-white font-medium">
                        {userDetails.reviewCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Favorites</span>
                      <span className="text-white font-medium">
                        {userDetails.favoriteCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Watch List</span>
                      <span className="text-white font-medium">
                        {userDetails.watchListCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.15)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                    }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Email Address
                        </label>
                        <div className="flex items-center text-white">
                          <FaEnvelope className="mr-2 text-slate-400" />
                          {userDetails.email}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Country
                        </label>
                        <div className="flex items-center text-white">
                          <FaGlobe className="mr-2 text-slate-400" />
                          {userDetails.country || "Not specified"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Member Since
                        </label>
                        <div className="flex items-center text-white">
                          <FaCalendarAlt className="mr-2 text-slate-400" />
                          {formatDate(userDetails.createdAt)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Last Login
                        </label>
                        <div className="flex items-center text-white">
                          <FaClock className="mr-2 text-slate-400" />
                          {userDetails.lastLogin
                            ? formatDate(userDetails.lastLogin)
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.15)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                    }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Account Status
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Email Verification
                        </label>
                        <div className="flex items-center">
                          {userDetails.isEmailVerified ? (
                            <span className="flex items-center text-green-400">
                              <FaCheck className="mr-2" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-400">
                              <FaClock className="mr-2" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-1">
                          Account Status
                        </label>
                        <div className="flex items-center">
                          {userDetails.banned ? (
                            <span className="flex items-center text-red-400">
                              <FaBan className="mr-2" />
                              Banned
                            </span>
                          ) : (
                            <span className="flex items-center text-green-400">
                              <FaCheck className="mr-2" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.15)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <h4 className="text-lg font-semibold text-white mb-4">
                  Admin Actions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Edit User */}
                  <button
                    onClick={() => setShowEditModal(true)}
                    disabled={actionLoading.edit}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                  >
                    <FaEdit className="mr-2" />
                    Edit User
                  </button>

                  {/* Email Verification */}
                  {!userDetails.isEmailVerified && (
                    <button
                      onClick={() => handleAction("verify", userDetails._id)}
                      disabled={actionLoading.verify}
                      className="flex items-center justify-center px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                    >
                      <FaUserCheck className="mr-2" />
                      {actionLoading.verify ? "Verifying..." : "Verify Email"}
                    </button>
                  )}

                  {/* Admin Role Toggle */}
                  {userDetails.role === "admin" ? (
                    <button
                      onClick={() =>
                        handleAction("removeAdmin", userDetails._id)
                      }
                      disabled={actionLoading.removeAdmin}
                      className="flex items-center justify-center px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors disabled:opacity-50"
                    >
                      <FaUser className="mr-2" />
                      {actionLoading.removeAdmin
                        ? "Removing..."
                        : "Remove Admin"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction("makeAdmin", userDetails._id)}
                      disabled={actionLoading.makeAdmin}
                      className="flex items-center justify-center px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
                    >
                      <FaShieldAlt className="mr-2" />
                      {actionLoading.makeAdmin ? "Promoting..." : "Make Admin"}
                    </button>
                  )}

                  {/* Delete User */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading.delete}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                  >
                    <FaUserTimes className="mr-2" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div
            className="relative p-6 rounded-xl border max-w-md w-full"
            style={{
              backgroundColor: "rgba(32, 31, 49, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div className="text-center">
              <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                Delete User Account
              </h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete{" "}
                <strong>{userDetails.name}</strong>'s account? This action
                cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAction("delete", userDetails._id);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={actionLoading.delete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                >
                  {actionLoading.delete ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div
            className="relative p-6 rounded-xl border max-w-md w-full"
            style={{
              backgroundColor: "rgba(32, 31, 49, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Edit User</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.edit}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                >
                  {actionLoading.edit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
