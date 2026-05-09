import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data - in production, fetch by ID from API
const MOCK_TECHNICIANS = [
  { user_id: "3", full_name: "Jean-Pierre Habimana", username: "jp_habimana", email: "jp.habimana@wars.rw", phone: "+250788001001", role: "technician", zone_id: "Bugesera", province: "Eastern Province", district: "Bugesera", sector: "Nyamata", cell: "Biryogo", village: "Akabahizi", expertise: "IoT & Sensors" },
  { user_id: "4", full_name: "Yvonne Mukamana", username: "y_mukamana", email: "y.mukamana@wars.rw", phone: "+250788002002", role: "technician", zone_id: "Bugesera", province: "Eastern Province", district: "Bugesera", sector: "Kabeza", cell: "Kabeza I", village: "Rugarama", expertise: "Pipe Infrastructure" },
];

const MOCK_CASES = [
  { id: 1024, issue_type: "Pipe Burst", status: "resolved", reported_at: "2024-03-20 14:30", location: "Kagarama, Kanserege, Marembo", urgency: "high", tech_id: "3" },
  { id: 1027, issue_type: "No Water", status: "returned", reported_at: "2024-03-24 08:00", location: "Kimironko, Bibare, Kibagabaga", urgency: "medium", tech_id: "3" },
  { id: 1030, issue_type: "Water Contamination", status: "assigned", reported_at: "2024-03-27 15:10", location: "Nyarugenge, Nyamirambo, Biryogo", urgency: "critical", tech_id: "3" },
  { id: 1035, issue_type: "Pipe Burst", status: "assigned", reported_at: "2024-04-01 09:15", location: "Bugesera, Nyamata", urgency: "high", tech_id: "4" },
];

function getStatusClass(status: string) {
  switch (status) {
    case "resolved": return "status-resolved";
    case "assigned": return "status-assigned";
    case "returned": return "status-pending";
    default: return "";
  }
}

function getUrgencyClass(urgency: string) {
  switch (urgency) {
    case "critical": return "urgency-critical";
    case "high": return "urgency-high";
    case "medium": return "urgency-medium";
    case "low": return "urgency-low";
    default: return "";
  }
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="item-subtitle" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{value || '—'}</p>
    </div>
  );
}

export function TechnicianDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showFireConfirm, setShowFireConfirm] = useState(false);

  const tech = MOCK_TECHNICIANS.find(t => t.user_id === id);

  if (!tech) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <h2>Technician Not Found</h2>
        <p className="item-subtitle">This staff record does not exist or has been removed.</p>
        <button className="btn btn-primary mt-24" onClick={() => navigate('/dashboard/users')}>Back to Staff Management</button>
      </div>
    );
  }

  const handleFire = () => {
    // In production: call demoteToCitizen API
    navigate('/dashboard/users');
  };

  const initial = tech.full_name.charAt(0).toUpperCase();
  const techCases = MOCK_CASES.filter(c => c.tech_id === id);

  return (
    <div className="page-container">
      <button className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }} onClick={() => navigate('/dashboard/users')}>
        <BackIcon /> Staff Management
      </button>

      <div className="page-header">
        <div className="flex-between w-full">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="avatar-large" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>{initial}</div>
            <div>
              <h1 style={{ marginBottom: '4px' }}>{tech.full_name}</h1>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge-outline">@{tech.username}</span>
                <span className="role-pill">{tech.role}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate(`/dashboard/users/technician/${id}/edit`)}>
              <EditIcon /> Edit Profile
            </button>
            <button className="btn" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowFireConfirm(true)}>
              Remove from Staff
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <h3 className="dashboard-section-title mb-16">Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InfoRow label="Email Address" value={tech.email} />
            <InfoRow label="Phone Number" value={tech.phone} />
            <InfoRow label="Username" value={`@${tech.username}`} />
            <InfoRow label="Specialization" value={tech.expertise} />
          </div>
        </div>

        <div className="card">
          <h3 className="dashboard-section-title mb-16">Work Assignment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InfoRow label="Role" value={tech.role} />
            <InfoRow label="Assigned Zone / District" value={tech.zone_id} />
            <InfoRow label="Core Expertise" value={tech.expertise} />
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="dashboard-section-title mb-16">Residential Address</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            <InfoRow label="Province" value={tech.province} />
            <InfoRow label="District" value={tech.district} />
            <InfoRow label="Sector" value={tech.sector} />
            <InfoRow label="Cell" value={tech.cell} />
            <InfoRow label="Village" value={tech.village} />
          </div>
        </div>
      </div>

      <div className="card mt-24">
        <h3 className="dashboard-section-title mb-16">Assigned & Historical Cases</h3>
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Issue Type</th>
                <th>Urgency</th>
                <th>Reported At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {techCases.map((report) => (
                <tr key={report.id}>
                  <td data-label="Report ID"><span className="id-badge">#{report.id}</span></td>
                  <td data-label="Issue Type"><span className="issue-type-text">{report.issue_type}</span></td>
                  <td data-label="Urgency">
                    <span className={`urgency-pill ${getUrgencyClass(report.urgency)}`}>
                      {report.urgency}
                    </span>
                  </td>
                  <td data-label="Reported At">{report.reported_at}</td>
                  <td data-label="Status">
                    <span className={`status-pill ${getStatusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/reports/${report.id}`)}>Details</button>
                  </td>
                </tr>
              ))}
              {techCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No cases found for this technician.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFireConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px' }}>Remove from Staff?</h2>
            <p className="item-subtitle" style={{ marginBottom: '8px' }}>
              You are about to demote <strong style={{ color: '#1e293b' }}>{tech.full_name}</strong> back to a citizen account.
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '32px' }}>
              They will lose all technician privileges immediately.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowFireConfirm(false)}>Cancel</button>
              <button className="btn" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={handleFire}>
                Yes, Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
