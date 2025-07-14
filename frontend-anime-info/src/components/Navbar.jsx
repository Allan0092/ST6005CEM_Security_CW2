import { useState } from "react";
import {
  FaBars,
  FaHeart,
  FaHome,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://via.placeholder.com/150",
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Don't show navbar on login and register pages
  //   const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbarRoutes = [];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/dashboard", label: "Home", icon: FaHome },
    { path: "/search", label: "Search", icon: FaSearch },
    { path: "/favorites", label: "Favorites", icon: FaHeart },
  ];

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

          {/* Desktop Navigation Links */}
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

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center text-white">
              <img
                className="h-10 w-10 rounded-full border-2 border-slate-400/50 hover:border-slate-300 transition-colors"
                src={user.avatar}
                alt={user.name}
              />
              <div className="ml-3 hidden sm:block">
                <span className="text-sm font-medium text-slate-100">
                  {user.name}
                </span>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Link
              to="/login"
              className="text-slate-300 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/20"
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
            </Link>

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

              {/* Mobile User Info */}
              <div
                className="border-t pt-4 mt-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                <div className="flex items-center px-4 py-2">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.name}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-300">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
