import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";

interface SensorAlertDetails {
  alert_id: string;
  sensor_id: string;
  sensor_name: string;
  alert_type: string;
  location: string;
  timestamp: string;
  status: InternalStatus;
  telemetry_value: string;
  threshold_limit: string;
  description: string;
  assigned_to?: string;
  return_reason?: string;
  escalation_reason?: string;
}

const MOCK_TECHNICIANS = [
  { id: 1, name: "Jean Pierre" },
  { id: 2, name: "Marie Claire" },
  { id: 3, name: "Eric Habimana" },
];

const MOCK_ALERTS: Record<string, SensorAlertDetails> = {
  "AL-801": {
    alert_id: "AL-801",
    sensor_id: "SN-22A",
    sensor_name: "Flow Meter - Kabeza Bypass",
    alert_type: "Abnormal Flow Rate",
    location: "Kabeza Bypass, Sector 4",
    timestamp: "2024-04-01 10:15",
    status: "new",
    telemetry_value: "450 L/min",
    threshold_limit: "> 300 L/min",
    description: "Flow rate exceeded normal operating parameters for over 15 minutes. Potential large-scale leak or unauthorized bypass."
  },
  "AL-803": {
    alert_id: "AL-803",
    sensor_id: "SN-12C",
    sensor_name: "Water Quality - Nyarutarama",
    alert_type: "High Turbidity Detected",
    location: "Nyarutarama North Reservoir",
    timestamp: "2024-03-31 22:00",
    status: "pending",
    telemetry_value: "8.5 NTU",
    threshold_limit: "> 5.0 NTU",
    description: "Sudden spike in turbidity levels. Recommended immediate inspection of filtration units."
  },
  "AL-804": {
    alert_id: "AL-804",
    sensor_id: "SN-08D",
    sensor_name: "Pressure Sensor - Remera",
    alert_type: "Minor Leakage",
    location: "Remera Sector, Near Stadium",
    timestamp: "2024-03-30 14:20",
    status: "assigned",
    telemetry_value: "1.2 Bar",
    threshold_limit: "< 2.0 Bar",
    description: "Consistent pressure drop detected over 4 hours. Likely a minor pipe fracture.",
    assigned_to: "Marie Claire"
  },
  "AL-805": {
    alert_id: "AL-805",
    sensor_id: "SN-44E",
    sensor_name: "ORP Sensor - Gikondo",
    alert_type: "Chemical Contamination Risk",
    location: "Gikondo Industrial Zone",
    timestamp: "2024-04-02 09:30",
    status: "new",
    telemetry_value: "150 mV",
    threshold_limit: "< 250 mV",
    description: "Significant drop in Oxidation-Reduction Potential. High probability of chemical contamination in the distribution line."
  },
  "AL-806": {
    alert_id: "AL-806",
    sensor_id: "SN-55F",
    sensor_name: "DO Sensor - Kanombe",
    alert_type: "Organic Loading Alert",
    location: "Kanombe South Outpost",
    timestamp: "2024-04-02 11:45",
    status: "new",
    telemetry_value: "2.4 mg/L",
    threshold_limit: "< 4.0 mg/L",
    description: "Dissolved Oxygen levels have plummeted, suggesting a high organic load or bacterial decomposition spike."
  }
};

export function SensorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [alert, setAlert] = useState<SensorAlertDetails | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Manager actions
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState("");
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");

  useEffect(() => {
    if (id) {
      const found = MOCK_ALERTS[id];
      setAlert(found || null);
    }
  }, [id]);

  if (!alert) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Alert Not Found</h2>
          <p>The sensor alert you are looking for does not exist.</p>
          <Link to="/dashboard/incidents" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Incident Management</Link>
        </div>
      </div>
    );
  }

  const handleAssign = () => {
    if (!selectedTech) return;
    setIsSavingStatus(true);
    setTimeout(() => {
      const techName = MOCK_TECHNICIANS.find(t => t.id.toString() === selectedTech)?.name;
      setAlert(prev => prev ? { ...prev, status: "assigned", assigned_to: techName } : null);
      setIsSavingStatus(false);
      setShowAssignModal(false);
      setSelectedTech("");
    }, 600);
  };

  const handleEscalate = () => {
    if (!escalationReason.trim()) return;
    setIsSavingStatus(true);
    setTimeout(() => {
      setAlert(prev => prev ? { ...prev, status: "escalated", escalation_reason: escalationReason } : null);
      setIsSavingStatus(false);
      setShowEscalateModal(false);
      setEscalationReason("");
    }, 600);
  };

  const handleConfirm = () => {
    setIsSavingStatus(true);
    setTimeout(() => {
      setAlert(prev => prev ? { ...prev, status: "pending" } : null);
      setIsSavingStatus(false);
    }, 600);
  };

  const isManagerView = auth?.user?.role === "manager" || auth?.user?.role === "admin";
  const canAssignOrEscalate = isManagerView && (alert.status === "new" || alert.status === "returned");

  return (
    <div className="page-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <div className="header-title-row">
          <div className="flex-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem' }}>SENSOR ALERT</span>
              <h1>Alert #{alert.alert_id}</h1>
            </div>
            {alert.status === "escalated" && <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#b45309' }}>Escalated Case</span>}
          </div>
          <div className="header-actions">
            {canAssignOrEscalate && (
              <div className="action-button-group">
                {alert.status === "new" && (
                  <>
                    <button className="btn btn-success btn-with-icon" onClick={handleConfirm}>
                      Confirm Alert
                    </button>
                    <div className="action-divider"></div>
                  </>
                )}
                <button className="btn btn-primary btn-with-icon" onClick={() => setShowAssignModal(true)}>
                  Assign Technician
                </button>
                <div className="action-divider"></div>
                <button className="btn btn-outline btn-with-icon" onClick={() => setShowEscalateModal(true)}>
                  Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="report-detail-layout">
        <div className="detail-main">
          {/* Telemetry Card */}
          <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '24px' }}>
            <div className="content-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"></path>
                </svg>
                Sensor Telemetry
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                <div className="telemetry-box" style={{ background: '#fff1f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                  <span style={{ fontSize: '0.8rem', color: '#9f1239', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CURRENT VALUE</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e11d48' }}>{alert.telemetry_value}</span>
                </div>
                <div className="telemetry-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>THRESHOLD LIMIT</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{alert.threshold_limit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Info */}
          <div className="report-content-card card">
            <div className="content-section">
              <h3>Technical Details</h3>
              <div className="detail-row">
                <span className="detail-label">Sensor ID</span>
                <span className="detail-value highlight">{alert.sensor_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sensor Name</span>
                <span className="detail-value">{alert.sensor_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Alert Type</span>
                <span className="detail-value">{alert.alert_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Timestamp</span>
                <span className="detail-value">{alert.timestamp}</span>
              </div>
              
              {alert.return_reason && (
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#fff1f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecdd3', marginTop: '16px' }}>
                  <span className="detail-label" style={{ color: '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Technician Return Reason
                  </span>
                  <p className="detail-description" style={{ color: '#9f1239', fontWeight: 500, margin: 0 }}>{alert.return_reason}</p>
                </div>
              )}
              
              {alert.escalation_reason && (
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '16px' }}>
                  <span className="detail-label" style={{ color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Escalation Notes
                  </span>
                  <p className="detail-description" style={{ color: '#92400e', fontWeight: 500, margin: 0 }}>{alert.escalation_reason}</p>
                </div>
              )}

              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}>
                <span className="detail-label">Incident Description</span>
                <p className="detail-description">{alert.description}</p>
              </div>
            </div>

            <div className="report-divider" />

            <div className="content-section">
              <h3>Location</h3>
              <div className="detail-row">
                <span className="detail-label">Site Location</span>
                <span className="detail-value">{alert.location}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="info-card card" style={{ background: '#f8fafc', marginBottom: '20px' }}>
            <h4>Current Status</h4>
            <div className="current-status-display">
              <span className={`status-pill ${
                alert.status === "resolved" ? "status-resolved" : 
                alert.status === "returned" || alert.status === "escalated" ? "status-pending" : 
                alert.status === "assigned" ? "status-assigned" : "status-pending"
              }`} style={{ fontSize: '1rem', padding: '8px 16px', background: alert.status === 'new' ? '#e2e8f0' : undefined, color: alert.status === 'new' ? '#334155' : undefined }}>
                {alert.status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5f768f', marginTop: '16px', lineHeight: '1.5' }}>
              {alert.status === "new" && "Unassigned sensor trigger. Requires verification."}
              {alert.status === "assigned" && "A technician is inspecting the hardware."}
              {alert.status === "resolved" && "The hardware issue has been cleared."}
              {alert.status === "returned" && "Inspection failed. Technician requires assistance."}
              {alert.status === "escalated" && "Issue escalated to external maintenance team."}
            </p>
          </div>
          
          {alert.assigned_to && (
            <div className="info-card card">
              <h4>Assigned Technician</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <div className="avatar-small" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  {alert.assigned_to.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#10233c' }}>{alert.assigned_to}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#5f768f' }}>Infrastructure Dept.</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Modals */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Assign Technician</h2>
            <p className="mb-16">Select an available technician to handle this sensor alert.</p>
            
            <div className="filter-group mb-24">
              <label>Technician</label>
              <select 
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="input-field"
                required
              >
                <option value="" disabled>Select a technician...</option>
                {MOCK_TECHNICIANS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedTech || isSavingStatus}>
                {isSavingStatus ? "Assigning..." : "Assign"}
              </button>
              <button className="btn btn-outline" onClick={() => { setShowAssignModal(false); setSelectedTech(""); }} disabled={isSavingStatus}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEscalateModal && (
        <div className="modal-overlay">
          <div className="modal-content warning-modal" style={{ maxWidth: '400px', textAlign: 'left' }}>
            <h2 style={{ color: '#b45309', marginBottom: '12px' }}>Escalate Alert</h2>
            <p className="mb-16" style={{ color: '#5f768f' }}>Marking this sensor alert as escalated indicates a critical failure requiring specialized contractors or municipal oversight.</p>
            
            <div className="filter-group mb-24">
              <label>Reason for Escalation <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea 
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="e.g. Critical main pipe rupture, control system failure..."
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                required
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }} onClick={handleEscalate} disabled={!escalationReason.trim() || isSavingStatus}>
                {isSavingStatus ? "Escalating..." : "Confirm Escalation"}
              </button>
              <button className="btn btn-outline" onClick={() => { setShowEscalateModal(false); setEscalationReason(""); }} disabled={isSavingStatus}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
