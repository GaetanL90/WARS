import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Contact from '../pages/Contact';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import CaseDetail from '../pages/CaseDetail';
import Cases from '../pages/Cases';
import Reports from '../pages/Reports';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import ResetPassword from '../pages/ResetPassword';
import UpdatePassword from '../pages/UpdatePassword';
import AdminDashboard from '../pages/Dashboards/Admin';
import ResponsibleDashboard from '../pages/Dashboards/Responsible';
import TechnicianDashboard from '../pages/Dashboards/Technician';
import CustomerDashboard from '../pages/Dashboards/Customer';
import WasacManagerDashboard from '../pages/Dashboards/WasacManager';
import PrivateRoute from './PrivateRoute';
import { ProtectedRoleRoute } from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedDashboardRedirect from './DashboardRedirect';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        {/* Dashboard Redirect - Redirects to role-specific dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedDashboardRedirect />}
        />
        
        {/* Protected Routes - Dashboards (Role-based) with Layout */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoleRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/dashboard/responsible"
          element={
            <ProtectedRoleRoute allowedRoles={['responsible']}>
              <DashboardLayout>
                <ResponsibleDashboard />
              </DashboardLayout>
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/dashboard/technician"
          element={
            <ProtectedRoleRoute allowedRoles={['technician']}>
              <DashboardLayout>
                <TechnicianDashboard />
              </DashboardLayout>
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoleRoute allowedRoles={['customer']}>
              <DashboardLayout>
                <CustomerDashboard />
              </DashboardLayout>
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/dashboard/wasac-manager"
          element={
            <ProtectedRoleRoute allowedRoles={['wasac_manager', 'wasac']}>
              <DashboardLayout>
                <WasacManagerDashboard />
              </DashboardLayout>
            </ProtectedRoleRoute>
          }
        />
        
        {/* Protected Routes - General (Authentication only, no role restriction) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CaseDetail />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Cases />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

