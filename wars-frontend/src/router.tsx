import { Route, Routes } from "react-router-dom";
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
import { AssignedReportsPage } from "./pages/AssignedReportsPage";
import { CaseReportsPage } from "./pages/CaseReportsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route element={<ProtectedRoute allowedRoles={["citizen", "technician"]} />}>
            <Route path="/reports/new" element={<SubmitReportPage />} />
            <Route path="/reports/edit/:id" element={<SubmitReportPage />} />
            <Route path="/reports/my" element={<MyReportsPage />} />
          </Route>
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
            <Route path="/reports/assigned" element={<AssignedReportsPage />} />
            <Route path="/reports/history" element={<CaseReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/analytics" element={<div className="card">Analytics page placeholder</div>} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
