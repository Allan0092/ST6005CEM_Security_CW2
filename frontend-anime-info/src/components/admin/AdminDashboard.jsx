import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaCog,
  FaComments,
  FaDatabase,
  FaExclamationTriangle,
  FaFilm,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../utils/api";
import UserManagement from "./users/UserManagement"; // Add this import

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats(response.data.stats);
      } else {
        setError(response.message || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      setError("Failed to load admin dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartLine },
    { id: "users", label: "Users", icon: FaUsers },
    { id: "anime", label: "Anime", icon: FaFilm },
    { id: "reviews", label: "Reviews", icon: FaComments },
    { id: "reports", label: "Reports", icon: FaExclamationTriangle },
    { id: "system", label: "System", icon: FaCog },
  ];

  // Access control
  if (user?.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
        }}
      >
        <div
          className="text-center p-12 rounded-2xl backdrop-blur-lg"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <FaShieldAlt className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Header */}
      <div
        className="backdrop-blur-lg border-b p-6"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          borderColor: "rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FaShieldAlt className="mr-3 text-emerald-400" />
                Admin Dashboard
              </h1>
              <p className="text-slate-400 mt-1">Manage your anime platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Welcome back,</p>
                <p className="text-white font-semibold">{user?.name}</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                <FaShieldAlt className="text-white text-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex space-x-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchAdminStats();
              }}
              className="text-red-300 hover:text-red-200 underline text-sm mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl animate-pulse"
                    style={{
                      backgroundColor: "rgba(71, 85, 105, 0.15)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                    }}
                  >
                    <div className="h-4 bg-slate-600 rounded mb-4"></div>
                    <div className="h-8 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Card */}
                <div
                  className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaUsers className="text-2xl text-blue-400" />
                    <span className="text-xs text-slate-400">USERS</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats?.users?.total || 0}
                  </div>
                  <div className="text-sm text-slate-400">
                    {stats?.users?.verified || 0} verified
                  </div>
                  <div className="mt-3 text-xs text-emerald-400">
                    +{stats?.users?.recent || 0} this week
                  </div>
                </div>

                {/* Anime Card */}
                <div
                  className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaFilm className="text-2xl text-purple-400" />
                    <span className="text-xs text-slate-400">ANIME</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats?.anime?.total || 0}
                  </div>
                  <div className="text-sm text-slate-400">
                    {stats?.anime?.airing || 0} currently airing
                  </div>
                  <div className="mt-3 text-xs text-emerald-400">
                    +{stats?.anime?.recent || 0} added recently
                  </div>
                </div>

                {/* Reviews Card */}
                <div
                  className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaComments className="text-2xl text-green-400" />
                    <span className="text-xs text-slate-400">REVIEWS</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats?.reviews?.total || 0}
                  </div>
                  <div className="text-sm text-slate-400">
                    {stats?.reviews?.pending || 0} pending review
                  </div>
                  <div className="mt-3 text-xs text-emerald-400">
                    +{stats?.reviews?.recent || 0} this week
                  </div>
                </div>

                {/* System Status Card */}
                <div
                  className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(71, 85, 105, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaDatabase className="text-2xl text-orange-400" />
                    <span className="text-xs text-slate-400">SYSTEM</span>
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    Online
                  </div>
                  <div className="text-sm text-slate-400">
                    All systems operational
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    Last backup: {stats?.system?.lastBackup || "Never"}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/20 transition-all duration-300 group"
                >
                  <FaUsers className="text-2xl text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-white font-medium">Manage Users</div>
                  <div className="text-sm text-slate-400">
                    View and manage user accounts
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("anime")}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/20 transition-all duration-300 group"
                >
                  <FaFilm className="text-2xl text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-white font-medium">Manage Anime</div>
                  <div className="text-sm text-slate-400">
                    Add and edit anime content
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/20 transition-all duration-300 group"
                >
                  <FaExclamationTriangle className="text-2xl text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-white font-medium">Review Reports</div>
                  <div className="text-sm text-slate-400">
                    Handle user reports and issues
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {/* Placeholder activity items */}
                <div className="flex items-center p-3 rounded-lg bg-slate-700/30">
                  <FaUsers className="text-blue-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-white text-sm">New user registered</p>
                    <p className="text-slate-400 text-xs">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-slate-700/30">
                  <FaComments className="text-green-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-white text-sm">New review posted</p>
                    <p className="text-slate-400 text-xs">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-slate-700/30">
                  <FaFilm className="text-purple-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Anime updated</p>
                    <p className="text-slate-400 text-xs">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab - NEW */}
        {activeTab === "users" && <UserManagement />}

        {/* Other tabs placeholder - update this part */}
        {activeTab !== "overview" && activeTab !== "users" && (
          <div className="text-center py-12">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
              }}
            >
              <FaCog className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 capitalize">
              {activeTab} Management
            </h2>
            <p className="text-slate-400 mb-6">
              {activeTab} management interface is coming soon...
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                color: "white",
              }}
            >
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
