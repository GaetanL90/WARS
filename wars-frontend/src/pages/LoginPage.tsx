import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const authState = location.state as {
    from?: { pathname?: string };
    registered?: boolean;
    email?: string;
    resetDone?: boolean;
  } | null;

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  const from = authState?.from?.pathname ?? "/portal";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="card auth-card">
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
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
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
