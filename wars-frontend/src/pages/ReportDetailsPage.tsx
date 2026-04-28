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
  resolved_at?: string;
  returned_at?: string;
}

const MOCK_REPORTS: Record<number, ReportDetails> = {
  1024: {
    id: 1024,
    issue_type: "Pipe Burst",
    internal_status: "resolved",
    reported_at: "2024-03-20 14:30",
    description: "Main pipe leaking near the primary school.",
    location: "Kagarama, Kanserege, Marembo",
    phone: "+250788123456",
    resolved_at: "2024-03-21 10:00"
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
    is_assigned_to_me: true
  },
  1028: {
    id: 1028,
    issue_type: "No Water",
    internal_status: "new",
    reported_at: "2024-03-25 18:45",
    description: "Total water outage for the last 12 hours.",
    location: "Kimironko, Bibare, Kibagabaga",
    phone: "+250788123456"
  }
};

export function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Status update states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"resolved" | "returned">("resolved");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

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
          <Link to="/reports/my" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to My Reports</Link>
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
      navigate("/reports/my");
    }, 1200);
  };

  const handleUpdateStatus = () => {
    setIsSavingStatus(true);
    setTimeout(() => {
      setReport(prev => prev ? { ...prev, internal_status: newStatus } : null);
      setIsSavingStatus(false);
      setShowUpdateModal(false);
    }, 800);
  };

  const isTechnicianView = auth?.user?.role === "technician" && report.is_assigned_to_me;

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
            {isTechnicianView && <span className="badge badge-primary">Assigned Case</span>}
          </div>
          <div className="header-actions">
            {report.internal_status === "new" && !isTechnicianView && (
              <div className="action-button-group">
                <button className="btn btn-outline btn-with-icon" onClick={() => navigate(`/reports/edit/${report.id}`)}>
                  Edit
                </button>
                <div className="action-divider"></div>
                <button className="btn btn-danger-outline btn-with-icon" onClick={() => setShowDeleteModal(true)}>
                  Delete
                </button>
              </div>
            )}
            {isTechnicianView && report.internal_status === "assigned" && (
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
              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
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
          <div className="info-card card" style={{ background: '#f8fafc' }}>
            <h4>Current Status</h4>
            <div className="current-status-display">
              <span className={`status-pill ${
                citizenStatus === "New" ? "status-pending" : 
                citizenStatus === "Resolved" ? "status-resolved" : "status-assigned"
              }`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                {report.internal_status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5f768f', marginTop: '16px', lineHeight: '1.5' }}>
              {report.internal_status === "new" && "Waiting for initial review."}
              {report.internal_status === "assigned" && "A technician is working on this."}
              {report.internal_status === "resolved" && "The issue has been resolved."}
              {report.internal_status === "returned" && "Requires more information from the citizen."}
            </p>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Update Status</h2>
            <div className="filter-group mb-24 mt-16">
              <label>New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="input-field">
                <option value="resolved">Resolved</option>
                <option value="returned">Return (Needs info)</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={isSavingStatus}>
                {isSavingStatus ? "Saving..." : "Confirm Update"}
              </button>
              <button className="btn btn-outline" onClick={() => setShowUpdateModal(false)}>Cancel</button>
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
