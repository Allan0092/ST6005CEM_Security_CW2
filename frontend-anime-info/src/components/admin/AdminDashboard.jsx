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
import UserManagement from "./users/UserManagement";
import AnimeManagement from "./anime/AnimeManagement";

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overview Stats Cards */}
              <div className="p-6 rounded-xl border" style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.users?.total || 0}
                    </p>
                  </div>
                  <FaUsers className="text-blue-400 text-2xl" />
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Anime</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.anime?.total || 0}
                    </p>
                  </div>
                  <FaFilm className="text-purple-400 text-2xl" />
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Reviews</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.reviews?.total || 0}
                    </p>
                  </div>
                  <FaComments className="text-green-400 text-2xl" />
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">System Status</p>
                    <p className="text-2xl font-bold text-green-400">
                      {stats?.system?.status || "Operational"}
                    </p>
                  </div>
                  <FaCog className="text-slate-400 text-2xl" />
                </div>
              </div>
            </div>

            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-4">
                Welcome to the Admin Dashboard
              </h3>
              <p className="text-slate-400">
                Select a tab above to manage different aspects of the platform.
              </p>
            </div>
          </div>
        );

      case "users":
        return <UserManagement />;
      
      case "anime":
        return <AnimeManagement />; 

      case "reviews":
        return (
          <div className="text-center py-12">
            <FaComments className="text-6xl text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">
              Review Management
            </h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      case "reports":
        return (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-6xl text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">
              Reports & Moderation
            </h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      case "system":
        return (
          <div className="text-center py-12">
            <FaCog className="text-6xl text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">
              System Management
            </h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {user?.name}! Here's what's happening with your platform.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 p-1 rounded-xl" style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
