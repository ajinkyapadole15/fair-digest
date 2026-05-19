/**
 * @fileoverview Axios HTTP Client Configuration
 * @description Pre-configured axios instance with JWT interceptors and error handling
 */

import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In local dev, falls back to '/api' which Vite proxies to localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for AI analysis
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fairdigest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('fairdigest_token');
        localStorage.removeItem('fairdigest_user');
      }
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

export default api;
