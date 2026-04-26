import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { auth, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">
          WARS
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/portal">Portal</Link>
          <Link to="/analytics">Analytics</Link>
        </nav>
        <div className="userbox">
          <span className="role-pill">{auth?.user.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
