import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PortalPage } from "./pages/PortalPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SubmitReportPage } from "./pages/SubmitReportPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { ReportDetailsPage } from "./pages/ReportDetailsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reports/new" element={<SubmitReportPage />} />
          <Route path="/reports/edit/:id" element={<SubmitReportPage />} />
          <Route path="/reports/my" element={<MyReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route path="/reports/assigned" element={<div className="page-container"><div className="page-header"><h1>Assigned Reports</h1><p>View and manage reports assigned to you.</p></div></div>} />
        </Route>
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}
      >
        <Route element={<Layout />}>
          <Route path="/analytics" element={<div className="card">Analytics page placeholder</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
