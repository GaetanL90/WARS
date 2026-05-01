import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Mock Data
const MOCK_WP_DATA = {
  "wp-1": {
    name: "Water Point #101",
    location: "Nyamata Center - Main Market",
    status: "online",
    sensors: [
      { id: "s-1", type: "Flow Rate", value: 12.5, unit: "L/s", trend: [10, 12, 11, 14, 13, 12.5] },
      { id: "s-2", type: "Water Pressure", value: 3.2, unit: "Bar", trend: [3.0, 3.1, 3.3, 3.2, 3.1, 3.2] },
      { id: "s-3", type: "pH Level", value: 7.2, unit: "pH", trend: [7.0, 7.1, 7.2, 7.1, 7.3, 7.2] },
      { id: "s-4", type: "Turbidity", value: 1.5, unit: "NTU", trend: [1.2, 1.4, 1.6, 1.5, 1.4, 1.5] }
    ]
  }
};

function MiniChart({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data) * 1.2;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  
  return (
    <div className="telemetry-mini-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '80px' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <path
          fill={`url(#gradient-${color.replace('#','')})`}
          d={`M 0,100 L ${points} L 100,100 Z`}
          style={{ opacity: 0.1 }}
        />
        <defs>
          <linearGradient id={`gradient-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function WaterPointDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate API fetch
    const wp = MOCK_WP_DATA[id as keyof typeof MOCK_WP_DATA] || MOCK_WP_DATA["wp-1"];
    setData(wp);
  }, [id]);

  if (!data) return <div className="page-container">Loading telemetry...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumbs mb-8">
          <Link to="/dashboard/infrastructure">Infrastructure</Link> / <span>{data.name}</span>
        </div>
        <h1>Telemetry Insights</h1>
        <p>Live graphical data from {data.location}.</p>
      </div>

      <div className="dashboard-main-grid mt-24">
        {/* Telemetry Charts */}
        <div className="dashboard-column" style={{ gridColumn: 'span 2' }}>
          <div className="grid-2 flex-gap">
            {data.sensors.map((sensor: any) => (
              <div key={sensor.id} className="card telemetry-insight-card">
                <div className="flex-between mb-16">
                  <div>
                    <span className="item-subtitle">{sensor.type}</span>
                    <h2 style={{ margin: '4px 0', fontSize: '1.8rem' }}>
                      {sensor.value} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{sensor.unit}</span>
                    </h2>
                  </div>
                  <span className="status-pill status-resolved" style={{ fontSize: '0.6rem' }}>Live</span>
                </div>
                <MiniChart 
                  data={sensor.trend} 
                  color={sensor.type.includes('pH') ? '#8b5cf6' : sensor.type.includes('Pressure') ? '#3b82f6' : '#10b981'} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="dashboard-column">
          <div className="card">
            <h3 className="dashboard-section-title">Point Information</h3>
            <div className="info-list mt-16">
              <div className="info-item mb-12">
                <label className="item-subtitle">Hardware ID</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>WP-RWD-7729-101</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Installation Date</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>March 12, 2024</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Last Maintenance</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>April 25, 2026</p>
              </div>
              <div className="info-item">
                <label className="item-subtitle">Assigned Sector</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>Nyamata Center</p>
              </div>
            </div>
            <hr className="divider my-24" />
            <button className="btn btn-outline w-full">Request Diagnostics</button>
          </div>
        </div>
      </div>
    </div>
  );
}
