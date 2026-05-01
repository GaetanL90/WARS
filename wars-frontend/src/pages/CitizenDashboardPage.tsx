import { Link } from "react-router-dom";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

const MOCK_MY_REPORTS = [
  { id: 1045, type: "Water Contamination", status: "pending", time: "10m ago", location: "Kabeza" },
  { id: 1042, type: "Pipe Burst", status: "resolved", time: "2 days ago", location: "Remera" },
];

export function CitizenDashboardPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Welcome Back</h1>
            <p>Track your submitted reports and network health in your area.</p>
          </div>
          <Link to="/dashboard/reports/new" className="btn btn-primary">
            <PlusIcon /> Submit New Report
          </Link>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-column">
          <div className="card">
            <h3 className="dashboard-section-title">My Recent Reports</h3>
            <div className="list-container mt-16">
              {MOCK_MY_REPORTS.map(report => (
                <div key={report.id} className="list-item">
                  <div className="item-main">
                    <span className="item-title">{report.type}</span>
                    <span className="item-subtitle">#{report.id} • {report.location} • {report.time}</span>
                  </div>
                  <span className={`status-pill ${report.status === 'resolved' ? 'status-resolved' : 'status-pending'}`}>
                    {report.status}
                  </span>
                </div>
              ))}
              {MOCK_MY_REPORTS.length === 0 && (
                <p className="item-subtitle" style={{ padding: '24px', textAlign: 'center' }}>You haven't submitted any reports yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
            <h3 className="dashboard-section-title">Local Network Health</h3>
            <div className="mt-16" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#3b82f6' }}>94%</div>
              <p className="item-subtitle">Water supply is currently stable in your registered zone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
