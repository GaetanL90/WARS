import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';

/**
 * DashboardRedirect component
 * Redirects authenticated users to their role-specific dashboard
 */
const DashboardRedirect: React.FC = () => {
  const { role } = useAuth();

  // Map role to dashboard path
  const roleMap: Record<string, string> = {
    admin: '/dashboard/admin',
    technician: '/dashboard/technician',
    customer: '/dashboard/customer',
    wasac_manager: '/dashboard/wasac-manager',
    wasac: '/dashboard/wasac-manager',
    responsible: '/dashboard/responsible',
  };

  // Normalize role (handle variations)
  const normalizedRole = role?.toLowerCase().replace('_', '') || '';
  const dashboardPath = roleMap[normalizedRole] || roleMap[role?.toLowerCase() || ''] || '/dashboard/customer';

  return <Navigate to={dashboardPath} replace />;
};

/**
 * Protected DashboardRedirect - Only accessible to authenticated users
 */
const ProtectedDashboardRedirect: React.FC = () => {
  return (
    <PrivateRoute>
      <DashboardRedirect />
    </PrivateRoute>
  );
};

export default ProtectedDashboardRedirect;

