import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Checking auth status, token:",
        token ? "exists" : "not found"
      );

      if (token) {
        const response = await authAPI.getMe();
        console.log("getMe response:", response);

        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log("User authenticated:", response.data.user);
        } else {
          console.log("Token invalid, removing from storage");
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log("No token found");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log("Login response:", response);

      if (response.success) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log("Login successful, token saved:", token);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      console.log("Logout API call successful");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      console.log("User logged out, state cleared");
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
