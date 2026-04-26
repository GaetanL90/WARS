import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";
type CitizenStatus = "New" | "Pending" | "Resolved";

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
}

const MOCK_REPORTS: Record<number, ReportDetails> = {
  1024: {
    id: 1024,
    issue_type: "Pipe Burst",
    internal_status: "resolved",
    reported_at: "2024-03-20 14:30",
    description: "Main pipe leaking near the primary school. It's wasting a lot of water and creating a muddy area.",
    location: "Kagarama, Kanserege, Marembo",
    location_detail: "Near the school gate, Block B",
    phone: "+250788123456",
    image_path: "https://images.unsplash.com/photo-1585706569097-bd152146847f?auto=format&fit=crop&q=80&w=800"
  },
  1025: {
    id: 1025,
    issue_type: "Water Contamination",
    internal_status: "assigned",
    reported_at: "2024-03-22 09:15",
    description: "Brown water coming from the tap since morning. We can't use it for drinking or cooking.",
    location: "Remera, Nyarutarama, Rukiri I",
    phone: "+250788123456"
  },
  1028: {
    id: 1028,
    issue_type: "No Water",
    internal_status: "new",
    reported_at: "2024-03-25 18:45",
    description: "Total water outage for the last 12 hours. The whole neighborhood is affected.",
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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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

  return (
    <div className="page-container">
      <div className="detail-header">
        <button onClick={() => navigate("/reports/my")} className="btn-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Reports
        </button>
        <div className="header-title-row">
          <h1>Report #{report.id}</h1>
          <div className="header-actions">
            {report.internal_status === "new" && (
              <div className="action-button-group">
                <button className="btn btn-outline btn-with-icon" onClick={() => navigate(`/reports/edit/${report.id}`)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Report
                </button>
                <div className="action-divider"></div>
                <button className="btn btn-danger-outline btn-with-icon" onClick={() => setShowDeleteModal(true)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete Report
                </button>
              </div>
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
                <div className="step-label">Submitted (New)</div>
              </div>
              <div className="step-line"></div>
              <div className={`tracker-step ${getStatusStepClass("Pending")}`}>
                <div className="step-marker">2</div>
                <div className="step-label">Processing (Pending)</div>
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
              <div className="detail-row">
                <span className="detail-label">Issue Type</span>
                <span className="detail-value highlight">{report.issue_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reported At</span>
                <span className="detail-value">{report.reported_at}</span>
              </div>
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
              {report.location_detail && (
                <div className="detail-row">
                  <span className="detail-label">Specific Details</span>
                  <span className="detail-value">{report.location_detail}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Contact Phone</span>
                <span className="detail-value">{report.phone}</span>
              </div>
            </div>

            {report.image_path && (
              <>
                <div className="report-divider" />
                <div className="content-section">
                  <h3>Photo Evidence</h3>
                  <div className="detail-image-wrapper" onClick={() => setIsAvatarModalOpen(true)} style={{ cursor: 'pointer' }}>
                    <img src={report.image_path} alt="Evidence" />
                  </div>
                </div>
              </>
            )}
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
                {citizenStatus}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5f768f', marginTop: '16px', lineHeight: '1.5' }}>
              {citizenStatus === "New" && "Your report has been submitted and is waiting for initial review by the admin team."}
              {citizenStatus === "Pending" && "A technician has been assigned and is currently working on resolving the issue."}
              {citizenStatus === "Resolved" && "The issue has been marked as resolved. If you still experience problems, please submit a new report."}
            </p>
          </div>

          <div className="info-card card" style={{ marginTop: '20px' }}>
            <h4>Track History</h4>
            <div className="history-timeline">
              <div className="timeline-item">
                <div className="timeline-point"></div>
                <div className="timeline-content">
                  <span className="timeline-date">{report.reported_at}</span>
                  <span className="timeline-text">Report submitted by {auth?.user?.name || "citizen"}</span>
                </div>
              </div>
              {report.internal_status !== "new" && (
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <span className="timeline-date">Processing Started</span>
                    <span className="timeline-text">Report was confirmed and moved to pending</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content warning-modal">
            <div className="warning-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h2>Delete Report?</h2>
            <p>Are you sure you want to delete this report? This action is permanent and cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Yes, Delete Report"}
              </button>
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAvatarModalOpen && report.image_path && (
        <div className="modal-overlay" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '800px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <img src={report.image_path} alt="Full size evidence" style={{ width: '100%', display: 'block' }} />
            <button 
              className="modal-close-btn" 
              onClick={() => setIsAvatarModalOpen(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '20px' }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
