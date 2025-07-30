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
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
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

  forgotPassword: async (email) => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
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
        // Don't set Content-Type for FormData - let browser set it
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

export default apiCall;
