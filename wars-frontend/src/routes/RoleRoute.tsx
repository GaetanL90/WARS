import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleRoute wrapper - Only allows access to specific dashboard pages based on role
 * Must be used inside PrivateRoute or after authentication check
 */
const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { role } = useAuth();

  // Normalize role (handle both 'wasac_manager' and 'wasac')
  const normalizedRole = role?.toLowerCase().replace('_', '') || '';

  // Check if user's role is in allowed roles
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().replace('_', ''));
  
  if (!normalizedAllowedRoles.includes(normalizedRole)) {
    // Redirect to user's appropriate dashboard based on their role
    const roleMap: Record<string, string> = {
      'admin': '/dashboard/admin',
      'technician': '/dashboard/technician',
      'responsible': '/dashboard/responsible',
      'customer': '/dashboard/customer',
      'wasacmanager': '/dashboard/wasac-manager',
      'wasac': '/dashboard/wasac-manager',
    };

    const redirectPath = roleMap[normalizedRole] || '/dashboard/customer';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

/**
 * Combined PrivateRoute + RoleRoute for convenience
 */
export const ProtectedRoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  return (
    <PrivateRoute>
      <RoleRoute allowedRoles={allowedRoles}>
        {children}
      </RoleRoute>
    </PrivateRoute>
  );
};

export default RoleRoute;

