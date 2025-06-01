
export const CLOUDINARY_CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_CLOUDINARY_BASE_URL,
};

export const getCloudinaryUrl = (path) => {
  if (!path) return ""; // hoặc fallback URL
  return `${CLOUDINARY_CONFIG.BASE_URL}${path}`;
};