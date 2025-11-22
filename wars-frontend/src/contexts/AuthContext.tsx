import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, getCookie, deleteCookie, clearAuthCookies } from '../utils/cookies';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  // Add other user properties as needed
}

interface JWTPayload {
  user_id?: string;
  email?: string;
  role?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAccessToken: (newAccessToken: string) => void;
  loadUserFromToken: (token: string) => void;
  loading: boolean;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  updateAccessToken: (newAccessToken: string) => void;
  updateRefreshToken: (newRefreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global token storage and update function for axios interceptor access
let tokenRef: string | null = null;
let updateTokenRef: ((token: string) => void) | null = null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Function to get token for axios interceptor
export const getAuthToken = (): string | null => {
  return tokenRef;
};

// Function to update token from axios interceptor (for refresh flow)
export const updateAuthToken = (newToken: string): void => {
  if (updateTokenRef) {
    updateTokenRef(newToken);
  }
};

/**
 * Decode JWT token without verification (for client-side use only)
 * Backend should always verify the token signature
 */
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Replace URL-safe base64 characters and add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    // Decode base64
    const decoded = atob(padded);
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract user data from JWT payload
 */
const extractUserFromToken = (payload: JWTPayload): User | null => {
  if (!payload) return null;

  return {
    id: payload.user_id || payload.id || '',
    email: payload.email || '',
    role: payload.role || '',
    name: payload.name || payload.username || '',
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Update global token ref and update function whenever accessToken changes
  useEffect(() => {
    tokenRef = accessToken;
    updateTokenRef = updateAccessToken;
  }, [accessToken]);

  /**
   * Load user data from JWT token
   * Decodes the token and extracts user information including role
   */
  const loadUserFromToken = (token: string) => {
    const payload = decodeJWT(token);
    if (!payload) {
      console.error('Failed to decode JWT token');
      return;
    }

    const userData = extractUserFromToken(payload);
    if (userData && userData.role) {
      setUser(userData);
      setRole(userData.role);
      setAccessToken(token);
      
      // Save token to cookies for page refresh persistence (7 days expiry)
      setCookie('accessToken', token, 7);
      setCookie('userData', JSON.stringify(userData), 7);
    } else {
      console.error('Invalid user data in JWT token');
    }
  };

  /**
   * On page refresh, check cookies for saved access token and restore it
   */
  useEffect(() => {
    const savedToken = getCookie('accessToken');
    const savedUserData = getCookie('userData');
    const savedRefreshToken = getCookie('refreshToken');

    if (savedToken) {
      // Try to decode and validate token
      const payload = decodeJWT(savedToken);
      
      if (payload) {
        // Check if token is expired (only if exp field exists and is valid)
        if (payload.exp && payload.exp > 0 && payload.exp * 1000 < Date.now()) {
          // Token expired, clear cookies
          console.log('Token expired, clearing cookies');
          clearAuthCookies();
          setLoading(false);
          return;
        }

        // Token is valid (or dummy token without proper exp), restore user data
        const userData = extractUserFromToken(payload);
        if (userData && userData.role) {
          console.log('Restoring user from token:', userData);
          setUser(userData);
          setRole(userData.role);
          setAccessToken(savedToken);
          
          // Restore refresh token if available
          if (savedRefreshToken) {
            setRefreshToken(savedRefreshToken);
          }
          setLoading(false);
          return;
        }
      }
      
      // Fallback: Try to restore from saved userData cookie
      if (savedUserData) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          if (parsedUser && parsedUser.role) {
            console.log('Restoring user from cookie:', parsedUser);
            setUser(parsedUser);
            setRole(parsedUser.role);
            setAccessToken(savedToken);
            
            // Restore refresh token if available
            if (savedRefreshToken) {
              setRefreshToken(savedRefreshToken);
            }
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error);
        }
      }
      
      // If we get here, token couldn't be restored, clear cookies
      console.log('Failed to restore session, clearing cookies');
      clearAuthCookies();
    }

    setLoading(false);
  }, []);

  /**
   * Login: decode JWT to extract user role and store tokens in React state (in-memory) and cookies
   */
  const login = (accessToken: string, refreshTokenParam?: string) => {
    // Decode JWT to extract user information including role
    loadUserFromToken(accessToken);

    // Store refresh token in React state and cookies
    if (refreshTokenParam) {
      setRefreshToken(refreshTokenParam);
      setCookie('refreshToken', refreshTokenParam, 7);
    }
  };

  /**
   * Logout: clear all auth state and cookies
   */
  const logout = () => {
    // Clear tokens from React state (in-memory)
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setRole(null);

    // Clear all cookies
    clearAuthCookies();

    // Clear global token ref
    tokenRef = null;
  };

  /**
   * Refresh access token: update token and reload user data
   */
  const refreshAccessToken = (newAccessToken: string) => {
    // Decode new token and update user data
    loadUserFromToken(newAccessToken);
  };

  const getAccessToken = () => {
    return accessToken;
  };

  const getRefreshToken = () => {
    return refreshToken;
  };

  const updateAccessToken = (newAccessToken: string) => {
    // Update access token in React state (in-memory)
    setAccessToken(newAccessToken);
    
    // Update token in cookies for persistence
    setCookie('accessToken', newAccessToken, 7);
    
    // Reload user data from new token
    loadUserFromToken(newAccessToken);
  };

  const updateRefreshToken = (newRefreshToken: string) => {
    // Update refresh token in React state and cookies
    setRefreshToken(newRefreshToken);
    setCookie('refreshToken', newRefreshToken, 7);
  };

  const value: AuthContextType = {
    user,
    role,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken && !!role,
    login,
    logout,
    refreshAccessToken,
    loadUserFromToken,
    loading,
    getAccessToken,
    getRefreshToken,
    updateAccessToken,
    updateRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

