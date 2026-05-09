import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function UnauthorizedPage() {
  const { auth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const getLandingPage = () => {
    if (!isAuthenticated) return "/login";
    const role = auth?.user?.role;
    if (role === "technician") return "/reports/assigned";
    if (role === "citizen") return "/reports/new";
    if (role === "manager" || role === "admin") return "/dashboard";
    return "/";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate(getLandingPage(), { replace: true });
    }

    return () => clearInterval(timer);
  }, [countdown, navigate, isAuthenticated, auth]);

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <section className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Access Denied</h2>
        <p style={{ color: '#5f768f', marginBottom: '24px', lineHeight: '1.6' }}>
          Your account role does not have the necessary permissions to access this page.
        </p>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e0e9f6' }}>
          <p style={{ fontSize: '0.9rem', color: '#10233c', margin: 0 }}>
            Redirecting you to your dashboard in 
            <strong style={{ display: 'block', fontSize: '2rem', color: '#1d4ed8', marginTop: '8px' }}>{countdown}</strong>
          </p>
        </div>
        <button 
          className="btn btn-outline" 
          style={{ marginTop: '24px', width: '100%' }}
          onClick={() => navigate(getLandingPage())}
        >
          Return Now
        </button>
      </section>
    </div>
  );
}
