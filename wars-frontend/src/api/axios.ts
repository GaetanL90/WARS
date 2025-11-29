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

/**
 * Submit a new case (Mock implementation until backend is ready)
 * This function simulates API call and stores data in localStorage
 */
export interface SubmitCaseData {
  issue_type: string;
  description: string;
  location: string;
  image?: File;
}

export interface SubmitCaseResponse {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: string;
  image?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const submitCase = async (data: SubmitCaseData): Promise<SubmitCaseResponse> => {
  // Import mock data utilities
  const { saveCase, fileToBase64 } = await import('../utils/mockData');

  // Simulate API delay (1-2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Get current user ID from token (mock - in real app, decode JWT)
  let userId = 'anonymous';
  
  // Try to get user ID from sessionStorage or token
  try {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      userId = user.id || userId;
    }
  } catch (error) {
    console.warn('Could not get user ID from sessionStorage');
  }

  // Convert image to base64 if provided
  let imageBase64: string | undefined;
  if (data.image) {
    try {
      imageBase64 = await fileToBase64(data.image);
    } catch (error) {
      console.error('Error converting image to base64:', error);
      // Continue without image if conversion fails
    }
  }

  // Save case to mock storage
  const newCase = saveCase({
    userId,
    type: data.issue_type,
    description: data.description,
    location: data.location,
    image: imageBase64,
  });

  // Return response in API format
  return {
    id: newCase.id,
    userId: newCase.userId,
    type: newCase.type,
    description: newCase.description,
    location: newCase.location,
    image: newCase.image,
    status: newCase.status,
    createdAt: newCase.createdAt,
    updatedAt: newCase.updatedAt,
  };
};

