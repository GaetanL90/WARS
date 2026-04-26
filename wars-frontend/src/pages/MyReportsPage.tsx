import { useState } from "react";
import { useNavigate } from "react-router-dom";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";

interface Report {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  description: string;
  location: string;
}

const MOCK_REPORTS: Report[] = [
  {
    id: 1024,
    issue_type: "Pipe Burst",
    internal_status: "resolved",
    reported_at: "2024-03-20 14:30",
    description: "Main pipe leaking near the primary school.",
    location: "Kagarama, Kanserege, Marembo"
  },
  {
    id: 1025,
    issue_type: "Water Contamination",
    internal_status: "assigned",
    reported_at: "2024-03-22 09:15",
    description: "Brown water coming from the tap since morning.",
    location: "Remera, Nyarutarama, Rukiri I"
  },
  {
    id: 1028,
    issue_type: "No Water",
    internal_status: "new",
    reported_at: "2024-03-25 18:45",
    description: "Total water outage for the last 12 hours.",
    location: "Kimironko, Bibare, Kibagabaga"
  }
];

export function MyReportsPage() {
  const navigate = useNavigate();
  const [reports] = useState<Report[]>(MOCK_REPORTS);

  const mapToCitizenStatus = (status: InternalStatus) => {
    if (status === "new") return "New";
    if (status === "resolved") return "Resolved";
    return "Pending";
  };

  const getStatusClass = (status: InternalStatus) => {
    const citizenStatus = mapToCitizenStatus(status);
    switch (citizenStatus) {
      case "Resolved": return "status-resolved";
      case "Pending": return "status-assigned";
      case "New": return "status-pending";
      default: return "";
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Reports</h1>
        <p>Track the status of issues you have reported to WARS.</p>
      </div>

      <div className="reports-card card">
        {reports.length > 0 ? (
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Issue Type</th>
                  <th>Reported At</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td><span className="id-badge">#{report.id}</span></td>
                    <td><span className="issue-type-text">{report.issue_type}</span></td>
                    <td>{report.reported_at}</td>
                    <td>{report.location}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(report.internal_status)}`}>
                        {mapToCitizenStatus(report.internal_status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-icon" 
                        title="View Details"
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#e0e9f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>You haven't submitted any reports yet.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }}>Submit Your First Report</button>
          </div>
        )}
      </div>
    </div>
  );
}
