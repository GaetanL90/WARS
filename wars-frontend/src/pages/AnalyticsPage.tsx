import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import warsLogo from "../assets/WARS_logo.png";

// --- Advanced Mock Data ---

const MOCK_CATEGORIES = [
  { name: "Pipe Integrity", score: 92, color: "#3b82f6", trend: "+2%", icon: <ShieldIcon /> },
  { name: "Water Quality", score: 98, color: "#10b981", trend: "+0.5%", icon: <DropletsIcon /> },
  { name: "Supply Pressure", score: 85, color: "#f59e0b", trend: "-1.2%", icon: <ActivityIcon /> },
  { name: "Sensor Uptime", score: 99, color: "#8b5cf6", trend: "Stable", icon: <TrendingUpIcon /> },
];

const MOCK_INCIDENTS = [
  { id: 1, when: "2026-05-10 08:45", where: "Bugesera East", what: "Pressure Drop detected", status: "Resolved", source: "Sensor" },
  { id: 2, when: "2026-05-09 14:20", where: "Bugesera East", what: "Major Leak reported", status: "In Progress", source: "Citizen" },
  { id: 3, when: "2026-05-08 10:15", where: "Kigali Metro", what: "Contamination Alert", status: "Resolved", source: "Sensor" },
  { id: 4, when: "2026-05-07 16:30", where: "Bugesera West", what: "Pipe Burst", status: "Resolved", source: "Citizen" },
  { id: 5, when: "2026-05-05 09:00", where: "Kigali Metro", what: "Pump Failure", status: "Open", source: "Sensor" },
];

const generatePath = (points: number, height: number, width: number) => {
  const step = width / (points - 1);
  return Array.from({ length: points }, (_, i) => ({
    x: i * step,
    y: Math.max(10, Math.min(height - 10, height / 2 + (Math.random() * 2 - 1) * (height / 3)))
  }));
};

const MAIN_CHART_DATA = generatePath(24, 200, 800);
const MINI_CHART_DATA = () => generatePath(10, 40, 120);

// --- Icons ---

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function DropletsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z"></path>
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}


// --- Component ---

export function AnalyticsPage() {
  const { auth } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Report Options
  const [reportConfig, setReportConfig] = useState({
    type: "Incidents",
    period: "Month",
    zone: "All Zones",
    severity: "All",
    includeCharts: true,
    customStartDate: "",
    customEndDate: ""
  });

  const getReportRange = () => {
    let from: Date;
    let to: Date;

    if (reportConfig.period === "Custom" && reportConfig.customStartDate && reportConfig.customEndDate) {
      from = new Date(reportConfig.customStartDate);
      to = new Date(reportConfig.customEndDate);
    } else {
      to = new Date();
      from = new Date();
      if (reportConfig.period === "Week") from.setDate(to.getDate() - 7);
      else if (reportConfig.period === "Month") from.setMonth(to.getMonth() - 1);
      else if (reportConfig.period === "Year") from.setFullYear(to.getFullYear() - 1);
    }
    
    return {
      from: from.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      to: to.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      generated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };
  
  const getTrendLabels = () => {
    if (reportConfig.period === 'Week') return ["Mon", "Wed", "Fri", "Sun"];
    if (reportConfig.period === 'Year') return ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
    if (reportConfig.period === 'Custom') return ["Start", "Early", "Mid", "End"];
    return ["Week 01", "Week 02", "Week 03", "Week 04"];
  };

  const reportRange = getReportRange();
  const trendLabels = getTrendLabels();

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 1500);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    
    // Simulate data compilation delay
    setTimeout(() => {
      const headers = ["ID", "Timestamp", "Location", "Category", "Status", "Source"];
      const rows = MOCK_INCIDENTS.map(inc => [
        inc.id,
        inc.when,
        inc.where,
        inc.what,
        inc.status,
        inc.source
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `WARS_Intelligence_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 800);
  };

  // --- Unified Report Template ---
  const renderReportContent = (isPrint = false) => (
    <div style={{ 
      padding: isPrint ? '40px' : '60px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: 'white',
      minHeight: isPrint ? 'auto' : '1000px',
      boxShadow: isPrint ? 'none' : '0 10px 40px rgba(0,0,0,0.1)',
      position: 'relative',
      color: '#0f172a'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '32px', marginBottom: '32px' }}>
        <img src={warsLogo} alt="WARS Logo" style={{ height: '140px' }} />
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>EXECUTIVE SUMMARY</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Official Operations Report</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px', textAlign: 'left' }}>
        <div>
          <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>Reporting Authority</h4>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{auth?.user?.full_name}</p>
          <p style={{ margin: 0 }}>{auth?.user?.email}</p>
          <p style={{ margin: 0 }}>{auth?.user?.phone || '+250 788 000 000'}</p>
          <p style={{ margin: 0, marginTop: '4px' }}>{reportConfig.zone === 'All Zones' ? (auth?.user?.zone_id || 'Regional') : reportConfig.zone} Management Office</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>Intelligence Parameters</h4>
          <p style={{ margin: 0 }}><strong>Focus:</strong> {reportConfig.type}</p>
          <p style={{ margin: 0 }}><strong>From:</strong> {reportRange.from}</p>
          <p style={{ margin: 0 }}><strong>To:</strong> {reportRange.to}</p>
          <p style={{ margin: 0 }}><strong>Date Generated:</strong> {reportRange.generated}</p>
        </div>
      </div>

      <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          The system is currently operating at an efficiency index of 94.2%. This report provides a comprehensive breakdown of network pressure and incident distribution from <strong>{reportRange.from}</strong> to <strong>{reportRange.to}</strong>.
        </p>
      </div>

      {reportConfig.type === 'Incidents' && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontWeight: 700 }}>Detailed Incident Log</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                <th style={{ padding: '10px', fontSize: '0.75rem' }}>Timestamp</th>
                <th style={{ padding: '10px', fontSize: '0.75rem' }}>Location</th>
                <th style={{ padding: '10px', fontSize: '0.75rem' }}>Description</th>
                <th style={{ padding: '10px', fontSize: '0.75rem' }}>Reporter</th>
                <th style={{ padding: '10px', fontSize: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INCIDENTS.map(inc => (
                <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  <td style={{ padding: '10px' }}>{inc.when}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{inc.where}</td>
                  <td style={{ padding: '10px' }}>{inc.what}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: inc.source === 'Sensor' ? '#3b82f6' : '#f59e0b', fontWeight: 700 }}>{inc.source}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: inc.status === 'Resolved' ? '#10b981' : '#e11d48', fontWeight: 700 }}>{inc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontWeight: 700 }}>Performance Metrics Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
              <th style={{ padding: '12px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Metric Category</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Index</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CATEGORIES.map(cat => (
              <tr key={cat.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{cat.name}</td>
                <td style={{ padding: '12px' }}>{cat.score}%</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>OPTIMIZED</span>
                </td>
                <td style={{ padding: '12px', color: '#64748b' }}>90.0%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportConfig.includeCharts && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontWeight: 700 }}>Operational Trend Analysis</h3>
          <div style={{ position: 'relative', height: '240px', width: '100%', border: '1.5px solid #f1f5f9', borderRadius: '16px', padding: '30px 40px 40px 60px', background: '#ffffff' }}>
            <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textAlign: 'right', width: '35px' }}>
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            <svg viewBox="0 0 800 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="0" y1="0" x2="800" y2="0" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="37.5" x2="800" y2="37.5" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="800" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="112.5" x2="800" y2="112.5" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="2" />
              <path fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M0,75 L114,60 L228,80 L342,40 L456,50 L570,30 L684,45 L800,20" />
              {[{x: 0, y: 75}, {x: 114, y: 60}, {x: 228, y: 80}, {x: 342, y: 40}, {x: 456, y: 50}, {x: 570, y: 30}, {x: 684, y: 45}, {x: 800, y: 20}].map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
              ))}
            </svg>
            <div style={{ position: 'absolute', left: '60px', right: '40px', bottom: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
              {trendLabels.map(lbl => <span key={lbl}>{lbl}</span>)}
            </div>
          </div>
          <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
            Note: Trend indicates a 4.2% increase in overall system stability over the last operational cycle.
          </p>
        </div>
      )}

      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px', textAlign: 'center' }}>
          <div style={{ borderBottom: '2px solid #0f172a', height: '60px', marginBottom: '8px' }}></div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Authorized Signature</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Operations Manager</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Executive Analytics</h1>
            <p>High-level system performance metrics and historical incident data.</p>
          </div>
          <div className="flex-gap">
            <div className="period-selector">
              <button className="active">Real-time</button>
              <button>7D</button>
              <button>30D</button>
              <button>12M</button>
            </div>
            <button className="btn btn-primary btn-with-icon" onClick={() => setShowReportModal(true)}>
              <FileTextIcon /> Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-v2-layout">
        {/* Left Column: Hero & Main Charts */}
        <div className="layout-main">
          {/* Hero Card */}
          <div className="glass-card hero-card mb-24">
            <div className="hero-content">
              <div className="flex-column">
                <label>Global Efficiency Index</label>
                <div className="hero-value">94.2%</div>
                <div className="hero-trend positive">
                  <TrendingUpIcon /> <span>+4.2% from previous period</span>
                </div>
              </div>
              <div className="hero-visual">
                <svg viewBox="0 0 100 100" className="circular-progress">
                  <circle cx="50" cy="50" r="45" className="bg" />
                  <circle cx="50" cy="50" r="45" className="fg" style={{ strokeDasharray: '282.7', strokeDashoffset: '16.4' }} />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Chart Card */}
          <div className="glass-card main-chart-card mb-24">
            <div className="flex-between mb-24">
              <div>
                <h3 className="card-title">Network Pressure Trends</h3>
                <p className="card-subtitle">Real-time telemetry across all active zones</p>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><i style={{background: '#3b82f6'}}></i> Actual</span>
                <span className="legend-item"><i style={{background: '#e2e8f0'}}></i> Baseline</span>
              </div>
            </div>
            
            <div className="svg-chart-container">
              <svg viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid Lines */}
                {[0, 50, 100, 150, 200].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {/* Area */}
                <path 
                  fill="url(#areaGrad)" 
                  d={`M0,200 ${MAIN_CHART_DATA.map(p => `L${p.x},${p.y}`).join(" ")} L800,200 Z`} 
                />
                {/* Line */}
                <path 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d={`M${MAIN_CHART_DATA.map(p => `${p.x},${p.y}`).join(" L")}`}
                />
                {/* Interactive Points (Glow) */}
                <circle cx={MAIN_CHART_DATA[12].x} cy={MAIN_CHART_DATA[12].y} r="6" fill="#3b82f6" className="pulse-point" />
              </svg>
            </div>
            <div className="chart-labels">
              <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
            </div>
          </div>

          {/* Secondary Grid Section */}
          <section className="dashboard-sub-section mt-32">
            <div className="section-header-alt mb-24">
              <div className="flex-column">
                <div className="flex-center gap-8 mb-4">
                  <h2 className="section-title-v2">Spatial & Category Intelligence</h2>
                  <div className="live-dot-container">
                    <span className="live-dot"></span>
                    <span className="live-text">LIVE MONITORING</span>
                  </div>
                </div>
                <p className="section-subtitle-v2">Deep-dive into regional sensor health and incident distribution metrics.</p>
              </div>
              <div className="flex-gap">
                <div className="timestamp-badge">
                  <i className="clock-icon"></i> Updated: 2m ago
                </div>
              </div>
            </div>

              <div className="glass-card p-48 intelligence-card">
                <div className="flex-between mb-24">
                  <h4 className="card-title">Active Zone Reports</h4>
                  <div className="heatmap-legend">
                    <span>Low</span>
                    <div className="legend-gradient"></div>
                    <span>High</span>
                  </div>
                </div>
                
                <div className="zone-activity-matrix">
                  {['Kigali', 'Bugesera', 'Musanze', 'Huye'].map(zone => (
                    <div key={zone} className="zone-row mb-24">
                      <div className="flex-between mb-8">
                        <span className="zone-label">{zone} Sector</span>
                        <span className="zone-activity-val">{Math.floor(Math.random() * 40 + 60)}% Active</span>
                      </div>
                      <div className="activity-heatmap-v2">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="heatmap-cell-v2" 
                            style={{ background: `rgba(99, 102, 241, ${0.2 + Math.random() * 0.8})` }}
                            title={`Sensor ${i+1}: Active`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="item-subtitle mt-12" style={{fontSize: '0.75rem', opacity: 0.6}}>Real-time sensor occupancy and heartbeat distribution across major sectors.</p>
              </div>
            </section>
          </div>

        {/* Right Column: Key Metrics & Quick Actions */}
        <div className="layout-sidebar">
          <div className="sidebar-stack">
            {/* Metric Cards */}
            {MOCK_CATEGORIES.slice(0, 3).map(cat => (
              <div key={cat.name} className="glass-card compact-stat">
                <div className="flex-between">
                  <div className="flex-column">
                    <label>{cat.name}</label>
                    <div className="stat-value">{cat.score}%</div>
                  </div>
                  <div className="mini-chart">
                    <svg viewBox="0 0 120 40" width="80" height="30">
                      <path 
                        fill="none" 
                        stroke={cat.color} 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        d={`M${MINI_CHART_DATA().map(p => `${p.x},${p.y}`).join(" L")}`} 
                      />
                    </svg>
                  </div>
                </div>
                <div className={`trend-tag ${cat.trend.startsWith('+') ? 'pos' : 'neg'}`}>
                  {cat.trend}
                </div>
              </div>
            ))}

            {/* Manager Info Card */}
            <div className="glass-card manager-info-card p-32">
              <h4 className="mb-16">Administrative Context</h4>
              <div className="info-row">
                <span>Duty Manager:</span>
                <strong>{auth?.user?.full_name}</strong>
              </div>
              <div className="info-row">
                <span>Active Zone:</span>
                <strong>{auth?.user?.zone_id || 'Global'}</strong>
              </div>
              <div className="info-row">
                <span>Last Audit:</span>
                <strong>2h ago</strong>
              </div>
              <hr className="my-16" style={{opacity: 0.1}} />
              <button 
                className="btn btn-outline w-full" 
                style={{borderStyle: 'dashed'}}
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="spinner-small" style={{borderTopColor: '#3b82f6', borderLeftColor: '#3b82f6'}}></div>
                    Compiling...
                  </>
                ) : (
                  "Export Raw Data (.CSV)"
                )}
              </button>
            </div>


            {/* Operational Log Feed */}
            <div className="glass-card log-feed-card p-32">
              <h4 className="mb-16 flex-between">
                Operational Log
                <span className="feed-count">12 New</span>
              </h4>
              <div className="log-items">
                {[
                  { time: "08:42", msg: "Pressure spike in Kigali North", type: "alert" },
                  { time: "07:15", msg: "Technician T-102 assigned", type: "info" },
                  { time: "06:30", msg: "Sensor S-42 recalibrated", type: "success" },
                  { time: "05:12", msg: "System backup completed", type: "info" }
                ].map((log, i) => (
                  <div key={i} className="log-item">
                    <span className={`log-dot dot-${log.type}`}></span>
                    <div className="log-content">
                      <span className="log-time">{log.time}</span>
                      <p className="log-msg">{log.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost w-full mt-12" style={{fontSize: '0.7rem', color: '#3b82f6'}}>View Full History →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Footer Analytics */}
      <div className="mt-60 mb-80">
        <div className="glass-card p-48 intelligence-card">
          <div className="flex-between mb-32">
            <div className="flex-column">
              <h4 className="card-title" style={{fontSize: '1.25rem'}}>System-Wide Incident Breakdown</h4>
              <p className="item-subtitle" style={{marginTop: '4px'}}>Cross-category performance benchmarks and infrastructure health scores.</p>
            </div>
            <span className="status-badge optimal" style={{padding: '8px 16px', fontSize: '0.8rem'}}>OPERATIONAL EXCELLENCE</span>
          </div>
          <div className="category-grid-v4">
            {MOCK_CATEGORIES.map(cat => (
              <div key={cat.name} className="cat-item-v2">
                <div className="flex-between mb-12">
                  <div className="flex-center gap-12">
                    <div className="cat-icon-box" style={{ width: '40px', height: '40px', color: cat.color, background: `${cat.color}15` }}>
                      {cat.icon}
                    </div>
                    <span className="cat-name" style={{fontSize: '0.95rem'}}>{cat.name}</span>
                  </div>
                  <span className="cat-val" style={{fontSize: '1.1rem', fontWeight: 800, color: '#0f172a'}}>{cat.score}%</span>
                </div>
                <div className="cat-bar-bg-v2" style={{height: '12px'}}>
                  <div className="cat-bar-fill-v2" style={{ width: `${cat.score}%`, background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})` }}>
                    <div className="bar-glow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulate Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content glass-modal report-customizer-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-v2">
              <div className="flex-column">
                <h2 style={{margin: 0}}>Configure Analysis Report</h2>
              </div>
              <button className="btn-icon close-btn" onClick={() => setShowReportModal(false)}>×</button>
            </div>

            <div className="modal-body-v2">
              <section className="config-section mb-24">
                <h4 className="section-title">1. Scope & Timeframe</h4>
                <div className="grid-2 flex-gap">
                  <div className="form-group">
                    <label>Intelligence Focus</label>
                    <select className="input-field" value={reportConfig.type} onChange={e => setReportConfig({...reportConfig, type: e.target.value})}>
                      <option value="Incidents">System Incidents</option>
                      <option value="Infrastructure">Infrastructure Health</option>
                      <option value="WaterQuality">Water Quality Analysis</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Temporal Range</label>
                    <select className="input-field" value={reportConfig.period} onChange={e => setReportConfig({...reportConfig, period: e.target.value})}>
                      <option value="Week">Last 7 Days (Weekly)</option>
                      <option value="Month">Last 30 Days (Monthly)</option>
                      <option value="Year">Current Fiscal Year</option>
                      <option value="Custom">Custom Range...</option>
                    </select>
                  </div>
                </div>

                {reportConfig.period === "Custom" && (
                  <div className="grid-2 flex-gap mt-16">
                    <div className="form-group">
                      <label>From Date</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        value={reportConfig.customStartDate} 
                        onChange={e => setReportConfig({...reportConfig, customStartDate: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>To Date</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        value={reportConfig.customEndDate} 
                        onChange={e => setReportConfig({...reportConfig, customEndDate: e.target.value})} 
                      />
                    </div>
                  </div>
                )}
              </section>

              <section className="config-section mb-24">
                <h4 className="section-title">2. Filtering & Granularity</h4>
                <div className="grid-2 flex-gap">
                  <div className="form-group">
                    <label>Target Operational Zone</label>
                    <select className="input-field" value={reportConfig.zone} onChange={e => setReportConfig({...reportConfig, zone: e.target.value})}>
                      <option value="All Zones">All Coverage Areas</option>
                      <option value="Bugesera East">Bugesera East</option>
                      <option value="Bugesera West">Bugesera West</option>
                      <option value="Kigali Metro">Kigali Metro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Min. Criticality Level</label>
                    <select className="input-field" value={reportConfig.severity} onChange={e => setReportConfig({...reportConfig, severity: e.target.value})}>
                      <option value="All">All Levels</option>
                      <option value="Medium">Medium & Higher</option>
                      <option value="High">Critical Only</option>
                    </select>
                  </div>
                </div>
              </section>


              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={reportConfig.includeCharts} onChange={e => setReportConfig({...reportConfig, includeCharts: e.target.checked})} />
                  <span>Include high-fidelity graphical visualizations in final export</span>
                </label>
              </div>
            </div>

            <div className="modal-footer-v2 mt-16">
              <button className="btn btn-outline" onClick={() => setShowReportModal(false)}>Discard Changes</button>
              <div className="flex-gap">
                <button className="btn btn-outline hide-mobile" onClick={() => { setShowReportModal(false); setShowReportPreview(true); }}>
                  Preview Report
                </button>
                <button className="btn btn-primary hero-btn" onClick={handleGenerateReport} disabled={isGenerating}>
                  {isGenerating ? (
                    <span className="flex-center gap-8">
                      <i className="spinner-small"></i> Compiling...
                    </span>
                  ) : 'Generate Executive Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowReportPreview(false)}>
          <div className="modal-content report-preview-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', background: '#f1f5f9', padding: '40px', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="flex-between mb-24 no-print">
              <h2 style={{margin: 0}}>Report Preview</h2>
              <div className="flex-gap">
                <button className="btn btn-primary" onClick={() => { setShowReportPreview(false); window.print(); }}>Print / Save as PDF</button>
                <button className="btn btn-outline" onClick={() => setShowReportPreview(false)}>Close</button>
              </div>
            </div>
            <div className="report-paper-sim hide-mobile" style={{ display: 'flex', justifyContent: 'center' }}>
               {renderReportContent(false)}
            </div>
          </div>
        </div>
      )}
    </div>

      {/* --- Hidden Print Template --- */}
      <div id="printable-report" className="print-only">
        {renderReportContent(true)}
      </div>

      <style>{`
        .period-selector {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          margin-right: 12px;
        }
        .period-selector button {
          border: none;
          background: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }
        .period-selector button.active {
          background: white;
          color: #0f172a;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .analytics-v2-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 40px;
          width: 100%;
        }
        .p-20 { padding: 20px !important; }
        .p-24 { padding: 24px !important; }
        .p-32 { padding: 32px !important; }
        .p-40 { padding: 40px !important; }
        .p-48 { padding: 48px !important; }
        .mt-16 { margin-top: 16px !important; }
        .mt-32 { margin-top: 32px !important; }
        .mt-40 { margin-top: 40px !important; }
        .mt-60 { margin-top: 60px !important; }
        .mt-80 { margin-top: 80px !important; }
        .mb-40 { margin-bottom: 40px !important; }
        @media (max-width: 1100px) {
          .analytics-v2-layout { grid-template-columns: 1fr; }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(31, 38, 135, 0.1);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .hero-card {
          padding: 40px;
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.8) 100%);
        }
        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .hero-card label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
        }
        .hero-value {
          font-size: 4rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin: 12px 0;
          letter-spacing: -2px;
        }
        .hero-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .hero-trend.positive { color: #10b981; }

        .circular-progress {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }
        .circular-progress circle {
          fill: none;
          stroke-width: 10;
        }
        .circular-progress circle.bg { stroke: #f1f5f9; }
        .circular-progress circle.fg {
          stroke: #6366f1;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s ease;
        }

        .main-chart-card {
          padding: 40px;
        }
        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .card-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 4px 0 0;
        }
        .chart-legend {
          display: flex;
          gap: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
        }
        .legend-item i {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        .svg-chart-container {
          height: 220px;
          width: 100%;
          position: relative;
        }
        .svg-chart-container svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .pulse-point {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { r: 6; opacity: 1; }
          50% { r: 12; opacity: 0; }
          100% { r: 6; opacity: 0; }
        }

        .grid-2-alt {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (max-width: 800px) {
          .grid-2-alt { grid-template-columns: 1fr; }
        }
        .cat-item-v2 { position: relative; }
        .cat-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cat-bar-bg-v2 {
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.03);
        }
        .cat-bar-fill-v2 {
          height: 100%;
          border-radius: 5px;
          position: relative;
        }
        .bar-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: barMove 3s infinite;
        }
        @keyframes barMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .status-badge.optimal {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .zone-activity-matrix {
          display: flex;
          flex-direction: column;
        }
        .zone-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
        }
        .zone-activity-val {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
        }
        .activity-heatmap-v2 {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          gap: 4px;
        }
        .heatmap-cell-v2 {
          aspect-ratio: 1;
          border-radius: 3px;
          cursor: help;
        }
        .heatmap-cell-v2:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          z-index: 5;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
        }
        .legend-gradient {
          width: 60px;
          height: 6px;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 1));
          border-radius: 3px;
        }


        .compact-stat {
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .compact-stat label {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }
        .compact-stat .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }
        .trend-tag {
          position: absolute;
          bottom: 12px;
          right: 20px;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .trend-tag.pos { background: #dcfce7; color: #166534; }
        .trend-tag.neg { background: #fee2e2; color: #991b1b; }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }
        .info-row span { color: #64748b; }
        .info-row strong { color: #0f172a; }

        .section-title-v2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .section-subtitle-v2 {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }
        .live-dot-container {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: dotPulse 2s infinite;
        }
        @keyframes dotPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .live-text {
          font-size: 0.65rem;
          font-weight: 800;
          color: #10b981;
          letter-spacing: 0.05em;
        }
        .timestamp-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .intelligence-grid {
          background: rgba(248, 250, 252, 0.5);
          padding: 48px;
          border-radius: 40px;
          border: 1px solid rgba(226, 232, 240, 0.5);
          gap: 40px !important;
        }
        .intelligence-card {
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important;
          padding: 48px !important;
          border-radius: 32px !important;
        }

        .category-grid-v4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }
        @media (max-width: 1200px) {
          .category-grid-v4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .category-grid-v4 { grid-template-columns: 1fr; }
        }
        .intelligence-stack {
          display: flex;
          flex-direction: column;
          gap: 40px !important;
        }
        .live-pill {
          font-size: 0.6rem;
          background: #dcfce7;
          color: #166534;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 800;
        }
        .command-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .cmd-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cmd-btn:hover {
          background: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .cmd-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cmd-icon.blue { background: #eff6ff; color: #3b82f6; }
        .cmd-icon.amber { background: #fffbeb; color: #f59e0b; }
        .cmd-icon.green { background: #f0fdf4; color: #10b981; }
        .cmd-icon.purple { background: #faf5ff; color: #8b5cf6; }
        .cmd-btn span { font-size: 0.7rem; font-weight: 700; color: #475569; }

        .feed-count {
          font-size: 0.65rem;
          color: #3b82f6;
          font-weight: 700;
        }
        .log-items { display: flex; flex-direction: column; gap: 20px; }
        .log-item { display: flex; gap: 16px; position: relative; }
        .log-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
          display: inline-block;
        }
        .log-dot.dot-alert { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }
        .log-dot.dot-info { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.3); }
        .log-dot.dot-success { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.3); }
        .log-content { display: flex; flex-direction: column; }
        .log-time { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
        .log-msg { font-size: 0.75rem; color: #334155; margin: 2px 0 0; line-height: 1.4; }
        .sidebar-stack {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .btn-ghost {
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-ghost:hover { text-decoration: underline; }

        .report-customizer-modal {
          width: 95%;
          max-width: 720px;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          border-radius: 24px;
        }
        .modal-header-v2 {
          padding: 32px 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .modal-body-v2 {
          padding: 32px 40px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .modal-footer-v2 {
          padding: 24px 40px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .section-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .config-section {
          background: #ffffff;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #0f172a;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          background: #f1f5f9;
          padding: 12px 16px;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .checkbox-label:hover {
          background: #e2e8f0;
        }
        .checkbox-label input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #3b82f6;
        }
        .hero-btn {
          padding-left: 32px;
          padding-right: 32px;
          min-width: 220px;
        }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .close-btn {
          font-size: 24px;
          color: #94a3b8;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #0f172a; }

        @media (max-width: 600px) {
          .page-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
            overflow-x: hidden;
          }
          .analytics-v2-layout {
            padding-bottom: 40px;
          }
          .glass-card {
            margin-left: 4px;
            margin-right: 4px;
          }
          .modal-header-v2, .modal-body-v2, .modal-footer-v2 {
            padding: 20px;
          }
          .report-customizer-modal .grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .hero-value {
            font-size: 2.5rem;
          }
          .hero-card {
            padding: 20px;
          }
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .circular-progress {
            width: 80px;
            height: 80px;
          }
          .modal-footer-v2 {
            flex-direction: column-reverse;
          }
          .modal-footer-v2 button {
            width: 100%;
          }
          .analytics-v2-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .analytics-v2-header .flex-gap {
            width: 100%;
            flex-direction: column;
          }
          .period-selector {
            width: 100%;
            justify-content: space-between;
            margin-right: 0;
          }
          .hide-mobile {
            display: none !important;
          }
        }

        .print-only { display: none; }

        @media print {
          @page {
            size: auto;
            margin: 15mm;
          }
          html, body, #root {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            position: static !important;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          * {
            overflow: visible !important;
          }
          .page-container, .page-header, .analytics-v2-layout, .glass-card, .btn, .period-selector, .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-only section, .print-only div[style*="marginBottom"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
            clear: both;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          filter: brightness(1.1);
        }
        .btn-outline {
          background: #ffffff;
          color: #1e293b;
          border: 1.5px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
