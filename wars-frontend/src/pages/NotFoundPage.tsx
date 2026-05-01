import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const landingPage = isAuthenticated ? "/dashboard" : "/";

  useEffect(() => {
    if (countdown <= 0) {
      navigate(landingPage, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate, landingPage]);

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <section className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '8rem', margin: 0, lineHeight: 1, color: '#f1f5f9', fontWeight: 900 }}>404</h1>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#3b82f6' }}>
            <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#1e293b' }}>Page Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          The page you are looking for doesn't exist or has been moved to a new dashboard location.
        </p>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            height: '4px', 
            background: '#3b82f6', 
            width: `${(countdown / 5) * 100}%`,
            transition: 'width 1s linear'
          }}></div>
          <p style={{ fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
            Redirecting to safety in 
            <strong style={{ display: 'block', fontSize: '2.5rem', color: '#3b82f6', marginTop: '4px', fontWeight: 800 }}>{countdown}</strong>
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ marginTop: '32px', width: '100%', height: '48px' }}
          onClick={() => navigate(landingPage)}
        >
          Return to Dashboard
        </button>
      </section>
    </div>
  );
}
