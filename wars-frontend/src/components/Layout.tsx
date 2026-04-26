import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import warsLogo from "../assets/WARS_logo.png";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  );
}

function FilePlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
  );
}

function ClipboardListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1"></rect>
      <line x1="9" y1="12" x2="15" y2="12"></line>
      <line x1="9" y1="16" x2="13" y2="16"></line>
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  );
}

export function Layout() {
  const { auth, logout, hasAnyRole } = useAuth();
  const [isSidenavOpen, setIsSidenavOpen] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New report submitted", message: "A new contamination report at Kabeza.", read: false, time: "5m ago" },
    { id: 2, title: "System Update", message: "WARS backend scheduled maintenance.", read: false, time: "1h ago" },
    { id: 3, title: "Alert Resolved", message: "Turbidity alert at Nyarutarama fixed.", read: true, time: "2h ago" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const user = auth?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidenavOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={`dashboard-shell ${isSidenavOpen ? "sidenav-open" : "sidenav-closed"}`}>
      <aside className="dashboard-sidenav">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="avatar-large">{initial}</div>
            <div className="profile-card-title">
              <span className="profile-name">{displayName}</span>
              <span className="profile-email">{user?.email}</span>
            </div>
          </div>
          <div className="profile-card-footer">
            <span className="role-pill">{user?.role}</span>
          </div>
        </div>

        <nav className="sidenav-nav">
          {/* Citizen-only links */}
          {hasAnyRole(["citizen"]) && (
            <>
              <Link to="/reports/new" className={`nav-item ${location.pathname === "/reports/new" ? "active" : ""}`}>
                <FilePlusIcon />
                <span>Submit Report</span>
              </Link>
              <Link to="/reports/my" className={`nav-item ${location.pathname === "/reports/my" ? "active" : ""}`}>
                <ClipboardListIcon />
                <span>My Reports</span>
              </Link>
            </>
          )}

          {/* Technician links */}
          {hasAnyRole(["technician"]) && (
            <>
              <Link to="/reports/assigned" className={`nav-item ${location.pathname === "/reports/assigned" ? "active" : ""}`}>
                <WrenchIcon />
                <span>Assigned Reports</span>
              </Link>
              <Link to="/reports/my" className={`nav-item ${location.pathname === "/reports/my" ? "active" : ""}`}>
                <ClipboardListIcon />
                <span>My Reports</span>
              </Link>
            </>
          )}

          {/* Manager / Admin links */}
          {hasAnyRole(["manager", "admin"]) && (
            <>
              <Link to="/portal" className={`nav-item ${location.pathname === "/portal" ? "active" : ""}`}>
                <LayoutDashboardIcon />
                <span>Portal</span>
              </Link>
              <Link to="/analytics" className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}>
                <BarChartIcon />
                <span>Analytics</span>
              </Link>
            </>
          )}
        </nav>
      </aside>

      <div className="dashboard-main-area">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button className="icon-button" onClick={() => setIsSidenavOpen(!isSidenavOpen)} aria-label="Toggle Menu">
              <MenuIcon />
            </button>
          </div>

          <div className="topbar-center">
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img src={warsLogo} alt="WARS Logo" className="topbar-logo" />
            </Link>
          </div>

          <div className="topbar-right">
            <div className="notification-container" ref={notificationRef}>
              <button 
                className="icon-button notification-btn" 
                onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsAccountMenuOpen(false); }}
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>

              {isNotificationOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header notification-header">
                    <strong>Notifications</strong>
                    {unreadCount > 0 && (
                      <button className="text-button mark-read-btn" onClick={markAllAsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="notification-list">
                    {unreadCount === 0 ? (
                      <div className="notification-empty">No new notifications</div>
                    ) : (
                      notifications.filter(n => !n.read).map(n => (
                        <div key={n.id} className="notification-item unread">
                          <div className="notification-meta">
                            <span className="notification-title">{n.title}</span>
                            <span className="notification-time">{n.time}</span>
                          </div>
                          <p className="notification-message">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="account-menu-container" ref={accountMenuRef}>
              <button className="account-btn" onClick={() => { setIsAccountMenuOpen(!isAccountMenuOpen); setIsNotificationOpen(false); }}>
                <div className="avatar-small">{initial}</div>
              </button>

              {isAccountMenuOpen && (
                <div className="account-dropdown">
                  <div className="dropdown-header">
                    <strong>{displayName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>Profile</Link>
                  <Link to="/settings" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>Settings</Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>
                    Back to landing page
                  </Link>
                  <button className="dropdown-item text-danger" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>

        {isSidenavOpen && <div className="sidenav-overlay" onClick={() => setIsSidenavOpen(false)}></div>}
      </div>
    </div>
  );
}
