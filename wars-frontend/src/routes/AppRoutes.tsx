import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import PrivateRoute from './PrivateRoute';
import { ProtectedRoleRoute } from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedDashboardRedirect from './DashboardRedirect';

// Lazy load pages for code splitting
const Landing = lazy(() => import('../pages/Landing'));
const Contact = lazy(() => import('../pages/Contact'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const ProfileSettings = lazy(() => import('../pages/ProfileSettings'));
const CaseDetails = lazy(() => import('../pages/CaseDetails'));
const Cases = lazy(() => import('../pages/Cases'));
const AdminCases = lazy(() => import('../pages/AdminCases'));
const TechnicianCases = lazy(() => import('../pages/TechnicianCases'));
const ReportIssue = lazy(() => import('../pages/ReportIssue'));
const Reports = lazy(() => import('../pages/Reports'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const UpdatePassword = lazy(() => import('../pages/UpdatePassword'));
const AdminDashboard = lazy(() => import('../pages/Dashboards/Admin'));
const ResponsibleDashboard = lazy(() => import('../pages/Dashboards/Responsible'));
const TechnicianDashboard = lazy(() => import('../pages/Dashboards/Technician'));
const CustomerDashboard = lazy(() => import('../pages/Dashboards/Customer'));
const WasacManagerDashboard = lazy(() => import('../pages/Dashboards/WasacManager'));
const SensorsPage = lazy(() => import('../pages/Sensors'));

// Loading component
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            path="/profile/settings"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProfileSettings />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/cases/admin"
            element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminCases />
                </DashboardLayout>
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="/cases/assigned"
            element={
              <ProtectedRoleRoute allowedRoles={['technician']}>
                <DashboardLayout>
                  <TechnicianCases />
                </DashboardLayout>
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="/cases/new"
            element={
              <ProtectedRoleRoute allowedRoles={['customer']}>
                <DashboardLayout>
                  <ReportIssue />
                </DashboardLayout>
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <CaseDetails />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoleRoute allowedRoles={['customer']}>
                <DashboardLayout>
                  <Cases />
                </DashboardLayout>
              </ProtectedRoleRoute>
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
          <Route
            path="/sensors"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <SensorsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;

