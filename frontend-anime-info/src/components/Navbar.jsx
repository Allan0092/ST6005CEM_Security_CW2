import { useState } from "react";
import {
  FaBars,
  FaHeart,
  FaHome,
  FaSearch,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <nav
        className="backdrop-blur-xl border-b z-50 sticky top-0 shadow-lg"
        style={{
          backgroundColor: "rgba(32, 31, 49, 0.95)",
          borderColor: "rgba(148, 163, 184, 0.3)",
        }}
      >
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="animate-pulse bg-slate-700 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-slate-700 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/dashboard", label: "Home", icon: FaHome },
    { path: "/search", label: "Search", icon: FaSearch },
    { path: "/favorites", label: "Favorites", icon: FaHeart },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/images/avatar-placeholder.jpg";

    if (avatar.startsWith("http")) return avatar;

    if (avatar.includes("/uploads/")) {
      return `http://localhost:3000${avatar}`;
    }

    return "/images/avatar-placeholder.jpg";
  };

  return (
    <nav
      className="backdrop-blur-xl border-b z-50 sticky top-0 shadow-lg"
      style={{
        backgroundColor: "rgba(32, 31, 49, 0.95)",
        borderColor: "rgba(148, 163, 184, 0.3)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent hover:from-slate-200 hover:to-slate-400 transition-all duration-300">
                AnimeInfo
              </h1>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = isActiveRoute(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center ${
                      isActive
                        ? "text-white bg-white/20 shadow-lg border border-white/10"
                        : "text-slate-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="mr-2 text-lg" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Authenticated User Info */}
                <Link
                  to="/profile"
                  className="flex items-center text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-300 group"
                  title="Go to Profile"
                >
                  <img
                    className="h-10 w-10 rounded-full border-2 border-slate-400/50 group-hover:border-slate-300 transition-colors object-cover"
                    src={getAvatarUrl(user?.avatar)}
                    alt={user?.name || "User"}
                    onError={(e) => {
                      console.log("Avatar load error, using fallback");
                      e.target.src = "/images/avatar-placeholder.jpg";
                    }}
                  />
                  <div className="ml-3 hidden sm:block">
                    <span className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                      {user?.name || "Loading..."}
                    </span>
                    <p className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                      {user?.email || ""}
                    </p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/20"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              </>
            ) : (
              <>
                {/* Authentication Buttons for Non-authenticated Users */}
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <FaSignInAlt className="mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                      boxShadow: "0 4px 15px rgba(100, 116, 139, 0.3)",
                    }}
                  >
                    <FaUserPlus className="mr-2" />
                    Sign Up
                  </Link>
                </div>

                {/* Mobile Auth Button */}
                <div className="sm:hidden">
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    title="Login"
                  >
                    <FaSignInAlt className="text-lg" />
                  </Link>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t backdrop-blur-lg"
            style={{
              backgroundColor: "rgba(26, 24, 39, 0.95)",
              borderColor: "rgba(148, 163, 184, 0.2)",
            }}
          >
            <div className="px-2 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = isActiveRoute(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "text-white bg-white/20 shadow-lg border border-white/10"
                        : "text-slate-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="mr-3 text-lg" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile User Section */}
              <div
                className="border-t pt-4 mt-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 mb-3 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={getAvatarUrl(user?.avatar)}
                        alt={user?.name || "User"}
                        onError={(e) => {
                          e.target.src = "/images/avatar-placeholder.jpg";
                        }}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                          {user?.name || "Loading..."}
                        </p>
                        <p className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                          {user?.email || ""}
                        </p>
                      </div>
                    </Link>
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mobile Auth Links */}
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <FaSignInAlt className="mr-3" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-white rounded-lg transition-colors mt-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                      }}
                    >
                      <FaUserPlus className="mr-3" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
