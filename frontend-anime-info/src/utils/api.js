import CryptoJS from "crypto-js";

// Updated API base URL to use HTTPS
const API_BASE_URL = "https://localhost:3000/api/v1";

// Encryption key, should match with the backend
const ENCRYPTION_KEY = "secret-key"; // TODO: change key, store somewhere safe after testing.

// Encrypt password before sending to backend
const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url, config);
    const data = await response.json();
    console.log(`API Response (${response.status}):`, data);

    if (!response.ok) {
      // Create an error that preserves the response structure
      const error = new Error(
        data.message || `HTTP error! status: ${response.status}`
      );
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: data,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error.response) {
      throw error;
    }

    console.error(`API call failed for ${endpoint}:`, error);
    const networkError = new Error("Network error occurred");
    networkError.response = {
      status: 0,
      data: {
        message: "Failed to connect to server",
        errors: { network: "Connection failed" },
      },
    };
    throw networkError;
  }
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    const encryptedData = {
      ...userData,
      password: encryptPassword(userData.password),
    };

    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(encryptedData),
    });
  },

  login: async (credentials) => {
    const encryptedData = {
      ...credentials,
      password: encryptPassword(credentials.password),
    };

    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(encryptedData),
    });
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    return apiCall("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  verifyEmail: async (token) => {
    return apiCall(`/auth/verify-email/${token}`);
  },

  resendVerification: async (email) => {
    return apiCall("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword: async (data) => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  getMe: async () => {
    const token = localStorage.getItem("token");
    console.log("Getting user profile with token:", token);

    if (!token) {
      throw new Error("No token found");
    }

    return apiCall("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  verifyOTP: async (data) => {
    return apiCall("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resendOTP: async (data) => {
    return apiCall("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (passwordData) => {
    const token = localStorage.getItem("token");

    // Encrypt and send currentPassword and newPassword
    const encryptedData = {
      currentPassword: encryptPassword(passwordData.currentPassword),
      newPassword: encryptPassword(passwordData.newPassword),
    };

    return apiCall("/auth/change-password", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
    });
  },

  resetPassword: async (resetToken, data) => {
    const encryptedData = {
      password: encryptPassword(data.password),
      confirmPassword: encryptPassword(data.confirmPassword),
    };

    return apiCall(`/auth/reset-password/${resetToken}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
    });
  },
};

// User API functions
export const userAPI = {
  updateProfile: async (profileData) => {
    const token = localStorage.getItem("token");
    return apiCall("/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
  },

  uploadAvatar: async (formData) => {
    const token = localStorage.getItem("token");
    return apiCall("/users/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  updateEmail: async (emailData) => {
    const token = localStorage.getItem("token");
    const encryptedData = {
      ...emailData,
      password: encryptPassword(emailData.password),
    };

    return apiCall("/users/email", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
    });
  },

  getProfile: async () => {
    const token = localStorage.getItem("token");
    return apiCall("/users/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },
};

// Admin API functions
export const adminAPI = {
  // Dashboard & Stats
  getStats: async () => {
    const token = localStorage.getItem("token");
    return apiCall("/admin/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  getAnalytics: async () => {
    const token = localStorage.getItem("token");
    return apiCall("/admin/analytics", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const token = localStorage.getItem("token");
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  getUserDetails: async (userId) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  updateUserStatus: async (userId, statusData) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });
  },

  deleteUser: async (userId) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Anime Management
  getAdminAnime: async (params = {}) => {
    const token = localStorage.getItem("token");
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/anime?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  getAnimeDetails: async (animeId) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/anime/${animeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  createAnime: async (animeData) => {
    const token = localStorage.getItem("token");
    return apiCall("/admin/anime", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: animeData, 
    });
  },

  updateAnime: async (animeId, animeData) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/anime/${animeId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: animeData, 
    });
  },

  deleteAnime: async (animeId) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/anime/${animeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Reports Management
  getReports: async (params = {}) => {
    const token = localStorage.getItem("token");
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/reports?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  handleReport: async (reportId, action) => {
    const token = localStorage.getItem("token");
    return apiCall(`/admin/reports/${reportId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action),
    });
  },

  // System Management
  backupDatabase: async () => {
    const token = localStorage.getItem("token");
    return apiCall("/admin/backup", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  getSystemLogs: async (params = {}) => {
    const token = localStorage.getItem("token");
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/logs?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },
};

// Dashboard/Public API functions
export const dashboardAPI = {
  getRecentAnime: async (limit = 12) => {
    return apiCall(`/anime/recent?limit=${limit}`);
  },

  getPopularAnime: async (limit = 12) => {
    return apiCall(`/anime/popular?limit=${limit}`);
  },

  getTopRatedAnime: async (limit = 12) => {
    return apiCall(`/anime/top-rated?limit=${limit}`);
  },

  getTrendingAnime: async (limit = 12) => {
    return apiCall(`/anime/trending?limit=${limit}`);
  },

  getAllAnime: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/anime${queryString ? `?${queryString}` : ""}`);
  },
};

// Public anime API functions
export const animeAPI = {
  getAllAnime: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/anime${queryString ? `?${queryString}` : ""}`);
  },

  getAnime: async (id) => {
    return apiCall(`/anime/${id}`);
  },

  getAnimeReviews: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(
      `/anime/${id}/reviews${queryString ? `?${queryString}` : ""}`
    );
  },

  getRelatedAnime: async (id) => {
    return apiCall(`/anime/${id}/related`);
  },

  toggleFavorite: async (id) => {
    return apiCall(`/anime/${id}/favorite`, "POST", {}, true);
  },

  addView: async (id) => {
    return apiCall(`/anime/${id}/view`, "POST", {}, true);
  },

  searchAnime: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/anime/search${queryString ? `?${queryString}` : ""}`);
  },
};

export default apiCall;
