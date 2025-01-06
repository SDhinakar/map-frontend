const env = process.env.NODE_ENV || 'development';

export const API_URL = env === "development" ? "http://localhost:5000" : "https://map-backend-lilac.vercel.app";
