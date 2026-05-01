import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers, promoteToTechnician, createTechnician, getTechnicians, updateUser } from "../api/authApi";
import type { AuthUser } from "../auth/types";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}


function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export function UserManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AuthUser[]>([]);
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<AuthUser | null>(null);
  const [viewingTech, setViewingTech] = useState<AuthUser | null>(null);

  // Expanded Tech Form (Parity with RegisterPage)
  const [newTech, setNewTech] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    username: "",
    province: "",
    district: "Bugesera",
    sector: "",
    cell: "",
    village: "",
  });

  const loadTechnicians = async () => {
    try {
      const data = await getTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error("Failed to load technicians", error);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setMessage({ text: "No user found with that email, phone or username.", type: "error" });
      } else {
        setMessage({ text: "", type: "" });
      }
    } catch (error) {
      setMessage({ text: "Search failed.", type: "error" });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      await promoteToTechnician(userId);
      setMessage({ text: "User successfully promoted to Technician!", type: "success" });
      loadTechnicians();
      setSearchResults(prev => prev.map(u => u.user_id === userId ? { ...u, role: "technician" } : u));
    } catch (error) {
      setMessage({ text: "Promotion failed.", type: "error" });
    }
  };



  const handleCreateOrUpdateTech = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTech) {
        await updateUser(editingTech.user_id, {
          full_name: `${newTech.firstName} ${newTech.middleName} ${newTech.lastName}`.replace(/\s+/g, ' ').trim(),
          email: newTech.email,
          phone: newTech.phoneNumber,
          username: newTech.username,
          zone_id: newTech.district
        });
        setMessage({ text: "Technician updated successfully!", type: "success" });
        setEditingTech(null);
      } else {
        await createTechnician({
          ...newTech,
          role: "technician",
          username: newTech.username || newTech.email.split('@')[0],
          zone_id: newTech.district
        });
        setMessage({ text: "New Technician account created successfully!", type: "success" });
      }
      
      setNewTech({
        firstName: "", middleName: "", lastName: "", email: "", password: "", username: "",
        phoneNumber: "", province: "", district: "Bugesera", sector: "", cell: "", village: ""
      });
      setIsFormOpen(false);
      loadTechnicians();
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to save technician.", type: "error" });
    }
  };



  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Staff Governance</h1>
            <p>Promote citizens and oversee your registered technicians.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingTech(null); setIsFormOpen(true); }}>
            <PlusIcon /> Onboard New Technician
          </button>
        </div>
      </div>

      {message.text && <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-24`}>{message.text}</div>}

      <div className="dashboard-main-grid">
        {/* Left Column: Promotion Tool */}
        <div className="dashboard-column">
          <div className="card h-full">
            <h3 className="dashboard-section-title">Promote Citizen</h3>
            <p className="item-subtitle mb-16">Upgrade existing accounts to technician status via search.</p>
            <form onSubmit={handleSearch} className="flex-gap mb-16">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by Email, Phone or Username..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={isSearching}><SearchIcon /></button>
            </form>

            <div className="search-results-list">
              {searchResults.map(user => (
                <div key={user.user_id} className="list-item card-subtle" style={{ padding: '12px', background: '#f8fafc', marginBottom: '8px', borderRadius: '8px' }}>
                  <div className="item-main">
                    <span className="item-title">{user.full_name}</span>
                    <span className="item-subtitle">{user.email}</span>
                  </div>
                  <div className="flex-gap">
                    {user.role === 'citizen' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handlePromote(user.user_id)}>Promote</button>
                    )}
                    {user.role === 'technician' && (
                      <span className="text-success" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Already Technician</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Staff List */}
        <div className="dashboard-column" style={{ gridColumn: 'span 2' }}>
          <div className="card h-full">
            <h3 className="dashboard-section-title">Registered Technicians</h3>
            <div className="table-responsive mt-16">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Credentials</th>
                    <th>Zone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.map(tech => (
                    <tr key={tech.user_id}>
                      <td><span className="item-title">{tech.full_name}</span></td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{tech.email}</div>
                        <div className="item-subtitle">@{tech.username}</div>
                      </td>
                      <td><span className="badge-outline">{tech.zone_id || 'Global'}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/dashboard/users/technician/${tech.user_id}`)}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {technicians.length === 0 && <p className="item-subtitle" style={{ textAlign: 'center', padding: '16px' }}>No technicians found.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding / Edit Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="flex-between mb-24">
              <h2>{editingTech ? 'Update Staff Profile' : 'Onboard New Technician'}</h2>
              <button className="btn btn-icon" onClick={() => setIsFormOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateTech} className="profile-form">
              <div className="grid-2 flex-gap">
                <div className="form-group mb-12">
                  <label>First Name</label>
                  <input type="text" className="input-field" value={newTech.firstName} onChange={e => setNewTech({...newTech, firstName: e.target.value})} required />
                </div>
                <div className="form-group mb-12">
                  <label>Last Name</label>
                  <input type="text" className="input-field" value={newTech.lastName} onChange={e => setNewTech({...newTech, lastName: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group mb-12">
                <label>Middle Name (Optional)</label>
                <input type="text" className="input-field" value={newTech.middleName} onChange={e => setNewTech({...newTech, middleName: e.target.value})} />
              </div>

              <div className="grid-2 flex-gap">
                <div className="form-group mb-12">
                  <label>Username</label>
                  <input type="text" className="input-field" placeholder="e.g. jdoe_tech" value={newTech.username} onChange={e => setNewTech({...newTech, username: e.target.value})} required />
                </div>
                <div className="form-group mb-12">
                  <label>Phone Number</label>
                  <input type="tel" className="input-field" value={newTech.phoneNumber} onChange={e => setNewTech({...newTech, phoneNumber: e.target.value})} required />
                </div>
              </div>

              <div className="form-group mb-12">
                <label>Email Address</label>
                <input type="email" className="input-field" value={newTech.email} onChange={e => setNewTech({...newTech, email: e.target.value})} required />
              </div>

              {!editingTech && (
                <div className="form-group mb-12">
                  <label>Initial Password</label>
                  <input type="password" className="input-field" value={newTech.password} onChange={e => setNewTech({...newTech, password: e.target.value})} required />
                </div>
              )}

              <hr className="divider my-16" />
              <p className="item-subtitle mb-12" style={{ fontWeight: 600 }}>Residency & Assignment</p>

              <div className="grid-2 flex-gap">
                <div className="form-group mb-12">
                  <label>Province</label>
                  <input type="text" className="input-field" value={newTech.province} onChange={e => setNewTech({...newTech, province: e.target.value})} placeholder="e.g. Kigali" />
                </div>
                <div className="form-group mb-12">
                  <label>District (Zone)</label>
                  <select className="input-field" value={newTech.district} onChange={e => setNewTech({...newTech, district: e.target.value})}>
                    <option value="Bugesera">Bugesera</option>
                    <option value="Kicukiro">Kicukiro</option>
                    <option value="Nyarugenge">Nyarugenge</option>
                    <option value="Gasabo">Gasabo</option>
                  </select>
                </div>
              </div>

              <div className="grid-2 flex-gap">
                <div className="form-group mb-12">
                  <label>Sector</label>
                  <input type="text" className="input-field" value={newTech.sector} onChange={e => setNewTech({...newTech, sector: e.target.value})} />
                </div>
                <div className="form-group mb-12">
                  <label>Cell</label>
                  <input type="text" className="input-field" value={newTech.cell} onChange={e => setNewTech({...newTech, cell: e.target.value})} />
                </div>
              </div>

              <div className="form-group mb-12">
                <label>Village</label>
                <input type="text" className="input-field" value={newTech.village} onChange={e => setNewTech({...newTech, village: e.target.value})} />
              </div>

              <div className="modal-footer mt-24">
                <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTech ? 'Update Profile' : 'Complete Onboarding'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Dossier Modal */}
      {viewingTech && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="flex-between mb-24">
              <h2>Staff Dossier</h2>
              <button className="btn btn-icon" onClick={() => setViewingTech(null)}>×</button>
            </div>

            <div className="dossier-header mb-24">
              <div className="avatar-large mb-12" style={{ margin: '0 auto' }}>
                {viewingTech.full_name.charAt(0)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{viewingTech.full_name}</h3>
                <span className="badge-outline">Technician ID: #{viewingTech.user_id}</span>
              </div>
            </div>

            <div className="dossier-sections">
              <div className="dossier-section mb-24">
                <h4 className="item-subtitle mb-12" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>Work Information</h4>
                <div className="grid-2 flex-gap">
                  <div>
                    <label className="item-subtitle" style={{ fontSize: '0.7rem' }}>Assigned Zone</label>
                    <p className="item-title">{viewingTech.zone_id || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="item-subtitle" style={{ fontSize: '0.7rem' }}>Staff Role</label>
                    <p className="item-title" style={{ textTransform: 'capitalize' }}>{viewingTech.role}</p>
                  </div>
                </div>
              </div>

              <div className="dossier-section mb-24">
                <h4 className="item-subtitle mb-12" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>Contact Details</h4>
                <div className="grid-2 flex-gap mb-12">
                  <div>
                    <label className="item-subtitle" style={{ fontSize: '0.7rem' }}>Username</label>
                    <p className="item-title">@{viewingTech.username}</p>
                  </div>
                  <div>
                    <label className="item-subtitle" style={{ fontSize: '0.7rem' }}>Phone</label>
                    <p className="item-title">{viewingTech.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="item-subtitle" style={{ fontSize: '0.7rem' }}>Email Address</label>
                  <p className="item-title">{viewingTech.email}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer mt-32">
              <button className="btn btn-primary w-full" onClick={() => setViewingTech(null)}>Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-danger-outline {
          border-color: #fee2e2;
          color: #ef4444;
          background: transparent;
        }
        .btn-danger-outline:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }
        .dossier-header {
          padding: 24px;
          background: #f8fafc;
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
}
