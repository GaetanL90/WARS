import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute component
 * If user is not authenticated → redirect to /login
 * Otherwise → render children
 * Waits for loading to complete before checking authentication
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth state to load from cookies before checking authentication
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

