import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";
type CitizenStatus = "New" | "Pending" | "Resolved";
type Urgency = "critical" | "high" | "medium" | "low";

interface ReportDetails {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  description: string;
  location: string;
  location_detail?: string;
  phone: string;
  image_path?: string;
  urgency?: Urgency;
  is_assigned_to_me?: boolean;
  assigned_to?: string;
  resolved_at?: string;
  returned_at?: string;
  return_reason?: string;
  escalation_reason?: string;
}

const MOCK_TECHNICIANS = [
  { id: 1, name: "Jean Pierre" },
  { id: 2, name: "Marie Claire" },
  { id: 3, name: "Eric Habimana" },
];

const MOCK_REPORTS: Record<number, ReportDetails> = {
  1024: {
    id: 1024,
    issue_type: "Pipe Burst",
    internal_status: "resolved",
    reported_at: "2024-03-20 14:30",
    description: "Main pipe leaking near the primary school.",
    location: "Kagarama, Kanserege, Marembo",
    phone: "+250788123456",
    resolved_at: "2024-03-21 10:00",
    assigned_to: "Jean Pierre"
  },
  1025: {
    id: 1025,
    issue_type: "Water Contamination",
    internal_status: "assigned",
    reported_at: "2024-03-22 09:15",
    description: "Brown water coming from the tap since morning.",
    location: "Remera, Nyarutarama, Rukiri I",
    phone: "+250788123456",
    urgency: "critical",
    is_assigned_to_me: true,
    assigned_to: "Marie Claire"
  },
  1028: {
    id: 1028,
    issue_type: "No Water",
    internal_status: "new",
    reported_at: "2024-03-25 18:45",
    description: "Total water outage for the last 12 hours.",
    location: "Kimironko, Bibare, Kibagabaga",
    phone: "+250788123456"
  },
  1027: {
    id: 1027,
    issue_type: "No Water",
    internal_status: "returned",
    reported_at: "2024-03-24 08:00",
    description: "Neighbor reported dry taps.",
    location: "Kimironko, Bibare, Kibagabaga",
    phone: "+250788123456",
    returned_at: "2024-03-24 11:30",
    return_reason: "Issue requires heavy machinery that is currently unavailable at this station. Escalating to management.",
    is_assigned_to_me: false,
    assigned_to: "Eric Habimana"
  },
  1031: {
    id: 1031,
    issue_type: "Other",
    internal_status: "escalated",
    reported_at: "2024-03-28 08:45",
    description: "Water pressure has been low for three days straight.",
    location: "Gasabo, Kacyiru",
    phone: "+250788123456",
    escalation_reason: "Awaiting municipal response on infrastructure overhaul."
  }
};

export function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Status update states (Technician)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"resolved" | "returned">("resolved");
  const [returnReason, setReturnReason] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Manager actions
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState("");
  
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");

  useEffect(() => {
    if (id) {
      const found = MOCK_REPORTS[Number(id)];
      setReport(found || null);
    }
  }, [id]);

  if (!report) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Report Not Found</h2>
          <p>The report you are looking for does not exist or you do not have permission to view it.</p>
          <Link to="/dashboard/reports/my" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to My Reports</Link>
        </div>
      </div>
    );
  }

  const mapToCitizenStatus = (status: InternalStatus): CitizenStatus => {
    if (status === "new") return "New";
    if (status === "resolved") return "Resolved";
    return "Pending";
  };

  const getUrgencyClass = (urgency: Urgency) => {
    switch (urgency) {
      case "critical": return "urgency-critical";
      case "high": return "urgency-high";
      case "medium": return "urgency-medium";
      case "low": return "urgency-low";
      default: return "";
    }
  };

  const citizenStatus = mapToCitizenStatus(report.internal_status);

  const getStatusStepClass = (stepStatus: CitizenStatus) => {
    const order: CitizenStatus[] = ["New", "Pending", "Resolved"];
    const currentIdx = order.indexOf(citizenStatus);
    const stepIdx = order.indexOf(stepStatus);

    if (currentIdx > stepIdx) return "step-completed";
    if (currentIdx === stepIdx) return "step-active";
    return "step-upcoming";
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      navigate("/dashboard/reports/my");
    }, 1200);
  };

  const handleUpdateStatus = () => {
    if (newStatus === "returned" && !returnReason.trim()) {
      alert("Please provide a reason for return.");
      return;
    }
    setIsSavingStatus(true);
    setTimeout(() => {
      setReport(prev => prev ? { 
        ...prev, 
        internal_status: newStatus, 
        return_reason: newStatus === "returned" ? returnReason : undefined,
        returned_at: newStatus === "returned" ? new Date().toISOString().replace('T', ' ').substring(0, 16) : prev.returned_at,
        resolved_at: newStatus === "resolved" ? new Date().toISOString().replace('T', ' ').substring(0, 16) : prev.resolved_at
      } : null);
      setIsSavingStatus(false);
      setShowUpdateModal(false);
      setReturnReason("");
    }, 800);
  };

  const handleAssign = () => {
    if (!selectedTech) return;
    setIsSavingStatus(true);
    setTimeout(() => {
      const techName = MOCK_TECHNICIANS.find(t => t.id.toString() === selectedTech)?.name;
      setReport(prev => prev ? { ...prev, internal_status: "assigned", assigned_to: techName } : null);
      setIsSavingStatus(false);
      setShowAssignModal(false);
      setSelectedTech("");
    }, 600);
  };

  const handleEscalate = () => {
    if (!escalationReason.trim()) return;
    setIsSavingStatus(true);
    setTimeout(() => {
      setReport(prev => prev ? { ...prev, internal_status: "escalated", escalation_reason: escalationReason } : null);
      setIsSavingStatus(false);
      setShowEscalateModal(false);
      setEscalationReason("");
    }, 600);
  };

  const handleConfirm = () => {
    setIsSavingStatus(true);
    setTimeout(() => {
      setReport(prev => prev ? { ...prev, internal_status: "pending" } : null);
      setIsSavingStatus(false);
    }, 600);
  };

  const isTechnicianView = auth?.user?.role === "technician";
  const isManagerView = auth?.user?.role === "manager" || auth?.user?.role === "admin";
  const canAssignOrEscalate = isManagerView && (report.internal_status === "new" || report.internal_status === "returned");

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
            <h1>Report #{report.id}</h1>
            {isTechnicianView && report.is_assigned_to_me && <span className="badge badge-primary">Assigned Case</span>}
            {report.internal_status === "escalated" && <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#b45309' }}>Escalated Case</span>}
          </div>
          <div className="header-actions">
            {report.internal_status === "new" && !isTechnicianView && !isManagerView && (
              <div className="action-button-group">
                <button className="btn btn-outline btn-with-icon" onClick={() => navigate(`/dashboard/reports/edit/${report.id}`)}>
                  Edit
                </button>
                <div className="action-divider"></div>
                <button className="btn btn-danger-outline btn-with-icon" onClick={() => setShowDeleteModal(true)}>
                  Delete
                </button>
              </div>
            )}
            {canAssignOrEscalate && (
              <div className="action-button-group">
                {report.internal_status === "new" && (
                  <>
                    <button className="btn btn-success btn-with-icon" onClick={handleConfirm}>
                      Confirm Report
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
            {isTechnicianView && report.is_assigned_to_me && report.internal_status === "assigned" && (
              <button className="btn btn-primary" onClick={() => setShowUpdateModal(true)}>
                Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="report-detail-layout">
        <div className="detail-main">
          {/* Status Tracker */}
          <div className="status-tracker-card card">
            <div className="tracker-steps">
              <div className={`tracker-step ${getStatusStepClass("New")}`}>
                <div className="step-marker">1</div>
                <div className="step-label">Submitted</div>
              </div>
              <div className="step-line"></div>
              <div className={`tracker-step ${getStatusStepClass("Pending")}`}>
                <div className="step-marker">2</div>
                <div className="step-label">Processing</div>
              </div>
              <div className="step-line"></div>
              <div className={`tracker-step ${getStatusStepClass("Resolved")}`}>
                <div className="step-marker">3</div>
                <div className="step-label">Resolved</div>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="report-content-card card">
            <div className="content-section">
              <h3>Issue Details</h3>
              {report.urgency && (
                <div className="detail-row">
                  <span className="detail-label">Urgency</span>
                  <span className={`urgency-pill ${getUrgencyClass(report.urgency)}`}>{report.urgency}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Issue Type</span>
                <span className="detail-value highlight">{report.issue_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reported At</span>
                <span className="detail-value">{report.reported_at}</span>
              </div>
              {report.resolved_at && (
                <div className="detail-row">
                  <span className="detail-label">Resolved At</span>
                  <span className="detail-value">{report.resolved_at}</span>
                </div>
              )}
              {report.returned_at && (
                <div className="detail-row">
                  <span className="detail-label">Returned At</span>
                  <span className="detail-value">{report.returned_at}</span>
                </div>
              )}
              
              {/* Conditional Alert Boxes for Returns & Escalations */}
              {report.return_reason && (
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#fff1f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecdd3', marginTop: '16px' }}>
                  <span className="detail-label" style={{ color: '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Technician Return Reason
                  </span>
                  <p className="detail-description" style={{ color: '#9f1239', fontWeight: 500, margin: 0 }}>{report.return_reason}</p>
                </div>
              )}
              
              {report.escalation_reason && (
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '16px' }}>
                  <span className="detail-label" style={{ color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Escalation Notes
                  </span>
                  <p className="detail-description" style={{ color: '#92400e', fontWeight: 500, margin: 0 }}>{report.escalation_reason}</p>
                </div>
              )}

              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}>
                <span className="detail-label">Description</span>
                <p className="detail-description">{report.description}</p>
              </div>
            </div>

            <div className="report-divider" />

            <div className="content-section">
              <h3>Location & Contact</h3>
              <div className="detail-row">
                <span className="detail-label">Village Location</span>
                <span className="detail-value">{report.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact Phone</span>
                <span className="detail-value">{report.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="info-card card" style={{ background: '#f8fafc', marginBottom: '20px' }}>
            <h4>Current Status</h4>
            <div className="current-status-display">
              <span className={`status-pill ${
                report.internal_status === "resolved" ? "status-resolved" : 
                report.internal_status === "returned" || report.internal_status === "escalated" ? "status-pending" : 
                report.internal_status === "assigned" ? "status-assigned" : "status-pending"
              }`} style={{ fontSize: '1rem', padding: '8px 16px', background: report.internal_status === 'new' ? '#e2e8f0' : undefined, color: report.internal_status === 'new' ? '#334155' : undefined }}>
                {report.internal_status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5f768f', marginTop: '16px', lineHeight: '1.5' }}>
              {report.internal_status === "new" && "Waiting for initial review and assignment."}
              {report.internal_status === "assigned" && "A technician is currently working on this issue."}
              {report.internal_status === "resolved" && "The issue has been resolved."}
              {report.internal_status === "returned" && "This case has been returned by the technician."}
              {report.internal_status === "escalated" && "This case has been escalated out of the system."}
            </p>
          </div>
          
          {(report.assigned_to || report.internal_status === "assigned") && (
            <div className="info-card card">
              <h4>Assigned Technician</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <div className="avatar-small" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  {report.assigned_to?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#10233c' }}>{report.assigned_to || 'Assigned Technician'}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#5f768f' }}>Field Operations</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Modals */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Update Status</h2>
            <p className="mb-16">Select the new status for this case.</p>
            <div className="filter-group mb-16">
              <label>New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="input-field">
                <option value="resolved">Resolved</option>
                <option value="returned">Return (Escalate to Manager)</option>
              </select>
            </div>
            
            {newStatus === "returned" && (
              <div className="filter-group mb-24">
                <label>Reason for Return</label>
                <textarea 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Explain why this case is being returned/escalated..."
                  className="input-field"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={isSavingStatus}>
                {isSavingStatus ? "Saving..." : "Confirm Update"}
              </button>
              <button className="btn btn-outline" onClick={() => { setShowUpdateModal(false); setReturnReason(""); }} disabled={isSavingStatus}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Assign Technician</h2>
            <p className="mb-16">Select an available technician to handle this case.</p>
            
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
            <h2 style={{ color: '#b45309', marginBottom: '12px' }}>Escalate Case</h2>
            <p className="mb-16" style={{ color: '#5f768f' }}>Marking this case as escalated indicates it requires out-of-system intervention (e.g., municipal authorities, major contractors).</p>
            
            <div className="filter-group mb-24">
              <label>Reason for Escalation <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea 
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="e.g. Requires heavy machinery, awaiting municipal approval..."
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content warning-modal">
            <h2>Delete Report?</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
