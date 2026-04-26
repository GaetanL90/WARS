import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function EyeIcon({ closed }: { closed: boolean }) {
  if (closed) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M3 4l17 17M10.6 10.7a2 2 0 002.8 2.8M9.9 5.2A11.9 11.9 0 0112 5c5.3 0 9.3 3.3 10.8 7-0.7 1.8-2 3.6-3.9 4.9M6.1 7.1C4.4 8.3 3.3 10 2.2 12c0.8 1.9 2.1 3.8 4.2 5.1A11.7 11.7 0 0012 19c1 0 2-.1 2.9-.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2.2 12C3.8 8.2 7.7 5 12 5s8.2 3.2 9.8 7c-1.6 3.8-5.5 7-9.8 7s-8.2-3.2-9.8-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function LoginPage() {
  const { login, isAuthenticated, auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const authState = location.state as {
    from?: { pathname?: string };
    registered?: boolean;
    email?: string;
    resetDone?: boolean;
  } | null;

  const role = auth?.user?.role;

  const getDefaultDest = (r: string | undefined) => {
    if (r === "citizen") return "/reports/new";
    if (r === "technician") return "/reports/assigned";
    return "/portal";
  };

  if (isAuthenticated) {
    return <Navigate to={getDefaultDest(role)} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const nextAuth = await login({ email, password });
      const userRole = nextAuth.user.role;
      const dest = authState?.from?.pathname ?? getDefaultDest(userRole);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div style={{ marginBottom: "1rem" }}>
          <Link to="/" className="text-button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to home
          </Link>
        </div>
        <h2>Sign in</h2>
        {authState?.registered && (
          <p className="success">Email verified for {authState.email}. You can now sign in.</p>
        )}
        {authState?.resetDone && <p className="success">Password reset successful for {authState.email}. Please sign in.</p>}
        <p>Mock mode is enabled. Use one of the seeded users (password: 123456).</p>
        <p className="hint">admin@wars.local | manager@wars.local | technician@wars.local | citizen@wars.local</p>
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <div className="password-field">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} required />
              <button
                type="button"
                className="password-visibility"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <EyeIcon closed={showPassword} />
              </button>
            </div>
          </label>
          {error && <p className="error">{error}</p>}
          <button disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-footer-text">
          New user? <Link to="/register">Create account</Link>
        </p>
        <p className="auth-footer-text">
          Forgot password? <Link to="/forgot-password">Reset password</Link>
        </p>
      </section>
    </main>
  );
}
