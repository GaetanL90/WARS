import { useState } from "react";
import { useNavigate } from "react-router-dom";

type InternalStatus = "new" | "pending" | "assigned" | "returned" | "escalated" | "resolved";

interface Report {
  id: number;
  issue_type: string;
  internal_status: InternalStatus;
  reported_at: string;
  reporter: string;
  location: string;
}

interface SensorAlert {
  alert_id: string;
  sensor_id: string;
  alert_type: string;
  location: string;
  timestamp: string;
  status: InternalStatus;
}

const MOCK_REPORTS: Report[] = [
  { id: 1024, issue_type: "Pipe Burst", internal_status: "new", reported_at: "2024-03-20 14:30", reporter: "Citizen User", location: "Kagarama, Kanserege" },
  { id: 1028, issue_type: "No Water", internal_status: "assigned", reported_at: "2024-03-25 18:45", reporter: "Tech User", location: "Kimironko, Bibare" },
  { id: 1030, issue_type: "Water Contamination", internal_status: "returned", reported_at: "2024-03-27 15:10", reporter: "Citizen User", location: "Nyarugenge, Nyamirambo" },
  { id: 1031, issue_type: "Other", internal_status: "escalated", reported_at: "2024-03-28 08:45", reporter: "Citizen User", location: "Gasabo, Kacyiru" },
];

const MOCK_ALERTS: SensorAlert[] = [
  { alert_id: "AL-801", sensor_id: "SN-22A (Flow Meter)", alert_type: "Abnormal Flow Rate", location: "Kabeza Bypass", timestamp: "2024-04-01 10:15", status: "new" },
  { alert_id: "AL-802", sensor_id: "SN-05B (Pressure)", alert_type: "Critical Pressure Drop", location: "Nyamata Center", timestamp: "2024-04-01 09:30", status: "new" },
  { alert_id: "AL-803", sensor_id: "SN-12C (Quality)", alert_type: "High Turbidity Detected", location: "Nyarutarama North", timestamp: "2024-03-31 22:00", status: "pending" },
  { alert_id: "AL-804", sensor_id: "SN-08D (Flow Meter)", alert_type: "Minor Leakage", location: "Remera Sector", timestamp: "2024-03-30 14:20", status: "assigned" },
  { alert_id: "AL-805", sensor_id: "SN-01A (Quality)", alert_type: "pH Level Normalised", location: "Kicukiro", timestamp: "2024-03-29 09:00", status: "resolved" },
];

function getStatusClass(status: string) {
  switch (status) {
    case "resolved": return "status-resolved";
    case "assigned": return "status-assigned";
    case "returned": case "escalated": return "status-pending";
    case "pending": case "new": return "status-pending";
    default: return "";
  }
}

export function IncidentManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "sensors">("users");

  const unassignedReports = MOCK_REPORTS.filter(r => r.internal_status === "new" || r.internal_status === "returned").length;
  const criticalAlerts = MOCK_ALERTS.filter(a => a.status === "new").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Incident Management Hub</h1>
        <p>Monitor, triage, and assign incoming reports and automated infrastructure alerts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '16px', borderRadius: '12px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div>
            <p className="item-subtitle" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>Unassigned Reports</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{unassignedReports}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '16px', borderRadius: '12px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <p className="item-subtitle" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>New Sensor Alerts</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{criticalAlerts}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '16px', borderRadius: '12px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <p className="item-subtitle" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>Active Cases</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{MOCK_REPORTS.filter(r => r.internal_status === "assigned" || r.internal_status === "escalated").length}</h2>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '3px solid #0f172a' : '3px solid transparent', fontWeight: activeTab === 'users' ? 700 : 500, color: activeTab === 'users' ? '#0f172a' : '#64748b', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
            onClick={() => setActiveTab("users")}
          >
            User Reports
          </button>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'sensors' ? '3px solid #0f172a' : '3px solid transparent', fontWeight: activeTab === 'sensors' ? 700 : 500, color: activeTab === 'sensors' ? '#0f172a' : '#64748b', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
            onClick={() => setActiveTab("sensors")}
          >
            Sensor Alerts
          </button>
        </div>

        {activeTab === "users" && (
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Issue Type</th>
                  <th>Reporter</th>
                  <th>Location</th>
                  <th>Reported At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REPORTS.map(report => (
                  <tr key={report.id}>
                    <td><span className="id-badge">#{report.id}</span></td>
                    <td><span className="issue-type-text">{report.issue_type}</span></td>
                    <td>{report.reporter}</td>
                    <td>{report.location}</td>
                    <td>{report.reported_at}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(report.internal_status)}`} style={{ textTransform: 'capitalize' }}>
                        {report.internal_status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/dashboard/reports/${report.id}`)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sensors" && (
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Alert Type</th>
                  <th>Source Sensor</th>
                  <th>Location</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ALERTS.map(alert => (
                  <tr key={alert.alert_id}>
                    <td><span className="id-badge">{alert.alert_id}</span></td>
                    <td><span className="issue-type-text" style={{ color: '#ef4444' }}>{alert.alert_type}</span></td>
                    <td><span className="badge-outline">{alert.sensor_id}</span></td>
                    <td>{alert.location}</td>
                    <td>{alert.timestamp}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(alert.status)}`} style={{ textTransform: 'capitalize' }}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/dashboard/incidents/sensor/${alert.alert_id}`)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
