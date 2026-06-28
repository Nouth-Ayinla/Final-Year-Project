import axios from "axios";

export const axiosInstance = axios.create({
  // Add /api to the end of your base URL
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"),
  withCredentials: true,
});