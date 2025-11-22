import axios, { AxiosError } from 'axios';
import { getAuthToken, updateAuthToken } from '../contexts/AuthContext';

// Type for request config with retry flag
interface RequestConfig {
  _retry?: boolean;
  headers?: any;
  [key: string]: any;
}

// Get baseURL from environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Critical for httpOnly cookies (refresh tokens are sent automatically)
});

// Request interceptor to attach access token from AuthContext to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if refresh is in progress to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor that detects 401 and triggers refresh flow
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint - refresh token is sent via httpOnly cookie automatically
        // No need to manually send refresh token in request body or headers
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {}, // Empty body - refresh token comes from httpOnly cookie
          {
            withCredentials: true, // Ensure cookies are sent
          }
        );

        const { access } = response.data; // Django typically returns { access: "new_token" }

        if (access) {
          // Update access token in AuthContext
          updateAuthToken(access);

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }

          // Process queued requests
          processQueue(null, access);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed - clear everything and redirect to login
        processQueue(refreshError as AxiosError, null);
        
        // Clear user data
        sessionStorage.removeItem('userData');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

