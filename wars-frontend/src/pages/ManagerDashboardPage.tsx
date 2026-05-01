import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons (reusing patterns from Layout.tsx)
function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

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

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  );
}

// Mock Data for Network Hierarchy (Aligned with ERD)
const MOCK_ZONES = [
  { 
    zone_id: "zone-a", 
    zone_name: "Zone A: Nyamata Center", 
    district: "Bugesera",
    waterPoints: [
      { point_id: "wp-1", name: "Water Point #101", status: "online", location: "Main Market", sensors: [
        { sensor_id: "s-1", type: "Flow", value: "12.5", unit: "L/s", status: "online" },
        { sensor_id: "s-2", type: "Pressure", value: "3.2", unit: "Bar", status: "online" }
      ]},
      { point_id: "wp-2", name: "Water Point #102", status: "warning", location: "Sector HQ", sensors: [
        { sensor_id: "s-3", type: "Flow", value: "0.0", unit: "L/s", status: "warning" },
        { sensor_id: "s-4", type: "Pressure", value: "1.1", unit: "Bar", status: "warning" }
      ]}
    ]
  },
  { 
    zone_id: "zone-b", 
    zone_name: "Zone B: Kabeza Bypass", 
    district: "Bugesera",
    waterPoints: [
      { point_id: "wp-3", name: "Water Point #201", status: "online", location: "Hospital Road", sensors: [
        { sensor_id: "s-5", type: "Flow", value: "8.2", unit: "L/s", status: "online" },
        { sensor_id: "s-6", type: "Quality", value: "7.2", unit: "pH", status: "online" }
      ]}
    ]
  }
];


const MOCK_RECENT_REPORTS = [
  { report_id: 1045, type: "Water Contamination", urgency: "critical", time: "10m ago", location: "Kabeza" },
  { report_id: 1044, type: "Pipe Burst", urgency: "high", time: "25m ago", location: "Remera" },
  { report_id: 1043, type: "No Water Supply", urgency: "medium", time: "1h ago", location: "Kanombe" },
];

interface Sensor {
  sensor_id: string;
  type: string;
  value: string;
  unit: string;
  status: string;
}

interface WaterPoint {
  point_id: string;
  name: string;
  status: string;
  location: string;
  sensors: Sensor[];
}

export function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [selectedWP, setSelectedWP] = useState<WaterPoint | null>(null);
  const [zones] = useState(MOCK_ZONES);

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div>
            <h1>Manager Dashboard</h1>
            <p>Hierarchical oversight of Water Zones and Network Points.</p>
          </div>
          <div className="badge-outline" style={{ marginBottom: "8px", color: "#10b981" }}>
            <span className="sensor-active-dot"></span> System Live
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}>
            <ActivityIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">128</span>
            <span className="stat-label">Total Reports (24h)</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
            <UsersIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">14</span>
            <span className="stat-label">Active Technicians</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
            <ServerIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">98.2%</span>
            <span className="stat-label">Network Health</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>
            <AlertTriangleIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">3</span>
            <span className="stat-label">Active Outages</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Network Monitoring Section */}
          <div className="card mb-24">
            <h3 className="dashboard-section-title">
              Water Network Monitor
              <span className="item-subtitle">Zones and Supply Points</span>
            </h3>
            
            <div className="zone-list">
              {zones.map(zone => (
                <div key={zone.zone_id} className="zone-group mb-24">
                  <div className="zone-header" style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", marginBottom: "12px", borderLeft: "4px solid #3b82f6" }}>
                    <span className="item-title" style={{ color: "#334155" }}>{zone.zone_name}</span>
                  </div>
                  <div className="table-responsive">
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>Water Point</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zone.waterPoints.map(wp => (
                          <tr key={wp.point_id}>
                            <td><span className="item-title">{wp.name}</span></td>
                            <td>{wp.location}</td>
                            <td>
                              <span className={`status-pill ${wp.status === 'online' ? 'status-resolved' : 'status-pending'}`}>
                                {wp.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => navigate(`/dashboard/infrastructure/water-point/${wp.point_id}`)}
                              >
                                View Sensors
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Critical Incident Feed */}
          <div className="card">
            <h3 className="dashboard-section-title">
              Critical Incidents
              <span className="item-subtitle">Recent Citizen Reports</span>
            </h3>
            <div className="list-container mt-16">
              {MOCK_RECENT_REPORTS.map(report => (
                <div key={report.report_id} className="list-item">
                  <div className="item-main">
                    <span className="item-title">#{report.report_id} - {report.type}</span>
                    <span className="item-subtitle">{report.location}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`urgency-pill urgency-${report.urgency}`} style={{ fontSize: "0.6rem", padding: "2px 6px" }}>
                      {report.urgency}
                    </span>
                    <span className="item-subtitle" style={{ display: "block", marginTop: "4px" }}>{report.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Details Modal */}
      {selectedWP && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="flex-between mb-16">
              <h2>{selectedWP.name} Sensors</h2>
              <button className="btn btn-icon" onClick={() => setSelectedWP(null)}>×</button>
            </div>
            <p className="item-subtitle mb-24">Live telemetry for water point at {selectedWP.location}.</p>
            
            <div className="telemetry-grid">
              {selectedWP.sensors.map((sensor) => (
                <div key={sensor.sensor_id} className="telemetry-card">
                  <div style={{ marginBottom: "8px" }}>
                    <span className={`status-indicator ${sensor.status === 'online' ? 'status-online' : 'status-warning'}`}></span>
                  </div>
                  <span className="telemetry-value">{sensor.value} <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{sensor.unit}</span></span>
                  <span className="telemetry-label">{sensor.type}</span>
                </div>
              ))}
            </div>

            <div className="modal-footer mt-24">
              <button className="btn btn-primary w-full" onClick={() => setSelectedWP(null)}>Close Monitor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

