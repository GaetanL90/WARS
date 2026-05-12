import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser, getSystemLogs, SystemLog } from "../api/authApi";
import type { AuthUser } from "../auth/types";

// --- Icons ---

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

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}


function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a3 3 0 0 1 0 6"></path>
      <path d="M10 8h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4l-4 4V4l4 4z"></path>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"></polyline>
      <rect x="1" y="3" width="22" height="5"></rect>
      <line x1="10" y1="12" x2="14" y2="12"></line>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}


function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6"></path>
      <path d="M1 20v-6h6"></path>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  );
}

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "announcements" | "settings">("users");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [settings, setSettings] = useState({
    registration: true,
    maintenance: false,
    telemetry: true,
    alerts: true
  });
  const [disabledUsers, setDisabledUsers] = useState<Set<number>>(new Set());
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: 1, title: 'Scheduled Maintenance', content: 'System will be offline for 2 hours on Sunday.', target: 'all', timestamp: new Date().toISOString(), status: 'active' },
    { id: 2, title: 'New Technician Protocol', content: 'Please review the updated safety manual.', target: 'technician', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'archived' }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target: 'all' });
  
  // Search, Sort, Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AuthUser; direction: 'asc' | 'desc' } | null>(null);

  // Log Search, Sort, Pagination State
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("all");
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logSortConfig, setLogSortConfig] = useState<{ key: keyof SystemLog; direction: 'asc' | 'desc' } | null>(null);

  // Announcement Search, Sort, Pagination State
  const [broadcastSearchTerm, setBroadcastSearchTerm] = useState("");
  const [broadcastStatusFilter, setBroadcastStatusFilter] = useState("all");
  const [broadcastCurrentPage, setBroadcastCurrentPage] = useState(1);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  // Edit State

  const loadData = async () => {
    try {
      const [allUsers, allLogs] = await Promise.all([getAllUsers(), getSystemLogs()]);
      setUsers(allUsers);
      setLogs(allLogs);
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setMessage({ text: "User successfully deleted.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to delete user.", type: "error" });
    }
  };

  const handleSort = (key: keyof AuthUser) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if ((a as any)[key] < (b as any)[key]) return direction === 'asc' ? -1 : 1;
    if ((a as any)[key] > (b as any)[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

    const userTotalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const paginatedUsers = sortedUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  // Log Processing Logic
  const handleLogSort = (key: keyof SystemLog) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (logSortConfig && logSortConfig.key === key && logSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setLogSortConfig({ key, direction });
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.details.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                         l.user.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                         l.action.toLowerCase().includes(logSearchTerm.toLowerCase());
    const matchesAction = logActionFilter === 'all' || l.action.toLowerCase().includes(logActionFilter.toLowerCase());
    return matchesSearch && matchesAction;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (!logSortConfig) return 0;
    const { key, direction } = logSortConfig;
    if ((a as any)[key] < (b as any)[key]) return direction === 'asc' ? -1 : 1;
    if ((a as any)[key] > (b as any)[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const logTotalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice(
    (logCurrentPage - 1) * itemsPerPage,
    logCurrentPage * itemsPerPage
  );

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(broadcastSearchTerm.toLowerCase()) ||
                         a.content.toLowerCase().includes(broadcastSearchTerm.toLowerCase());
    const matchesStatus = broadcastStatusFilter === 'all' || a.status === broadcastStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(
    (broadcastCurrentPage - 1) * itemsPerPage,
    broadcastCurrentPage * itemsPerPage
  );

  const broadcastTotalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const handleUpdateRole = async (userId: number, newRole: AuthUser["role"]) => {
    try {
      await updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      setMessage({ text: `User role updated to ${newRole}.`, type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to update role.", type: "error" });
    }
  };
  const handleToggleStatus = (userId: number) => {
    setDisabledUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    const isNowDisabled = !disabledUsers.has(userId);
    setMessage({ 
      text: `User account ${isNowDisabled ? 'suspended' : 'reactivated'} successfully.`, 
      type: isNowDisabled ? "warning" : "success" 
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Administration</h1>
        <p>Manage all users, monitor system health, and audit administrative actions.</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-24 flex-between`}>
          <span>{message.text}</span>
          <button className="btn-icon" style={{ fontSize: '1rem' }} onClick={() => setMessage({ text: "", type: "" })}>×</button>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        <div className="admin-command-nav">
          <div className="segmented-control">
            {[
              { id: 'users', label: 'USER DIRECTORY', shortLabel: 'Users', icon: <UsersIcon /> },
              { id: 'logs', label: 'AUDIT MATRIX', shortLabel: 'Logs', icon: <ActivityIcon /> },
              { id: 'announcements', label: 'BROADCAST HUB', shortLabel: 'Broadcast', icon: <MegaphoneIcon /> },
              { id: 'settings', label: 'SYSTEM CONFIG', shortLabel: 'Settings', icon: <SettingsIcon /> },
            ].map(tab => (
              <button 
                key={tab.id}
                className={`seg-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.icon}
                <span className="seg-label-full">{tab.label}</span>
                <span className="seg-label-short">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tabs-content" style={{ padding: '24px' }}>
          {activeTab === 'users' && (
            <>
              {/* Search and Controls */}
              <div className="flex-between mb-32 flex-wrap gap-16 align-center">
                <div className="flex gap-16 flex-wrap align-center">
                  <div className="search-box-v2" style={{width: '320px'}}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#64748b" strokeWidth="2" fill="none">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search by name, email, or username..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                  <select 
                    className="input-field" 
                    style={{width: '160px', height: '46px', background: '#ffffff'}}
                    value={roleFilter}
                    onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">All Roles</option>
                    <option value="citizen">Citizens</option>
                    <option value="technician">Technicians</option>
                    <option value="manager">Managers</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>

                <div className="flex-center gap-16">
                  <div className="item-subtitle" style={{fontSize: '0.85rem', fontWeight: 600}}>
                    {filteredUsers.length} <span style={{fontWeight: 400}}>RECORDS FOUND</span>
                  </div>
                  <button className="btn-icon-sq" onClick={loadData} title="Refresh Directory" style={{background: '#ffffff', border: '1.5px solid #e2e8f0'}}>
                    <RefreshIcon />
                  </button>
                </div>
              </div>

              {/* Desktop View */}
              <div className="table-responsive hide-mobile-v2">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('user_id')} style={{cursor: 'pointer'}}>
                        User ID {sortConfig?.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('full_name')} style={{cursor: 'pointer'}}>
                        Full Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Email / Username</th>
                      <th style={{width: '120px'}} onClick={() => handleSort('role')}>
                        Role {sortConfig?.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(user => (
                      <tr key={user.user_id}>
                        <td><span className="id-badge">#{user.user_id}</span></td>
                        <td><span className="item-title">{user.full_name}</span></td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
                          <div className="item-subtitle">@{user.username}</div>
                        </td>
                        <td>
                          <select 
                            className="input-field" 
                            style={{ padding: '4px 8px', height: 'auto', fontSize: '0.8rem', width: '110px' }}
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.user_id, e.target.value as any)}
                          >
                            <option value="citizen">Citizen</option>
                            <option value="technician">Technician</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-badge ${disabledUsers.has(user.user_id) ? 'neg' : 'pos'}`} style={{fontSize: '0.7rem'}}>
                            {disabledUsers.has(user.user_id) ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <div className="flex-end gap-12">
                            <button 
                              className={`btn-icon-sq ${disabledUsers.has(user.user_id) ? 'btn-success-alt' : 'btn-warning-alt'}`} 
                              title={disabledUsers.has(user.user_id) ? 'Reactivate Account' : 'Suspend Account'}
                              onClick={() => handleToggleStatus(user.user_id)}
                            >
                              {disabledUsers.has(user.user_id) ? <PlayIcon /> : <PauseIcon />}
                            </button>
                            <button 
                              className="btn-icon-sq btn-danger-alt" 
                              title="Delete User Permanently"
                              onClick={() => handleDelete(user.user_id)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-card-list show-mobile-v2">
                {paginatedUsers.map(user => (
                  <div key={user.user_id} className="glass-card mb-16 p-24">
                    <div className="flex-between mb-16">
                      <div className="flex-column">
                        <span className="id-badge mb-4">#{user.user_id}</span>
                        <h3 className="item-title" style={{fontSize: '1rem'}}>{user.full_name}</h3>
                        <span className="item-subtitle">@{user.username}</span>
                      </div>
                      <span className={`status-badge ${disabledUsers.has(user.user_id) ? 'neg' : 'pos'}`}>
                        {disabledUsers.has(user.user_id) ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </div>
                    
                    <div className="flex-column mb-16">
                      <label className="item-subtitle" style={{fontSize: '0.7rem', marginBottom: '4px'}}>Assigned Role</label>
                      <select 
                        className="input-field w-full" 
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.user_id, e.target.value as any)}
                      >
                        <option value="citizen">Citizen</option>
                        <option value="technician">Technician</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex-between pt-16" style={{borderTop: '1px solid #f1f5f9'}}>
                      <span className="item-subtitle">{user.email}</span>
                      <div className="flex-gap">
                        <button 
                          className={`btn-icon-sq ${disabledUsers.has(user.user_id) ? 'btn-success-alt' : 'btn-warning-alt'}`} 
                          onClick={() => handleToggleStatus(user.user_id)}
                        >
                          {disabledUsers.has(user.user_id) ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button className="btn-icon-sq btn-danger-alt" onClick={() => handleDelete(user.user_id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {userTotalPages > 1 && (
                <div className="pagination-bar-alt mt-40">
                  <button 
                    className="nav-btn-alt" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft />
                  </button>
                  
                  <div className="page-numbers-alt">
                    {Array.from({ length: userTotalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-num-alt ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="nav-btn-alt" 
                    disabled={currentPage === userTotalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
              
              {paginatedUsers.length === 0 && <p className="text-center py-48 item-subtitle">No matching users found.</p>}
            </>
          )}


          {activeTab === 'logs' && (
            <>
              {/* Log Search and Controls */}
              <div className="flex-between mb-32 flex-wrap gap-16 align-center">
                <div className="flex gap-16 flex-wrap align-center">
                  <div className="search-box-v2" style={{width: '320px'}}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#64748b" strokeWidth="2" fill="none">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search by actor or description..." 
                      className="search-input"
                      value={logSearchTerm}
                      onChange={(e) => { setLogSearchTerm(e.target.value); setLogCurrentPage(1); }}
                    />
                  </div>
                  <select 
                    className="input-field" 
                    style={{width: '160px', height: '46px', background: '#ffffff'}}
                    value={logActionFilter}
                    onChange={e => { setLogActionFilter(e.target.value); setLogCurrentPage(1); }}
                  >
                    <option value="all">All Actions</option>
                    <option value="create">Creations</option>
                    <option value="update">Updates</option>
                    <option value="delete">Deletions</option>
                    <option value="suspend">Suspensions</option>
                  </select>
                </div>

                <div className="flex-center gap-16">
                  <div className="item-subtitle" style={{fontSize: '0.85rem', fontWeight: 600}}>
                    {filteredLogs.length} <span style={{fontWeight: 400}}>ENTRIES FOUND</span>
                  </div>
                  <button className="btn-icon-sq" onClick={loadData} title="Refresh Audit Trail" style={{background: '#ffffff', border: '1.5px solid #e2e8f0'}}>
                    <RefreshIcon />
                  </button>
                </div>
              </div>

              {/* Desktop Log Matrix */}
              <div className="table-responsive hide-mobile-v2">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleLogSort('id')} style={{cursor: 'pointer'}}>
                        Event ID {logSortConfig?.key === 'id' && (logSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleLogSort('action')} style={{cursor: 'pointer'}}>
                        Action {logSortConfig?.key === 'action' && (logSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Description</th>
                      <th onClick={() => handleLogSort('user')} style={{cursor: 'pointer'}}>
                        Admin / Actor {logSortConfig?.key === 'user' && (logSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleLogSort('timestamp')} style={{cursor: 'pointer'}}>
                        Timeline {logSortConfig?.key === 'timestamp' && (logSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{width: '120px', textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map(log => (
                      <tr key={log.id}>
                        <td><span className="id-badge">#LOG-{log.id}</span></td>
                        <td>
                          <span className={`status-badge ${log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('suspend') ? 'neg' : 'pos'}`} style={{fontSize: '0.65rem', padding: '4px 8px'}}>
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td><span className="item-title" style={{fontSize: '0.85rem'}}>{log.details}</span></td>
                        <td>
                          <div className="flex-center gap-8">
                            <div className="user-avatar-mini" style={{background: '#6366f120', color: '#6366f1', padding: '4px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700}}>
                              {log.user.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="item-subtitle" style={{color: '#0f172a', fontWeight: 600}}>{log.user}</span>
                          </div>
                        </td>
                        <td><span className="item-subtitle">{new Date(log.timestamp).toLocaleString()}</span></td>
                        <td style={{textAlign: 'right'}}>
                          <div className="flex-end gap-12">
                            <button 
                              className="btn-icon-sq btn-danger-alt" 
                              title="Dismiss Audit Entry"
                              onClick={() => {
                                setLogs(logs.filter(l => l.id !== log.id));
                                setMessage({ text: "Audit entry dismissed.", type: "success" });
                              }}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Log Cards */}
              <div className="mobile-card-list show-mobile-v2">
                {paginatedLogs.map(log => (
                  <div key={log.id} className="glass-card mb-16 p-24">
                    <div className="flex-between mb-16">
                      <span className="id-badge">#LOG-{log.id}</span>
                      <span className={`status-badge ${log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('suspend') ? 'neg' : 'pos'}`}>
                        {log.action.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="item-title mb-16" style={{fontSize: '0.95rem'}}>{log.details}</h3>
                    <div className="flex-between pt-16" style={{borderTop: '1px solid #f1f5f9'}}>
                      <div className="flex-center gap-8">
                        <div className="user-avatar-mini" style={{background: '#6366f120', color: '#6366f1', width: '24px', height: '24px', fontSize: '0.6rem'}}>
                          {log.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="item-subtitle" style={{fontWeight: 600}}>{log.user}</span>
                      </div>
                      <span className="item-subtitle" style={{fontSize: '0.7rem'}}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Log Pagination */}
              {logTotalPages > 1 && (
                <div className="pagination-bar-alt mt-40">
                  <button 
                    className="nav-btn-alt" 
                    disabled={logCurrentPage === 1}
                    onClick={() => setLogCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft />
                  </button>
                  
                  <div className="page-numbers-alt">
                    {Array.from({ length: logTotalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-num-alt ${logCurrentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setLogCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="nav-btn-alt" 
                    disabled={logCurrentPage === logTotalPages}
                    onClick={() => setLogCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
              
              {paginatedLogs.length === 0 && <p className="text-center py-48 item-subtitle">No matching audit entries found.</p>}
            </>
          )}

          {activeTab === 'settings' && (
            <div className="settings-container">
              <div className="settings-header-alt mb-32">
                <h3 style={{fontSize: '1.2rem', margin: 0}}>System-Wide Configuration</h3>
                <p className="item-subtitle">Manage global operational flags and security protocols.</p>
              </div>
              
              <div className="settings-grid-v2">
                {[
                  { id: 'registration', label: 'Public User Registration', desc: 'Enable citizens to create new WARS accounts.', key: 'registration' },
                  { id: 'maintenance', label: 'System Maintenance Mode', desc: 'Suspend all public-facing services for updates.', key: 'maintenance' },
                  { id: 'telemetry', label: 'Detailed Telemetry Logging', desc: 'Increase sampling frequency for all active sensors.', key: 'telemetry' },
                  { id: 'alerts', label: 'Critical Broadcast Alerts', desc: 'Enable system-wide push notifications for emergencies.', key: 'alerts' }
                ].map(opt => (
                  <div key={opt.id} className="setting-card-alt p-24">
                    <div className="flex-between">
                      <div className="flex-column" style={{maxWidth: '70%'}}>
                        <h4 style={{margin: '0 0 4px 0', fontSize: '0.95rem'}}>{opt.label}</h4>
                        <p className="item-subtitle" style={{fontSize: '0.8rem'}}>{opt.desc}</p>
                      </div>
                      <label className="ios-toggle">
                        <input 
                          type="checkbox" 
                          checked={(settings as any)[opt.key]} 
                          onChange={e => setSettings({...settings, [opt.key]: e.target.checked})}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-32 pt-24" style={{borderTop: '1px solid #f1f5f9'}}>
                <button 
                  className="btn btn-primary" 
                  style={{minWidth: '200px'}} 
                  onClick={async () => {
                    setIsSavingSettings(true);
                    await new Promise(r => setTimeout(r, 1200));
                    setIsSavingSettings(false);
                    setMessage({ text: "Global settings synchronized successfully.", type: "success" });
                  }}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? (
                    <span className="flex-center gap-8">
                      <div className="spinner-small" style={{width: '14px', height: '14px'}}></div> Saving...
                    </span>
                  ) : 'Sync Global Settings'}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'announcements' && (
            <div className="announcements-module p-32">
              {/* Header */}
              <div className="mb-40">
                <h2 style={{margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a'}}>Broadcast Hub</h2>
                <p className="item-subtitle" style={{marginTop: '4px', fontSize: '1rem'}}>Dispatch real-time alerts and operational updates across the network.</p>
              </div>

              {/* Dispatch Form */}
              <div className="glass-card-no-border mb-64">
                <div className="flex-column gap-32">
                  <div className="grid-2 flex-gap">
                    <div className="flex-column gap-12">
                      <label className="item-subtitle" style={{fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px'}}>ANNOUNCEMENT TITLE</label>
                      <input 
                        type="text" 
                        className="input-field-executive" 
                        placeholder="e.g. Infrastructure Maintenance Schedule"
                        value={newAnnouncement.title}
                        onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      />
                    </div>
                    <div className="flex-column gap-12">
                      <label className="item-subtitle" style={{fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px'}}>TARGET AUDIENCE</label>
                      <select 
                        className="input-field-executive"
                        value={newAnnouncement.target}
                        onChange={e => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                      >
                        <option value="all">Global (All Users)</option>
                        <option value="citizen">Citizens Only</option>
                        <option value="technician">Technical Staff Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-column gap-12">
                    <label className="item-subtitle" style={{fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px'}}>MESSAGE CONTENT</label>
                    <textarea 
                      className="input-field-executive" 
                      rows={5} 
                      placeholder="Compose your detailed system announcement here..."
                      value={newAnnouncement.content}
                      onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      style={{resize: 'none'}}
                    ></textarea>
                  </div>

                  <div className="flex-end">
                    <button 
                      className="btn-executive-dispatch" 
                      onClick={async () => {
                        if (!newAnnouncement.title || !newAnnouncement.content) return;
                        setIsBroadcasting(true);
                        await new Promise(r => setTimeout(r, 1200));
                        const created = {
                          ...newAnnouncement,
                          id: Date.now(),
                          timestamp: new Date().toISOString(),
                          status: 'active'
                        };
                        setAnnouncements([created, ...announcements]);
                        setNewAnnouncement({ title: '', content: '', target: 'all' });
                        setIsBroadcasting(false);
                        setMessage({ text: "System announcement dispatched successfully.", type: "success" });
                      }}
                      disabled={isBroadcasting}
                    >
                      {isBroadcasting ? 'DISPATCHING...' : 'DISPATCH ANNOUNCEMENT'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Standardized Search & Controls */}
              <div className="flex-between mb-32 flex-wrap gap-16 align-center">
                <div className="flex gap-16 flex-wrap align-center">
                  <div className="search-box-v2" style={{width: '320px'}}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#64748b" strokeWidth="2" fill="none">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search history by title or content..." 
                      className="search-input"
                      value={broadcastSearchTerm}
                      onChange={(e) => { setBroadcastSearchTerm(e.target.value); setBroadcastCurrentPage(1); }}
                    />
                  </div>
                  <select 
                    className="input-field" 
                    style={{width: '160px', height: '46px', background: '#ffffff'}}
                    value={broadcastStatusFilter}
                    onChange={e => { setBroadcastStatusFilter(e.target.value); setBroadcastCurrentPage(1); }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex-center gap-16">
                  <div className="item-subtitle" style={{fontSize: '0.85rem', fontWeight: 600}}>
                    {filteredAnnouncements.length} <span style={{fontWeight: 400}}>HISTORY ENTRIES</span>
                  </div>
                  <button className="btn-icon-sq" onClick={loadData} title="Refresh History" style={{background: '#ffffff', border: '1.5px solid #e2e8f0'}}>
                    <RefreshIcon />
                  </button>
                </div>
              </div>
              
              <div className="table-responsive hide-mobile-v2">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th style={{width: '120px'}}>Event ID</th>
                      <th style={{width: '120px'}}>Status</th>
                      <th>Details</th>
                      <th style={{width: '160px'}}>Audience</th>
                      <th style={{width: '180px'}}>Timeline</th>
                      <th style={{width: '120px', textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAnnouncements.map(ann => (
                      <tr key={ann.id}>
                        <td><span className="id-badge">#ANN-{ann.id}</span></td>
                        <td>
                          <span className={`status-badge ${ann.status === 'active' ? 'pos' : 'neg'}`} style={{fontSize: '0.65rem', padding: '4px 8px'}}>
                            {ann.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="flex-column gap-4">
                            <span className="item-title" style={{fontSize: '0.9rem', fontWeight: 700}}>{ann.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="pill-badge" style={{fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '4px'}}>
                            {ann.target.toUpperCase()}
                          </span>
                        </td>
                        <td><span className="item-subtitle" style={{fontSize: '0.8rem'}}>{new Date(ann.timestamp).toLocaleString()}</span></td>
                        <td style={{textAlign: 'right'}}>
                          <div className="flex-end gap-12">
                            <button 
                              className="btn-icon-sq" 
                              style={{color: '#6366f1', background: '#eef2ff'}}
                              title="View Full Content"
                              onClick={() => setSelectedAnnouncement(ann)}
                            >
                              <EyeIcon />
                            </button>
                            <button 
                              className={`btn-icon-sq ${ann.status === 'active' ? 'btn-warning-alt' : 'btn-success-alt'}`} 
                              title={ann.status === 'active' ? "Archive Announcement" : "Activate Announcement"}
                              onClick={() => {
                                setAnnouncements(announcements.map(a => 
                                  a.id === ann.id ? { ...a, status: a.status === 'active' ? 'archived' : 'active' } : a
                                ));
                                setMessage({ 
                                  text: `Announcement ${ann.status === 'active' ? 'archived' : 'activated'} successfully.`, 
                                  type: "success" 
                                });
                              }}
                            >
                              {ann.status === 'active' ? <ArchiveIcon /> : <PlayIcon />}
                            </button>
                            <button 
                              className="btn-icon-sq btn-danger-alt" 
                              onClick={() => {
                                setAnnouncements(announcements.filter(a => a.id !== ann.id));
                                setMessage({ text: "Announcement deleted.", type: "success" });
                              }}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-card-list show-mobile-v2">
                {paginatedAnnouncements.map(ann => (
                  <div key={ann.id} className="glass-card mb-16 p-24">
                    <div className="flex-between mb-16">
                      <div className="flex-column">
                        <span className="id-badge mb-4">#ANN-{ann.id}</span>
                        <h3 className="item-title" style={{fontSize: '1rem', margin: 0}}>{ann.title}</h3>
                      </div>
                      <span className={`status-badge ${ann.status === 'active' ? 'pos' : 'neg'}`}>
                        {ann.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-between pt-16" style={{borderTop: '1px solid #f1f5f9'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <span className="item-subtitle" style={{fontSize: '0.7rem'}}>Audience</span>
                        <span style={{fontWeight: 700, fontSize: '0.8rem', color: '#0f172a'}}>
                          {ann.target === 'all' ? 'All Users' : ann.target.charAt(0).toUpperCase() + ann.target.slice(1) + 's'}
                        </span>
                      </div>
                      <div className="flex-gap">
                        <button
                          className="btn-icon-sq"
                          style={{color: '#6366f1', background: '#eef2ff'}}
                          title="View Full Content"
                          onClick={() => setSelectedAnnouncement(ann)}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          className={`btn-icon-sq ${ann.status === 'active' ? 'btn-warning-alt' : 'btn-success-alt'}`}
                          title={ann.status === 'active' ? 'Archive' : 'Activate'}
                          onClick={() => {
                            setAnnouncements(announcements.map(a =>
                              a.id === ann.id ? { ...a, status: a.status === 'active' ? 'archived' : 'active' } : a
                            ));
                            setMessage({ text: `Announcement ${ann.status === 'active' ? 'archived' : 'activated'}.`, type: 'success' });
                          }}
                        >
                          {ann.status === 'active' ? <ArchiveIcon /> : <PlayIcon />}
                        </button>
                        <button
                          className="btn-icon-sq btn-danger-alt"
                          onClick={() => {
                            setAnnouncements(announcements.filter(a => a.id !== ann.id));
                            setMessage({ text: 'Announcement deleted.', type: 'success' });
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {broadcastTotalPages > 1 && (
                <div className="pagination-bar-alt mt-40">
                  <button 
                    className="nav-btn-alt" 
                    disabled={broadcastCurrentPage === 1}
                    onClick={() => setBroadcastCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft />
                  </button>
                  
                  <div className="page-numbers-alt">
                    {Array.from({ length: broadcastTotalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-num-alt ${broadcastCurrentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setBroadcastCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="nav-btn-alt" 
                    disabled={broadcastCurrentPage === broadcastTotalPages}
                    onClick={() => setBroadcastCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22)',
            maxWidth: '580px',
            width: '92%',
            overflow: 'hidden',
            animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>

            {/* Top accent bar */}
            <div style={{height: '4px', background: 'linear-gradient(90deg, #6366f1, #818cf8)'}}></div>

            {/* Header */}
            <div style={{padding: '32px 36px 24px', borderBottom: '1px solid #f1f5f9'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                    <span className={`status-badge ${selectedAnnouncement.status === 'active' ? 'pos' : 'neg'}`} style={{fontSize: '0.65rem', padding: '3px 10px'}}>
                      {selectedAnnouncement.status.toUpperCase()}
                    </span>
                    <span style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600}}>
                      {selectedAnnouncement.target === 'all' ? 'All Users' : selectedAnnouncement.target.charAt(0).toUpperCase() + selectedAnnouncement.target.slice(1) + 's Only'}
                    </span>
                    <span style={{color: '#e2e8f0'}}>·</span>
                    <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>
                      {new Date(selectedAnnouncement.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3}}>
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.2rem', flexShrink: 0, marginLeft: '16px'}}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{padding: '28px 36px 32px'}}>
              <p style={{fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', marginBottom: '12px'}}>MESSAGE</p>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '3px solid #6366f1',
                borderRadius: '0 10px 10px 0',
                padding: '20px 24px',
                lineHeight: 1.75,
                color: '#334155',
                fontSize: '0.95rem',
                minHeight: '100px'
              }}>
                {selectedAnnouncement.content}
              </div>
            </div>

            {/* Footer */}
            <div style={{padding: '20px 36px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f8fafc'}}>
              <button
                style={{padding: '10px 24px', fontWeight: 700, borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem'}}
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </button>
              <button
                style={{padding: '10px 24px', fontWeight: 700, borderRadius: '8px', border: 'none', background: '#6366f1', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem'}}
                onClick={() => setSelectedAnnouncement(null)}
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .settings-grid-v2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .settings-grid-v2 { grid-template-columns: 1fr; }
        }
        .setting-card-alt {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          transition: all 0.2s;
        }
        .setting-card-alt:hover {
          border-color: #cbd5e1;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        /* iOS Toggle Styling */
        .ios-toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }
        .ios-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #e2e8f0;
          transition: .4s;
          border-radius: 34px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input:checked + .toggle-slider {
          background-color: #10b981;
        }
        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content-premium {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .meta-card-alt {
          background: #f8fafc;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          flex: 1;
          min-width: 140px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .status-badge.pos { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-badge.neg { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        
        .user-avatar-mini {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon-sq {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          color: #94a3b8; /* Neutral ghost color */
        }
        
        .btn-success-alt:hover { color: #059669; background: #dcfce7; transform: scale(1.1); }
        .btn-warning-alt:hover { color: #d97706; background: #fef3c7; transform: scale(1.1); }
        .btn-danger-alt:hover { color: #dc2626; background: #fee2e2; transform: scale(1.1); }

        .text-warning { color: #d97706 !important; }
        .text-success { color: #059669 !important; }
        .text-danger { color: #dc2626 !important; }

        .flex-end {
          display: flex !important;
          flex-direction: row !important;
          justify-content: flex-end;
          align-items: center;
        }

        .flex-gap {
          display: flex;
          flex-direction: row !important;
          align-items: center;
          gap: 8px;
        }

        .search-box-v2 {
          position: relative;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 16px;
          width: 100%;
          max-width: 400px;
          transition: all 0.2s;
        }
        .search-box-v2:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .search-input {
          border: none;
          background: transparent;
          padding: 12px 12px;
          width: 100%;
          font-size: 0.9rem;
          outline: none;
        }

        .page-num-alt {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          color: #64748b;
        }
        .page-num-alt.active {
          background: #6366f1;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .page-num-alt:hover:not(.active) {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pagination-bar-alt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 50px;
          width: fit-content;
          margin: 40px auto 0;
          border: 1px solid #e2e8f0;
        }
        .nav-btn-alt {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .nav-btn-alt:hover:not(:disabled) {
          background: #6366f1;
          color: #ffffff;
        }
        .nav-btn-alt:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-numbers-alt {
          display: flex;
          gap: 4px;
        }

        .admin-command-nav {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 24px;
        }

        .segmented-control {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .segmented-control::-webkit-scrollbar { display: none; }

        .seg-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          font-weight: 800;
          font-size: 0.7rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .seg-item:hover { color: #0f172a; background: #e2e8f0; }
        .seg-item.active {
          background: #ffffff;
          color: #6366f1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .seg-item svg { width: 14px; height: 14px; flex-shrink: 0; }
        .seg-label-short { display: none; }
        .seg-label-full { display: inline; }

        @media (max-width: 700px) {
          .admin-command-nav { padding: 12px 16px; }
          .segmented-control {
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: #f1f5f9;
            gap: 4px;
            padding: 4px;
          }
          .seg-item {
            padding: 10px 12px;
            justify-content: center;
            font-size: 0.65rem;
          }
          .seg-label-full { display: none; }
          .seg-label-short { display: inline; }
        }

        @media (max-width: 400px) {
          .seg-item { gap: 6px; padding: 10px 8px; }
          .seg-label-short { font-size: 0.6rem; }
        }

        /* Command Matrix Table */
        .reports-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.85rem;
        }
        .reports-table thead th {
          text-align: left;
          padding: 12px 16px;
          background: #0f172a;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-right: 1px solid #1e293b;
        }
        .reports-table thead th:first-child { border-radius: 8px 0 0 0; }
        .reports-table thead th:last-child { border-radius: 0 8px 0 0; border-right: none; }

        .reports-table tbody tr {
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }
        .reports-table tbody tr:hover { background: #f8fafc; }
        .reports-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          border-right: 1px solid #f1f5f9;
        }
        .reports-table td:last-child { border-right: none; }

        .item-subtitle-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          color: #6366f1;
          background: #6366f108;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .executive-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 12px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          min-width: 140px;
        }
        .executive-stat .lbl { font-size: 0.65rem; font-weight: 800; color: #64748b; letter-spacing: 1px; }
        .executive-stat .val { font-size: 1.5rem; font-weight: 900; color: #0f172a; }

        .input-field-executive {
          width: 100%;
          padding: 18px;
          background: #ffffff;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          font-size: 1rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }
        .input-field-executive:focus { border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08); }

        .btn-executive-dispatch {
          padding: 18px 48px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
        }
        .btn-executive-dispatch:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99, 102, 241, 0.35); }
        .btn-executive-dispatch:disabled { opacity: 0.6; cursor: not-allowed; }

        .pill-badge-executive {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 6px 14px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 6px;
        }

        .status-dot-v4 { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot-v4.active { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
        .status-dot-v4.archived { background: #94a3b8; }

        @media (max-width: 900px) {
          .audience-grid { grid-template-columns: 1fr; }
          .stats-row-v2 { grid-template-columns: 1fr; }
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .tab-btn span { position: relative; z-index: 1; }
        .tab-btn.active {
          color: #6366f1;
          font-weight: 700;
        }
        .tab-btn::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 3px;
          background: #6366f1;
          border-radius: 3px 3px 0 0;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .tab-btn.active::after {
          transform: scaleX(1);
          left: 0;
          right: 0;
        }
        .tab-btn:hover:not(.active) {
          color: #0f172a;
          background: rgba(99, 102, 241, 0.03);
        }

        .show-mobile-v2 { display: none; }
        .hide-mobile-v2 { display: block; }

        @media (max-width: 768px) {
          .show-mobile-v2 { display: block; }
          .hide-mobile-v2 { display: none; }
          
          .page-header {
            padding: 32px 24px !important;
            text-align: left;
          }
          .tabs-header {
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none;
            padding: 0 16px;
          }
          .tabs-header::-webkit-scrollbar { display: none; }
          .tab-btn {
            padding: 16px 20px !important;
            font-size: 0.9rem;
          }
          .tabs-content {
            padding: 20px 16px !important;
          }
          .settings-grid-v2 {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .mobile-card-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
