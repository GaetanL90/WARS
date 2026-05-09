import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { WaterPoint, SensorType } from "../types/sensorTypes";

// Mock Data
const MOCK_WP_DATA: Record<string, WaterPoint> = {
  "wp-1": {
    id: "wp-1",
    name: "Bugesera Central Hub",
    locationName: "Nyamata Sector - Pilot Area",
    status: "warning",
    hardwareId: "WP-RWD-7729-101",
    firmwareVersion: "2.0.0",
    installationDate: "March 12, 2012",
    lastMaintenance: "April 25, 2026",
    assignedSector: "Nyamata Center",
    riskScore: 0.15,
    isPotable: false,
    scenario: "HEAVY_RAIN",
    assessmentFlags: { "high_turbidity": true, "low_DO": false, "low_pressure": false },
    config: {
      location: { lat: -1.7234, lon: 29.8821 },
      infrastructureAge: 15,
      distanceToPlant: 8.5,
      populationDensity: 1200,
      populationImpacted: 4800,
      priorityLevel: 4
    },
    conditions: {
      repairTeamAvailability: 3,
      localAuthorityResponsiveness: 0.75
    },
    sensors: [
      { id: "s-1", type: "Turbidity", value: 8.626, unit: "NTU",    trend: [2.1, 2.5, 4.8, 7.2, 8.1, 8.626] },
      { id: "s-2", type: "pH Level",  value: 7.009, unit: "pH",     trend: [7.2, 7.1, 7.1, 7.0, 7.0, 7.009] },
      { id: "s-3", type: "Conductivity",     value: 361.3,  unit: "µS/cm", trend: [350, 355, 358, 360, 361, 361.3] },
      { id: "s-4", type: "ORP",               value: 165.5,  unit: "mV",    trend: [200, 190, 180, 175, 170, 165.5] },
      { id: "s-5", type: "Dissolved Oxygen",  value: 6.527,  unit: "mg/L",  trend: [7.5, 7.2, 7.0, 6.8, 6.6, 6.527] },
      { id: "s-6", type: "Organic Carbon",    value: 6.098,  unit: "mg/L",  trend: [4.2, 4.8, 5.2, 5.8, 6.0, 6.098] },
      { id: "s-7", type: "Flow Rate",         value: 15.546, unit: "L/s",   trend: [12.5, 13.1, 14.2, 15.0, 15.2, 15.546] },
      { id: "s-8", type: "Water Pressure",    value: 8.587,  unit: "Bar",   trend: [8.2, 8.3, 8.4, 8.5, 8.5, 8.587] },
      { id: "s-9", type: "Temperature",       value: 21.05, unit: "°C",    trend: [20.5, 20.8, 21.0, 21.0, 21.0, 21.05] }
    ]
  }
};

const SENSOR_COLORS: Record<SensorType, string> = {
  "Turbidity": "#10b981",
  "pH Level": "#8b5cf6",
  "Conductivity": "#f59e0b",
  "ORP": "#ef4444",
  "Dissolved Oxygen": "#06b6d4",
  "Organic Carbon": "#6366f1",
  "Flow Rate": "#3b82f6",
  "Water Pressure": "#ec4899",
  "Temperature": "#f97316"
};

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

const SENSOR_LEGEND: Record<SensorType, { measures: string; whyWARS: string; range?: string }> = {
  "Turbidity":         { measures: "Suspended particles in water", range: "0–1000 NTU",  whyWARS: "Primary contamination flag — spikes on heavy rain, pipe leaks, or drought." },
  "pH Level":          { measures: "Acidity / alkalinity",         range: "2–12",        whyWARS: "Chemical contamination detection. WHO safe threshold: 6.5–8.5." },
  "Conductivity":      { measures: "Dissolved salts",              range: "µS/cm",       whyWARS: "Contamination spikes it; drought concentrates it; rain dilutes it." },
  "ORP":               { measures: "Oxidation-Reduction Potential", range: "mV",          whyWARS: "Strongest single contamination signal — weighted 2× in risk labels." },
  "Dissolved Oxygen":  { measures: "O₂ dissolved in water",        range: "0–14 mg/L",   whyWARS: "Drops when organic load rises; chemical contamination depletes it." },
  "Organic Carbon":    { measures: "Total Organic Carbon",          range: "mg/L",        whyWARS: "Bacterial decomposition proxy; drives the Dissolved Oxygen calculation." },
  "Flow Rate":         { measures: "Water flow rate",              range: "L/s",         whyWARS: "Pipe leak detection (net drop downstream); drought shows as low flow." },
  "Water Pressure":    { measures: "Line pressure",                range: "bar",         whyWARS: "Low pressure indicates a pipe leak or burst — used directly in risk score." },
  "Temperature":       { measures: "Water temperature",            range: "0–45 °C",     whyWARS: "Drought raises it; elevated temp accelerates bacterial growth rates." },
};

type SensorStatus = "normal" | "warning" | "critical";

const SENSOR_THRESHOLDS: Record<SensorType, (v: number) => SensorStatus> = {
  "Turbidity":        v => v <= 4 ? "normal" : v <= 10 ? "warning" : "critical",
  "pH Level":         v => (v >= 6.5 && v <= 8.5) ? "normal" : (v >= 5.5 && v <= 9.5) ? "warning" : "critical",
  "Conductivity":     v => v <= 500 ? "normal" : v <= 1500 ? "warning" : "critical",
  "ORP":              v => v >= 300 ? "normal" : v >= 200 ? "warning" : "critical",
  "Dissolved Oxygen": v => v >= 6 ? "normal" : v >= 4 ? "warning" : "critical",
  "Organic Carbon":   v => v <= 2 ? "normal" : v <= 4 ? "warning" : "critical",
  "Flow Rate":        v => (v >= 5 && v <= 20) ? "normal" : (v >= 2 && v <= 30) ? "warning" : "critical",
  "Water Pressure":   v => (v >= 2 && v <= 6) ? "normal" : (v >= 1 && v <= 8) ? "warning" : "critical",
  "Temperature":      v => v <= 25 ? "normal" : v <= 35 ? "warning" : "critical",
};



const SENSOR_BOUNDS: Record<SensorType, [number, number, number]> = {
  "Turbidity":        [0.5, 12,   0.8],
  "pH Level":         [5.8, 9.2,  0.18],
  "Conductivity":     [350, 680,  18],
  "ORP":              [150, 460,  18],
  "Dissolved Oxygen": [2.5, 12,   0.5],
  "Organic Carbon":   [0.5, 5.5,  0.3],
  "Flow Rate":        [1,   28,   1.4],
  "Water Pressure":   [0.8, 7.5,  0.25],
  "Temperature":      [16,  36,   0.6],
};

const CRITICAL_THRESHOLDS: Record<SensorType, { min?: number; max?: number }> = {
  "Turbidity":        { max: 10 },
  "pH Level":         { min: 6.5, max: 8.5 },
  "Conductivity":     { max: 800 },
  "ORP":              { min: 200 },
  "Dissolved Oxygen": { min: 4 },
  "Organic Carbon":   { max: 10 },
  "Flow Rate":        { max: 80 },
  "Water Pressure":   { min: 2, max: 12 },
  "Temperature":      { max: 35 },
};

const STATUS_STYLE: Record<SensorStatus, { label: string; bg: string; color: string; dot: string }> = {
  normal:   { label: "Normal",   bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  warning:  { label: "Warning",  bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  critical: { label: "Critical", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

export type ChartPeriod = "1h" | "24h" | "7d" | "day" | "30d";

const PERIOD_CONFIG: Record<ChartPeriod, { count: number; intervalMs: number; xFmt: (d: Date) => string; labelCount: number }> = {
  "1h":  { count: 720, intervalMs: 5_000,    xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 13 },
  "24h": { count: 720, intervalMs: 120_000,  xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 25 },
  "7d":  { count: 720, intervalMs: 840_000,  xFmt: d => d.toLocaleDateString([], { weekday: 'short' }),                    labelCount: 8 },
  "30d": { count: 720, intervalMs: 3600_000, xFmt: d => d.toLocaleDateString([], { month: 'short', day: 'numeric' }),      labelCount: 15 },
  "day": { count: 720, intervalMs: 120_000,  xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 25 },
};

export function generateHistoricalData(baseValue: number, bounds: [number, number, number], period: ChartPeriod) {
  const [min, max, delta] = bounds;
  const cfg = PERIOD_CONFIG[period];
  const driftScale = period === "30d" ? 3 : period === "7d" ? 2 : 1;
  let startTime = new Date(Date.now() - (cfg.count - 1) * cfg.intervalMs);

  const timestamps: Date[] = [];
  const values: number[] = [];
  let cur = baseValue;
  for (let i = 0; i < cfg.count; i++) {
    timestamps.push(new Date(startTime.getTime() + i * cfg.intervalMs));
    const drift = (Math.random() * 2 - 1) * delta * driftScale;
    cur = Math.min(max, Math.max(min, parseFloat((cur + drift).toFixed(2))));
    values.push(cur);
  }
  return { timestamps, values };
}

function SensorChartModal({ sensor, color, bounds, onClose }: { sensor: import("../types/sensorTypes").Sensor; color: string; bounds: [number, number, number]; onClose: () => void }) {
  const [period, setPeriod] = useState<ChartPeriod>("1h");
  const [hist, setHist] = useState(() => generateHistoricalData(sensor.value, bounds, "1h"));

  useEffect(() => { setHist(generateHistoricalData(sensor.value, bounds, period)); }, [period]);

  useEffect(() => {
    if (period === "day") return;
    const [min, max, delta] = bounds;
    const cfg = PERIOD_CONFIG[period];
    const interval = setInterval(() => {
      setHist(prev => {
        const lastVal = prev.values[prev.values.length - 1] ?? sensor.value;
        const newVal = Math.min(max, Math.max(min, parseFloat((lastVal + (Math.random() * 2 - 1) * delta).toFixed(2))));
        const now = new Date();
        const cutoff = now.getTime() - (cfg.count - 1) * cfg.intervalMs;
        const newTimestamps = [...prev.timestamps, now].filter(t => t.getTime() >= cutoff);
        const newValues = [...prev.values, newVal].slice(-newTimestamps.length);
        return { timestamps: newTimestamps, values: newValues };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [period]);

  const { timestamps, values } = hist;
  const W = 800, H = 400, PAD = { top: 32, right: 40, bottom: 80, left: 64 };
  const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
  
  const thresholds = CRITICAL_THRESHOLDS[sensor.type] || {};
  const dataMin = Math.min(...values), dataMax = Math.max(...values);
  
  // Ensure thresholds are visible in range
  const yMin = Math.min(dataMin, thresholds.min ?? dataMin) * 0.95;
  const yMax = Math.max(dataMax, thresholds.max ?? dataMax) * 1.05;
  const yRange = (yMax - yMin) || 1;
  const tMin = timestamps[0].getTime(), tMax = timestamps[timestamps.length-1].getTime(), tRange = (tMax - tMin) || 1;

  const toX = (t: number) => PAD.left + ((t - tMin) / tRange) * cW;
  const toY = (v: number) => PAD.top + cH - ((v - yMin) / yRange) * cH;
  const linePts = values.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(timestamps[i].getTime())} ${toY(v)}`).join(" ");

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * yRange) / 4);
  const cfg = PERIOD_CONFIG[period];
  const xTicks = Array.from({ length: cfg.labelCount }, (_, i) => new Date(tMin + (i * tRange) / (cfg.labelCount - 1)));

  const PERIODS: { label: string; value: ChartPeriod }[] = [
    { label: "1h",  value: "1h"  },
    { label: "24h", value: "24h" },
    { label: "7d",  value: "7d"  },
    { label: "30d", value: "30d" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "900px", width: "95vw", padding: "32px", borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
        <div className="flex-between mb-24 modal-header-responsive">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>{sensor.type} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '1rem' }}>Telemetry History</span></h2>
              <p className="item-subtitle" style={{ margin: 0, fontSize: '0.85rem' }}>Current: <strong style={{ color: '#0f172a' }}>{sensor.value} {sensor.unit}</strong></p>
            </div>
          </div>
          <div className="modal-actions-responsive" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {PERIODS.map(p => (
                <button 
                  key={p.value} 
                  onClick={() => setPeriod(p.value)}
                  style={{ 
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: period === p.value ? 'white' : 'transparent',
                    color: period === p.value ? '#0f172a' : '#64748b',
                    fontWeight: period === p.value ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: period === p.value ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ marginLeft: '12px', width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#64748b", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {/* Grid Lines & Y-Axis Labels */}
            {yTicks.map((val, i) => (
              <g key={`y-${i}`}>
                <line x1={PAD.left} y1={toY(val)} x2={W - PAD.right} y2={toY(val)} stroke="#f1f5f9" strokeWidth="1" />
                <text x={PAD.left - 12} y={toY(val)} dy="0.32em" textAnchor="end" fill="#94a3b8" fontSize="11" fontWeight="600">{val.toFixed(1)}</text>
              </g>
            ))}

            {/* X-Axis Labels */}
            {xTicks.map((date, i) => (
              <g key={`x-${i}`}>
                <line x1={toX(date.getTime())} y1={PAD.top} x2={toX(date.getTime())} y2={H - PAD.bottom} stroke="#f1f5f9" strokeWidth="1" />
                <text 
                  x={toX(date.getTime())} 
                  y={H - PAD.bottom + 12} 
                  textAnchor="end" 
                  fill="#94a3b8" 
                  fontSize="10" 
                  fontWeight="600"
                  transform={`rotate(-45, ${toX(date.getTime())}, ${H - PAD.bottom + 12})`}
                >
                  {cfg.xFmt(date)}
                </text>
              </g>
            ))}

            {/* Critical Thresholds */}
            {thresholds.max !== undefined && (
              <g>
                <line x1={PAD.left} y1={toY(thresholds.max)} x2={W - PAD.right} y2={toY(thresholds.max)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" />
                <text x={W - PAD.right + 4} y={toY(thresholds.max)} dy="0.32em" fill="#ef4444" fontSize="10" fontWeight="800">MAX SAFE</text>
              </g>
            )}
            {thresholds.min !== undefined && (
              <g>
                <line x1={PAD.left} y1={toY(thresholds.min)} x2={W - PAD.right} y2={toY(thresholds.min)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" />
                <text x={W - PAD.right + 4} y={toY(thresholds.min)} dy="0.32em" fill="#ef4444" fontSize="10" fontWeight="800">MIN SAFE</text>
              </g>
            )}

            {/* Main Data Line */}
            <path d={linePts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Area Fill */}
            <path 
              d={`${linePts} L ${toX(tMax)} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`} 
              fill={`url(#gradient-${sensor.type.replace(/\s+/g, '')})`} 
              style={{ opacity: 0.1 }}
            />

            <defs>
              <linearGradient id={`gradient-${sensor.type.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-24 flex-between modal-stats-responsive">
          <div className="modal-stats-grid" style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div className="item-subtitle" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Min Reading</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{dataMin.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>{sensor.unit}</span></div>
            </div>
            <div>
              <div className="item-subtitle" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Max Reading</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{dataMax.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>{sensor.unit}</span></div>
            </div>
            <div>
              <div className="item-subtitle" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Average</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{(values.reduce((a,b) => a+b, 0) / values.length).toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>{sensor.unit}</span></div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={onClose}>Close Detailed View</button>
        </div>
      </div>
    </div>
  );
}

function fmt(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

function MiniChart({ data, color, timestamps }: { data: number[], color: string, timestamps: Date[] }) {
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = (max - min) || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return (
    <div className="telemetry-mini-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
        <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
      </svg>
      <div className="flex-between mt-4">
        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{fmt(timestamps[0])}</span>
        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{fmt(timestamps[timestamps.length-1])}</span>
      </div>
    </div>
  );
}

export function WaterPointDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const [data, setData] = useState<WaterPoint | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedSensor, setSelectedSensor] = useState<import("../types/sensorTypes").Sensor | null>(null);
  const [trendTimestamps, setTrendTimestamps] = useState<Date[]>(() => Array.from({ length: 6 }, (_, i) => new Date(Date.now() - (5 - i) * 5000)));
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(MOCK_WP_DATA[id as keyof typeof MOCK_WP_DATA] || MOCK_WP_DATA["wp-1"]);
    }, 800);
    return () => clearTimeout(timeout);
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev;
        const newSensors = prev.sensors.map(s => {
          const b = SENSOR_BOUNDS[s.type];
          if (!b) return s;
          const newVal = Math.min(b[1], Math.max(b[0], parseFloat((s.value + (Math.random() * 2 - 1) * b[2]).toFixed(2))));
          return { ...s, value: newVal, trend: [...s.trend.slice(1), newVal] };
        });
        return { ...prev, sensors: newSensors };
      });
      const now = new Date();
      setTrendTimestamps(prev => [...prev.slice(1), now]);
      setLastUpdate(now);
    }, 5000);
    return () => clearInterval(interval);
  }, [!!data]);

  const handleExport = () => {
    if (!data) return;
    setIsExporting(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      const headers = ["Timestamp", ...data.sensors.map(s => `${s.type} (${s.unit})`)].join(",");
      const rows = trendTimestamps.map((time, idx) => {
        const fullTime = time.toISOString().replace('T', ' ').split('.')[0]; // Full date and time
        const vals = data.sensors.map(s => s.trend[idx] !== undefined ? s.trend[idx] : s.value);
        return [fullTime, ...vals].join(",");
      });
      
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `WARS_Telemetry_${data.hardwareId}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1200);
  };

  if (!data) return <div className="page-container">Loading telemetry...</div>;

  return (
    <div className="page-container">
      <style>{`
        .wp-details-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .wp-details-layout {
            grid-template-columns: 1fr;
          }
          .status-hero-card {
            flex: 1 1 100% !important;
          }
          .uptime-card {
            flex: 1 1 100% !important;
            order: -1;
          }
        }
        @media (max-width: 640px) {
          .hero-stats-group {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .hero-status-pill {
            width: 100%;
            text-align: center;
          }
        }
        @media (max-width: 768px) {
          .modal-header-responsive {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .modal-actions-responsive {
            width: 100%;
            justify-content: space-between;
          }
          .modal-stats-responsive {
            flex-direction: column;
            gap: 16px !important;
          }
          .modal-stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            width: 100%;
          }
        }
      `}</style>
      <div className="page-header">
        <div className="breadcrumbs mb-8"><Link to="/dashboard/infrastructure">Infrastructure</Link> / <span>{data.name}</span></div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>Telemetry Insights</h1>
            <p className="item-subtitle">Live graphical data from {data.locationName}. <span style={{ color: '#22c55e' }}>● Updated {lastUpdate.toLocaleTimeString()}</span></p>
          </div>
          {hasAnyRole(["admin"]) && (
            <button onClick={() => navigate(`/dashboard/infrastructure/water-point/${id}/config`)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EditIcon /> Edit Configuration
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {/* Row 1: Status Hero Section */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="card status-hero-card" style={{ 
            flex: '1 1 700px',
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '24px',
            borderLeft: `8px solid ${data.isPotable ? '#10b981' : '#ef4444'}`,
            background: data.isPotable ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
            padding: '24px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div className="hero-stats-group" style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label className="item-subtitle" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#64748b' }}>AI Risk Assessment</label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, color: (data.riskScore || 0) > 0.5 ? '#ef4444' : '#10b981', lineHeight: 1, letterSpacing: '-2px' }}>
                    {((data.riskScore || 0) * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>PROBABILITY</span>
                </div>
              </div>

              <div style={{ height: '60px', width: '1px', background: 'rgba(0,0,0,0.05)', display: 'none' }} className="hero-divider" />

              <div>
                <label className="item-subtitle" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#64748b' }}>Operating Scenario</label>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ 
                    padding: '10px 20px', 
                    background: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.scenario === 'NORMAL' ? '#10b981' : '#f59e0b', boxShadow: `0 0 10px ${data.scenario === 'NORMAL' ? '#10b981' : '#f59e0b'}` }}></span>
                    {data.scenario?.replace('_', ' ') || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '200px' }} className="hero-status-pill">
              <div className={`urgency-pill ${data.isPotable ? 'urgency-medium' : 'urgency-critical'}`} style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: 900, boxShadow: `0 8px 16px ${data.isPotable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, border: 'none' }}>
                {data.isPotable ? 'POTABLE' : 'NOT POTABLE'}
              </div>
              <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>SYSTEM VERIFIED: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="card uptime-card" style={{ flex: '1 1 250px', background: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.3)' }}>
            <label style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Node Connectivity</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#3b82f6' }}>{data.status === 'online' ? '98.2' : '84.5'}</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b' }}>%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: data.status === 'online' ? '98%' : '84%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', height: '100%', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}></div>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#475569', marginTop: '10px', fontWeight: 600 }}>Uptime signal: STRONG</span>
          </div>
        </div>

        {/* Row 2: Main Dashboard Grid */}
        <div className="wp-details-layout">
          
          {/* Column 1: Telemetry Grid */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {data.sensors.map(s => {
                const color = SENSOR_COLORS[s.type] || '#10b981';
                const status = SENSOR_THRESHOLDS[s.type]?.(s.value) ?? 'normal';
                const st = STATUS_STYLE[status];
                const isCritical = status === 'critical';
                
                return (
                  <div 
                    key={s.id} 
                    className="card telemetry-insight-card" 
                    onClick={() => setSelectedSensor(s)} 
                    style={{ 
                      cursor: 'pointer', 
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '24px',
                      background: '#ffffff',
                      border: isCritical ? `2px solid ${st.dot}` : '1.5px solid transparent',
                      boxShadow: isCritical ? `0 10px 15px -3px ${st.dot}22` : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      borderRadius: '20px'
                    }}
                  >
                    {isCritical && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: st.dot, animation: 'pulse 2s infinite' }} />
                    )}
                    
                    <div className="flex-between mb-20">
                      <div className="flex-center" style={{ gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', letterSpacing: '0.01em' }}>{s.type}</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 900, 
                        padding: '5px 10px', 
                        borderRadius: '8px', 
                        background: st.bg, 
                        color: st.color, 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {st.label}
                      </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1 }}>
                        {s.value.toFixed(2)}
                        <span style={{ fontSize: '1rem', color: '#94a3b8', marginLeft: '6px', fontWeight: 700 }}>{s.unit}</span>
                      </div>
                    </div>

                    <MiniChart data={s.trend} color={color} timestamps={trendTimestamps} />
                    
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Real-time stream</span>
                      <span style={{ fontSize: '0.6rem', color: '#cbd5e1', fontWeight: 700 }}>{lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Flags - Integrated below the grid */}
            {data.assessmentFlags && Object.values(data.assessmentFlags).some(f => f) && (
              <div className="card mt-24" style={{ 
                background: '#fff1f2', 
                border: '1px solid #fecaca',
                padding: '20px 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: '#fecaca', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.1)'
                }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#9f1239', fontSize: '1rem', fontWeight: 800 }}>AI Diagnostic Warnings</h4>
                  {(() => {
                    const activeFlagsCount = Object.values(data.assessmentFlags || {}).filter(v => v).length;
                    return (
                      <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem', color: '#be123c', fontWeight: 500 }}>
                        The following {activeFlagsCount === 1 ? 'anomaly was' : 'anomalies were'} detected in the telemetry stream and {activeFlagsCount === 1 ? 'requires' : 'require'} immediate review.
                      </p>
                    );
                  })()}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(data.assessmentFlags).filter(([_, v]) => v).map(([flag]) => (
                      <span key={flag} style={{ 
                        padding: '6px 14px', 
                        background: '#ffffff', 
                        border: '1px solid #fecaca', 
                        color: '#e11d48', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="card mt-24">
              <button onClick={() => setShowLegend(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="dashboard-section-title" style={{ margin: 0 }}>Sensor Behaviour Library</h3>
                <span style={{ fontSize: '1.2rem', color: '#64748b' }}>{showLegend ? '−' : '+'}</span>
              </button>
              {showLegend && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {data.sensors.map(s => {
                    const l = SENSOR_LEGEND[s.type];
                    return l ? (
                      <div key={s.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${SENSOR_COLORS[s.type]}` }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>{s.type}</strong>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>{l.measures}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Sidebar Metadata */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div className="card mb-24">
              <h3 className="dashboard-section-title mb-16">Point Metadata</h3>
              <div className="info-list">
                <div className="info-item mb-16">
                  <label className="item-subtitle">Hardware Identity</label>
                  <p className="item-title" style={{ fontSize: '0.9rem', fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>{data.hardwareId}</p>
                </div>
                <div className="info-item mb-16">
                  <label className="item-subtitle">Geospatial Data</label>
                  <p className="item-title" style={{ fontSize: '0.9rem' }}>Lat: {data.config.location.lat}<br/>Lon: {data.config.location.lon}</p>
                </div>
                <div className="info-item">
                  <label className="item-subtitle">Core Specifications</label>
                  <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Net Age</span>
                      <strong style={{ fontSize: '1rem' }}>{data.config.infrastructureAge}y</strong>
                    </div>
                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Impact</span>
                      <strong style={{ fontSize: '1rem' }}>{data.config.populationImpacted > 1000 ? (data.config.populationImpacted/1000).toFixed(1) + 'k' : data.config.populationImpacted}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="dashboard-section-title mb-16">Operations</h3>
              <div className="info-list">
                <div className="info-item mb-12">
                  <label className="item-subtitle">Installation / Service</label>
                  <p className="item-title" style={{ fontSize: '0.85rem', marginTop: '4px' }}>{data.installationDate}</p>
                </div>
              </div>
              <hr className="divider my-20" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    const anomalies = Object.entries(data.assessmentFlags || {})
                      .filter(([_, v]) => v)
                      .map(([k]) => k.replace('_', ' '));
                    navigate(`/dashboard/infrastructure/water-point/${id}/maintenance`, { state: { anomalies } });
                  }}
                >
                  Request Maintenance
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%' }} 
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export Telemetry Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSensor && (
        <SensorChartModal
          sensor={selectedSensor}
          color={SENSOR_COLORS[selectedSensor.type] || '#10b981'}
          bounds={SENSOR_BOUNDS[selectedSensor.type] ?? [0, 100, 1]}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}
