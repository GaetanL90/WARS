import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NotFoundPage() {
  const { auth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const getLandingPage = () => {
    if (!isAuthenticated) return "/login";
    const role = auth?.user?.role;
    if (role === "technician") return "/reports/assigned";
    if (role === "citizen") return "/reports/new";
    if (role === "manager" || role === "admin") return "/portal";
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
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <section className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '8rem', margin: 0, lineHeight: 1, color: '#f1f5f9', fontWeight: 900 }}>404</h1>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#1d4ed8' }}>
            <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#10233c' }}>Page Not Found</h2>
        <p style={{ color: '#5f768f', marginBottom: '32px', lineHeight: '1.6' }}>
          Oops! The page you are looking for doesn't exist or has been moved to a new URL.
        </p>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e0e9f6', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            height: '4px', 
            background: '#1d4ed8', 
            width: `${(countdown / 5) * 100}%`,
            transition: 'width 1s linear'
          }}></div>
          <p style={{ fontSize: '0.95rem', color: '#10233c', margin: 0 }}>
            Taking you back home in 
            <strong style={{ display: 'block', fontSize: '2.5rem', color: '#1d4ed8', marginTop: '4px', fontWeight: 800 }}>{countdown}</strong>
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ marginTop: '32px', width: '100%', height: '48px' }}
          onClick={() => navigate(getLandingPage())}
        >
          Take Me Home Now
        </button>
      </section>
    </div>
  );
}
