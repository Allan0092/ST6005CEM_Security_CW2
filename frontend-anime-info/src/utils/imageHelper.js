// Create this new utility file:

const API_BASE_URL = "https://localhost:3000";

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "/images/anime-placeholder.jpg";
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  // If it's a relative URL, construct the full URL
  if (imageUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Fallback to placeholder
  return "/images/anime-placeholder.jpg";
};

export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return "/images/user-placeholder.jpg";
  
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith("http")) {
    return avatarUrl;
  }
  
  // If it's a relative URL, construct the full URL
  if (avatarUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${avatarUrl}`;
  }
  
  // Fallback to placeholder
  return "/images/user-placeholder.jpg";
};