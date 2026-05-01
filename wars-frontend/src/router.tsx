import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

// Lazy-loaded pages
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const IncidentManagementPage = lazy(() => import("./pages/IncidentManagementPage").then(m => ({ default: m.IncidentManagementPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage").then(m => ({ default: m.UnauthorizedPage })));
const SensorDetailsPage = lazy(() => import("./pages/SensorDetailsPage").then(m => ({ default: m.SensorDetailsPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const SubmitReportPage = lazy(() => import("./pages/SubmitReportPage").then(m => ({ default: m.SubmitReportPage })));
const MyReportsPage = lazy(() => import("./pages/MyReportsPage").then(m => ({ default: m.MyReportsPage })));
const ReportDetailsPage = lazy(() => import("./pages/ReportDetailsPage").then(m => ({ default: m.ReportDetailsPage })));
const AssignedReportsPage = lazy(() => import("./pages/AssignedReportsPage").then(m => ({ default: m.AssignedReportsPage })));
const CaseReportsPage = lazy(() => import("./pages/CaseReportsPage").then(m => ({ default: m.CaseReportsPage })));
const ManagerDashboardPage = lazy(() => import("./pages/ManagerDashboardPage").then(m => ({ default: m.ManagerDashboardPage })));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage").then(m => ({ default: m.UserManagementPage })));
const InfrastructurePage = lazy(() => import("./pages/InfrastructurePage").then(m => ({ default: m.InfrastructurePage })));
const ZoneManagementPage = lazy(() => import("./pages/ZoneManagementPage").then(m => ({ default: m.ZoneManagementPage })));
const ZoneDetailsPage = lazy(() => import("./pages/ZoneDetailsPage").then(m => ({ default: m.ZoneDetailsPage })));
const PipeManagementPage = lazy(() => import("./pages/PipeManagementPage").then(m => ({ default: m.PipeManagementPage })));
const PipeDetailsPage = lazy(() => import("./pages/PipeDetailsPage").then(m => ({ default: m.PipeDetailsPage })));
const WaterPointDetailsPage = lazy(() => import("./pages/WaterPointDetailsPage").then(m => ({ default: m.WaterPointDetailsPage })));
const TechnicianDetailsPage = lazy(() => import("./pages/TechnicianDetailsPage").then(m => ({ default: m.TechnicianDetailsPage })));
const CitizenDashboardPage = lazy(() => import("./pages/CitizenDashboardPage").then(m => ({ default: m.CitizenDashboardPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

function DashboardHome() {
  const { auth } = useAuth();
  if (!auth || !auth.user) return <Navigate to="/login" replace />;

  switch (auth.user.role) {
    case 'admin':
    case 'manager':
      return <Navigate to="/dashboard/manager" replace />;
    case 'technician':
      return <Navigate to="/dashboard/technician" replace />;
    case 'citizen':
    default:
      return <Navigate to="/dashboard/citizen" replace />;
  }
}

// Simple loading fallback
function PageLoader() {
  return (
    <div className="page-loader-container">
      <div className="loader-spinner"></div>
      <p>Loading WARS Platform...</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Dashboard Routes (All Protected) */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardHome />} />
            
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Role-Specific Dashboards */}
            <Route path="manager" element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
               <Route index element={<ManagerDashboardPage />} />
            </Route>
            <Route path="technician" element={<ProtectedRoute allowedRoles={['technician']} />}>
               <Route index element={<AssignedReportsPage />} />
            </Route>
            <Route path="citizen" element={<ProtectedRoute allowedRoles={['citizen']} />}>
               <Route index element={<CitizenDashboardPage />} />
            </Route>

            {/* Infrastructure & Governance */}
            <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
              <Route path="users" element={<UserManagementPage />} />
              <Route path="users/technician/:id" element={<TechnicianDetailsPage />} />
              <Route path="infrastructure" element={<InfrastructurePage />} />
              <Route path="infrastructure/zones" element={<ZoneManagementPage />} />
              <Route path="infrastructure/zones/:id" element={<ZoneDetailsPage />} />
              <Route path="infrastructure/pipes" element={<PipeManagementPage />} />
              <Route path="infrastructure/pipes/:id" element={<PipeDetailsPage />} />
              <Route path="infrastructure/water-point/:id" element={<WaterPointDetailsPage />} />
              <Route path="incidents" element={<IncidentManagementPage />} />
              <Route path="incidents/sensor/:id" element={<SensorDetailsPage />} />
            </Route>

            {/* Reports */}
            <Route path="reports">
              <Route path="new" element={<SubmitReportPage />} />
              <Route path="edit/:id" element={<SubmitReportPage />} />
              <Route path="my" element={<MyReportsPage />} />
              <Route element={<ProtectedRoute allowedRoles={['technician', 'manager', 'admin']} />}>
                <Route path="assigned" element={<AssignedReportsPage />} />
                <Route path="history" element={<CaseReportsPage />} />
              </Route>
              <Route path=":id" element={<ReportDetailsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
