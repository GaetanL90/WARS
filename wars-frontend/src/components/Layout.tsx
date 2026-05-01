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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* User silhouette */}
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
      {/* Larger Gear/Settings icon in front (bottom right) */}
      <circle cx="17.5" cy="17.5" r="4.5" fill="#ffffff" stroke="none"></circle>
      <circle cx="17.5" cy="17.5" r="4.5" stroke="currentColor" strokeWidth="1.8"></circle>
      {/* Gear teeth */}
      <path d="M17.5 13v9M13 17.5h9" stroke="currentColor" strokeWidth="1.8"></path>
      <path d="M14.3 14.3l6.4 6.4M20.7 14.3l-6.4 6.4" stroke="currentColor" strokeWidth="1.8"></path>
      <circle cx="17.5" cy="17.5" r="1.5" fill="#ffffff" stroke="currentColor" strokeWidth="1"></circle>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
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
  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.full_name || user?.email?.split('@')[0] || "User";

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
              <Link to="/dashboard/citizen" className={`nav-item ${location.pathname === "/dashboard/citizen" ? "active" : ""}`}>
                <LayoutDashboardIcon />
                <span>My Dashboard</span>
              </Link>
              <Link to="/dashboard/reports/new" className={`nav-item ${location.pathname === "/dashboard/reports/new" ? "active" : ""}`}>
                <FilePlusIcon />
                <span>Submit Report</span>
              </Link>
              <Link to="/dashboard/reports/my" className={`nav-item ${location.pathname === "/dashboard/reports/my" ? "active" : ""}`}>
                <ClipboardListIcon />
                <span>My Reports</span>
              </Link>
            </>
          )}

          {/* Technician links */}
          {hasAnyRole(["technician"]) && (
            <>
              <Link to="/dashboard/technician" className={`nav-item ${location.pathname === "/dashboard/technician" ? "active" : ""}`}>
                <LayoutDashboardIcon />
                <span>Tech Dashboard</span>
              </Link>
              <Link to="/dashboard/reports/assigned" className={`nav-item ${location.pathname === "/dashboard/reports/assigned" ? "active" : ""}`}>
                <WrenchIcon />
                <span>Assigned Case</span>
              </Link>
              <Link to="/dashboard/reports/new" className={`nav-item ${location.pathname === "/dashboard/reports/new" ? "active" : ""}`}>
                <FilePlusIcon />
                <span>Submit Report</span>
              </Link>
              <Link to="/dashboard/reports/my" className={`nav-item ${location.pathname === "/dashboard/reports/my" ? "active" : ""}`}>
                <ClipboardListIcon />
                <span>Submitted Reports</span>
              </Link>
              <Link to="/dashboard/reports/history" className={`nav-item ${location.pathname === "/dashboard/reports/history" ? "active" : ""}`}>
                <ClipboardListIcon />
                <span>Case Reports</span>
              </Link>
            </>
          )}

          {/* Manager / Admin links */}
          {hasAnyRole(["manager", "admin"]) && (
            <>
              <Link to="/dashboard/manager" className={`nav-item ${location.pathname === "/dashboard/manager" ? "active" : ""}`}>
                <LayoutDashboardIcon />
                <span>Manager Dashboard</span>
              </Link>
              <Link to="/dashboard/users" className={`nav-item ${location.pathname === "/dashboard/users" ? "active" : ""}`}>
                <UsersIcon />
                <span>Staff Management</span>
              </Link>
              <Link to="/dashboard/infrastructure" className={`nav-item ${location.pathname === "/dashboard/infrastructure" ? "active" : ""}`}>
                <ServerIcon />
                <span>Infrastructure Hub</span>
              </Link>
              <Link to="/dashboard/infrastructure/zones" className={`nav-item ${location.pathname === "/dashboard/infrastructure/zones" ? "active" : ""}`} style={{ paddingLeft: '40px', fontSize: '0.9rem' }}>
                <ClipboardListIcon />
                <span>Zone Directory</span>
              </Link>
              <Link to="/dashboard/infrastructure/pipes" className={`nav-item ${location.pathname === "/dashboard/infrastructure/pipes" ? "active" : ""}`} style={{ paddingLeft: '40px', fontSize: '0.9rem' }}>
                <WrenchIcon />
                <span>Pipe Network</span>
              </Link>
              <Link to="/dashboard/incidents" className={`nav-item ${location.pathname === "/dashboard/incidents" ? "active" : ""}`}>
                <AlertCircleIcon />
                <span>Incident Management</span>
              </Link>
              <Link to="/dashboard/analytics" className={`nav-item ${location.pathname === "/dashboard/analytics" ? "active" : ""}`}>
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
              <button className="account-btn" onClick={() => { setIsAccountMenuOpen(!isAccountMenuOpen); setIsNotificationOpen(false); }} aria-label="Account Menu">
                <div className="account-icon-wrapper">
                  <UserIcon />
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="account-dropdown">
                  <div className="dropdown-header">
                    <strong>{displayName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard/profile" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>Profile</Link>
                  <Link to="/dashboard/settings" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>Settings</Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/" className="dropdown-item text-link" onClick={() => setIsAccountMenuOpen(false)}>
                    Home
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
