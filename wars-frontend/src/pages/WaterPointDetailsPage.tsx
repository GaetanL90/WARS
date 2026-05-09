import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { WaterPoint, SensorType } from "../types/sensorTypes";

// Mock Data
const MOCK_WP_DATA: Record<string, WaterPoint> = {
  "wp-1": {
    id: "wp-1",
    name: "Water Point #101",
    locationName: "Nyamata Center - Main Market",
    status: "online",
    hardwareId: "WP-RWD-7729-101",
    installationDate: "March 12, 2012",
    lastMaintenance: "April 25, 2026",
    assignedSector: "Nyamata Center",
    config: {
      location: { lat: -1.7234, lon: 29.8821 },
      infrastructureAge: 12,
      distanceToPlant: 8.5,
      populationDensity: 1200,
      populationImpacted: 4500,
      priorityLevel: 4
    },
    conditions: {
      repairTeamAvailability: 2,
      localAuthorityResponsiveness: 0.7
    },
    sensors: [
      { id: "s-1", type: "Turbidity", value: 1.5, unit: "NTU",    trend: [1.2, 1.4, 1.6, 1.5, 1.4, 1.5] },
      { id: "s-2", type: "pH Level",  value: 7.2, unit: "pH",     trend: [7.0, 7.1, 7.2, 7.1, 7.3, 7.2] },
      { id: "s-3", type: "Conductivity",     value: 450,  unit: "µS/cm", trend: [440, 445, 455, 450, 448, 450] },
      { id: "s-4", type: "ORP",               value: 215,  unit: "mV",    trend: [280, 260, 240, 230, 220, 215] },
      { id: "s-5", type: "Dissolved Oxygen",  value: 3.6,  unit: "mg/L",  trend: [5.8, 5.2, 4.7, 4.3, 3.9, 3.6] },
      { id: "s-6", type: "Organic Carbon",    value: 2.1,  unit: "mg/L",  trend: [2.0, 2.2, 2.1, 2.3, 2.1, 2.1] },
      { id: "s-7", type: "Flow Rate",         value: 12.5, unit: "L/s",   trend: [10,  12,  11,  14,  13,  12.5] },
      { id: "s-8", type: "Water Pressure",    value: 3.2,  unit: "Bar",   trend: [3.0, 3.1, 3.3, 3.2, 3.1, 3.2] },
      { id: "s-9", type: "Temperature",       value: 22.4, unit: "°C",    trend: [21.5,22.0,22.5,22.4,22.6,22.4] }
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

const SENSOR_CRITICAL_LINES: Record<SensorType, { val: number; label: string; type: "warning" | "critical" }[]> = {
  "Turbidity":        [{ val: 4, label: "WARN", type: "warning" }, { val: 10, label: "CRIT", type: "critical" }],
  "pH Level":         [
    { val: 6.5, label: "WARN", type: "warning" }, { val: 8.5, label: "WARN", type: "warning" },
    { val: 5.5, label: "CRIT", type: "critical" }, { val: 9.5, label: "CRIT", type: "critical" }
  ],
  "Conductivity":     [{ val: 500, label: "WARN", type: "warning" }, { val: 1500, label: "CRIT", type: "critical" }],
  "ORP":              [{ val: 300, label: "WARN", type: "warning" }, { val: 200, label: "CRIT", type: "critical" }],
  "Dissolved Oxygen": [{ val: 6, label: "WARN", type: "warning" }, { val: 4, label: "CRIT", type: "critical" }],
  "Organic Carbon":   [{ val: 2, label: "WARN", type: "warning" }, { val: 4, label: "CRIT", type: "critical" }],
  "Flow Rate":        [
    { val: 5, label: "WARN", type: "warning" }, { val: 20, label: "WARN", type: "warning" },
    { val: 2, label: "CRIT", type: "critical" }, { val: 30, label: "CRIT", type: "critical" }
  ],
  "Water Pressure":   [
    { val: 2, label: "WARN", type: "warning" }, { val: 6, label: "WARN", type: "warning" },
    { val: 1, label: "CRIT", type: "critical" }, { val: 8, label: "CRIT", type: "critical" }
  ],
  "Temperature":      [{ val: 25, label: "WARN", type: "warning" }, { val: 35, label: "CRIT", type: "critical" }]
};

// Physical simulation bounds: [min, max, maxDeltaPerTick]
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

const STATUS_STYLE: Record<SensorStatus, { label: string; bg: string; color: string; dot: string }> = {
  normal:   { label: "Normal",   bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  warning:  { label: "Warning",  bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  critical: { label: "Critical", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

// ─── Types & helpers for the detailed chart ───────────────────────────────────
export type ChartPeriod = "1h" | "24h" | "7d" | "day" | "30d";

const PERIOD_CONFIG: Record<ChartPeriod, { count: number; intervalMs: number; xFmt: (d: Date) => string; labelCount: number }> = {
  "1h":  { count: 720, intervalMs: 5_000,    xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 13 }, // 5 min labels
  "24h": { count: 720, intervalMs: 120_000,  xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 25 }, // 1 hr labels
  "7d":  { count: 720, intervalMs: 840_000,  xFmt: d => d.toLocaleDateString([], { weekday: 'short' }),                    labelCount: 8 },  // 1 day labels
  "30d": { count: 720, intervalMs: 3600_000, xFmt: d => d.toLocaleDateString([], { month: 'short', day: 'numeric' }),      labelCount: 15 }, // 2 day labels
  "day": { count: 720, intervalMs: 120_000,  xFmt: d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  labelCount: 25 }, // 1 hr labels
};

export function generateHistoricalData(
  baseValue: number,
  bounds: [number, number, number],
  period: ChartPeriod,
  dayStr?: string
): { timestamps: Date[]; values: number[] } {
  const [min, max, delta] = bounds;
  const cfg = PERIOD_CONFIG[period];
  const driftScale = period === "30d" ? 3 : period === "7d" ? 2 : 1;

  let startTime: Date;
  if (period === "day") {
    startTime = dayStr ? new Date(dayStr) : new Date();
    startTime.setHours(0, 0, 0, 0);
  } else {
    startTime = new Date(Date.now() - (cfg.count - 1) * cfg.intervalMs);
  }

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

// ─── Full sensor chart modal ───────────────────────────────────────────────────
function SensorChartModal({
  sensor, color, bounds, onClose,
}: {
  sensor: import("../types/sensorTypes").Sensor;
  color: string;
  bounds: [number, number, number];
  onClose: () => void;
}) {
  const [period, setPeriod] = useState<ChartPeriod>("1h");
  const [dayStr, setDayStr] = useState("");
  const [hist, setHist] = useState(() => generateHistoricalData(sensor.value, bounds, "1h"));

  // Regenerate when period or selected day changes
  useEffect(() => {
    setHist(generateHistoricalData(sensor.value, bounds, period, dayStr || undefined));
  }, [period, dayStr]);

  // Live tick: append new reading every 5 s (except for a fixed historical day)
  useEffect(() => {
    if (period === "day") return;
    const [min, max, delta] = bounds;
    const cfg = PERIOD_CONFIG[period];
    const windowMs = (cfg.count - 1) * cfg.intervalMs;
    const interval = setInterval(() => {
      setHist(prev => {
        const lastVal = prev.values[prev.values.length - 1] ?? sensor.value;
        const drift = (Math.random() * 2 - 1) * delta;
        const newVal = Math.min(max, Math.max(min, parseFloat((lastVal + drift).toFixed(2))));
        
        const now = new Date();
        const lastTimestamp = prev.timestamps[prev.timestamps.length - 1];
        
        if (now.getTime() - lastTimestamp.getTime() >= cfg.intervalMs) {
          const cutoff = now.getTime() - windowMs;
          const newTimestamps = [...prev.timestamps, now].filter(t => t.getTime() >= cutoff);
          const newValues = [...prev.values, newVal].slice(-newTimestamps.length);
          return { timestamps: newTimestamps, values: newValues };
        } else {
          // Slide timestamp to now() to stay glued to right edge, but freeze the value so it doesn't wiggle!
          const newTimestamps = [...prev.timestamps];
          newTimestamps[newTimestamps.length - 1] = now;
          return { timestamps: newTimestamps, values: prev.values };
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const { timestamps, values } = hist;
  const cfg = PERIOD_CONFIG[period];

  // SVG layout
  const W = 700, H = 280;
  const PAD = { top: 16, right: 30, bottom: 64, left: 52 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const windowMs = (cfg.count - 1) * cfg.intervalMs;
  const cutoff = Date.now() - windowMs;

  const currentMax = Math.max(...values);
  const currentMin = Math.min(...values);

  const maxRef = useRef<{ val: number, t: number, period: ChartPeriod } | null>(null);
  const minRef = useRef<{ val: number, t: number, period: ChartPeriod } | null>(null);

  const getPeakTimestamp = (target: number) => {
    const idx = values.lastIndexOf(target);
    return idx >= 0 ? timestamps[idx].getTime() : Date.now();
  };

  if (!maxRef.current || maxRef.current.period !== period || maxRef.current.t < cutoff) {
    maxRef.current = { val: currentMax, t: getPeakTimestamp(currentMax), period };
  } else if (currentMax > maxRef.current.val) {
    maxRef.current = { val: currentMax, t: getPeakTimestamp(currentMax), period };
  }

  if (!minRef.current || minRef.current.period !== period || minRef.current.t < cutoff) {
    minRef.current = { val: currentMin, t: getPeakTimestamp(currentMin), period };
  } else if (currentMin < minRef.current.val) {
    minRef.current = { val: currentMin, t: getPeakTimestamp(currentMin), period };
  }

  const dataMax = maxRef.current.val;
  const dataMin = minRef.current.val;
  
  let yDataMin = dataMin;
  let yDataMax = dataMax;

  const thresholds = SENSOR_CRITICAL_LINES[sensor.type as SensorType] || [];
  
  // Use the fixed physical bounds of the sensor to determine if we should zoom out for a threshold
  const [physMin, physMax] = SENSOR_BOUNDS[sensor.type as SensorType];
  const stableRangeCheck = (physMax - physMin) * 0.25;

  thresholds.forEach(t => {
    if (t.val < yDataMin && (yDataMin - t.val) < stableRangeCheck) yDataMin = t.val;
    if (t.val > yDataMax && (t.val - yDataMax) < stableRangeCheck) yDataMax = t.val;
  });

  const vRange = (yDataMax - yDataMin) || 1;
  const padded = vRange * 0.15;
  const yMin = yDataMin - padded;
  const yMax = yDataMax + padded;
  const yRange = yMax - yMin;

  const tMax = period === "day" ? timestamps[timestamps.length - 1].getTime() : Date.now();
  const tMin = period === "day" ? timestamps[0].getTime() : tMax - windowMs;
  const tRange = tMax - tMin || 1;

  const toX = (t: number) => PAD.left + ((t - tMin) / tRange) * cW;
  const toY = (v: number) => PAD.top + cH - ((v - yMin) / yRange) * cH;

  const linePts = values.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(timestamps[i].getTime()).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const areaPts = `${linePts} L ${toX(timestamps[timestamps.length - 1].getTime()).toFixed(1)} ${(PAD.top + cH).toFixed(1)} L ${toX(timestamps[0].getTime()).toFixed(1)} ${(PAD.top + cH).toFixed(1)} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yRange / 4) * i);
  const xTicks = Array.from({ length: cfg.labelCount }, (_, i) => new Date(tMin + (tRange / (cfg.labelCount - 1)) * i));

  const currentValue = values[values.length - 1] ?? sensor.value;
  const status = SENSOR_THRESHOLDS[sensor.type as SensorType]?.(currentValue) ?? "normal";
  const st = STATUS_STYLE[status];

  const PERIODS: { label: string; value: ChartPeriod }[] = [
    { label: "Past Hour",  value: "1h"  },
    { label: "Past 24 h", value: "24h" },
    { label: "Past Week",  value: "7d"  },
    { label: "Past Month", value: "30d" },
    { label: "Pick a Day", value: "day" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "860px", width: "95vw", padding: "24px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-between mb-16">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: color }} />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{sensor.type}</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Unit: {sensor.unit}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                {currentValue.toFixed(1)}
                <span style={{ fontSize: "0.95rem", color: "#94a3b8", marginLeft: "4px" }}>{sensor.unit}</span>
              </div>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, background: st.bg, color: st.color, borderRadius: "4px", padding: "2px 8px", marginTop: "4px", display: "inline-block", transition: "background 0.4s, color 0.4s" }}>
                {st.label.toUpperCase()}
              </span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#94a3b8", padding: "4px 8px" }}>✕</button>
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                padding: "5px 14px", borderRadius: "20px", border: "1.5px solid",
                cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                borderColor: period === p.value ? color : "#e2e8f0",
                background: period === p.value ? color + "1a" : "transparent",
                color: period === p.value ? color : "#64748b",
                transition: "all 0.15s",
              }}
            >{p.label}</button>
          ))}
          {period === "day" && (
            <input
              type="date"
              value={dayStr}
              onChange={e => setDayStr(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="input-field"
              style={{ padding: "4px 10px", fontSize: "0.78rem", width: "auto" }}
            />
          )}
        </div>

        {/* Chart */}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id={`sg-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <clipPath id={`clip-${sensor.id}`}>
              <rect x={PAD.left} y={0} width={cW} height={H} />
            </clipPath>
          </defs>

          {/* Y-axis grid + labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={toY(v)} x2={PAD.left + cW} y2={toY(v)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v.toFixed(1)}</text>
            </g>
          ))}

          {/* Threshold lines */}
          {thresholds.map((t, i) => {
            const y = toY(t.val);
            if (y < PAD.top - 10 || y > PAD.top + cH + 10) return null; // Don't draw if wildly out of bounds
            const isCrit = t.type === "critical";
            const color = isCrit ? "#ef4444" : "#f59e0b";
            return (
              <g key={`thresh-${i}`}>
                <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y} stroke={color} strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.4" clipPath={`url(#clip-${sensor.id})`} />
                <text x={PAD.left + cW + 4} y={y + 3} textAnchor="start" fontSize="9" fontWeight="600" fill={color} fillOpacity="0.8">
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((tick, i) => {
            const tx = toX(tick.getTime());
            const ty = PAD.top + cH + 18;
            return (
              <text 
                key={i} 
                x={tx} 
                y={ty} 
                textAnchor="end" 
                transform={`rotate(-45 ${tx} ${ty})`}
                fontSize="10" 
                fill="#94a3b8"
              >
                {cfg.xFmt(tick)}
              </text>
            );
          })}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + cH} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top + cH} x2={PAD.left + cW} y2={PAD.top + cH} stroke="#cbd5e1" strokeWidth="1" />

          {/* Area fill */}
          <path d={areaPts} fill={`url(#sg-${sensor.id})`} clipPath={`url(#clip-${sensor.id})`} />

          {/* Line */}
          <path d={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#clip-${sensor.id})`} />

          {/* Current value indicator */}
          <circle cx={toX(timestamps[timestamps.length - 1].getTime())} cy={toY(values[values.length - 1])} r="8" fill={color} fillOpacity="0.2" clipPath={`url(#clip-${sensor.id})`} />
          <circle cx={toX(timestamps[timestamps.length - 1].getTime())} cy={toY(values[values.length - 1])} r="4.5" fill={color} clipPath={`url(#clip-${sensor.id})`} />
        </svg>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            High-Resolution Telemetry ({values.length} data points)
          </span>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            Min: {dataMin.toFixed(2)} · Max: {dataMax.toFixed(2)} · Avg: {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)} {sensor.unit}
          </span>
        </div>
      </div>
    </div>
  );
}

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function MiniChart({ data, color, timestamps }: { data: number[], color: string, timestamps: string[] }) {
  const max = Math.max(...data) * 1.2;
  const min = Math.min(...data) * 0.8;
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  // Show first and last timestamps
  const tsFirst = timestamps[0] ?? '';
  const tsLast  = timestamps[timestamps.length - 1] ?? '';

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
      {/* X-axis timestamp labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{tsFirst}</span>
        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{tsLast}</span>
      </div>
    </div>
  );
}

export function WaterPointDetailsPage() {
  const { id } = useParams();
  const { hasAnyRole } = useAuth();
  const [data, setData] = useState<WaterPoint | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedSensor, setSelectedSensor] = useState<import("../types/sensorTypes").Sensor | null>(null);

  // Initialise trend timestamps: 6 readings, 5 s apart, ending now
  const initTimestamps = () => {
    const now = Date.now();
    return Array.from({ length: 6 }, (_, i) => fmt(new Date(now - (5 - i) * 5000)));
  };
  const [trendTimestamps, setTrendTimestamps] = useState<string[]>(initTimestamps);

  useEffect(() => {
    // Simulate API fetch
    const wp = MOCK_WP_DATA[id as keyof typeof MOCK_WP_DATA] || MOCK_WP_DATA["wp-1"];
    setData(wp);
    if (wp) {
      setEditForm({
        lat: wp.config.location.lat,
        lon: wp.config.location.lon,
        age: wp.config.infrastructureAge,
        distance: wp.config.distanceToPlant,
        density: wp.config.populationDensity,
        impacted: wp.config.populationImpacted,
        priority: wp.config.priorityLevel,
        team: wp.conditions.repairTeamAvailability,
        responsiveness: wp.conditions.localAuthorityResponsiveness
      });
    }
  }, [id]);

  // Sensor bounds moved to module scope (SENSOR_BOUNDS)
  // Live simulation — new reading every 5 s
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev;
        const newSensors = prev.sensors.map(sensor => {
          const bounds = SENSOR_BOUNDS[sensor.type];
          if (!bounds) return sensor;
          const [min, max, delta] = bounds;
          const change = (Math.random() * 2 - 1) * delta;
          const newVal = Math.min(max, Math.max(min, parseFloat((sensor.value + change).toFixed(2))));
          const newTrend = [...sensor.trend.slice(1), newVal];
          return { ...sensor, value: newVal, trend: newTrend };
        });
        return { ...prev, sensors: newSensors };
      });
      const now = new Date();
      setTrendTimestamps(prev => [...prev.slice(1), fmt(now)]);
      setLastUpdate(now);
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!data]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    
    // Update local state (mocking save)
    const updatedData: WaterPoint = {
      ...data,
      config: {
        ...data.config,
        location: { lat: parseFloat(editForm.lat), lon: parseFloat(editForm.lon) },
        infrastructureAge: parseInt(editForm.age),
        distanceToPlant: parseFloat(editForm.distance),
        populationDensity: parseInt(editForm.density),
        populationImpacted: parseInt(editForm.impacted),
        priorityLevel: parseInt(editForm.priority) as any
      },
      conditions: {
        ...data.conditions,
        repairTeamAvailability: parseInt(editForm.team),
        localAuthorityResponsiveness: parseFloat(editForm.responsiveness)
      }
    };
    
    setData(updatedData);
    setShowEditModal(false);
  };

  if (!data) return <div className="page-container">Loading telemetry...</div>;

  const isAdmin = hasAnyRole(["admin"]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumbs mb-8">
          <Link to="/dashboard/infrastructure">Infrastructure</Link> / <span>{data.name}</span>
        </div>
        <div className="flex-between">
          <div>
            <h1>Telemetry Insights</h1>
            <p style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Live graphical data from {data.locationName}.
              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            </p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
              Edit Configuration
            </button>
          )}
        </div>
      </div>

      {/* Main 3-column grid: charts | info | config */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 280px', gap: '24px', marginTop: '24px', alignItems: 'start' }}>

        {/* Telemetry Charts */}
        <div>
          <div className="grid-2 flex-gap">
            {data.sensors.map((sensor) => {
              const color = SENSOR_COLORS[sensor.type] || '#10b981';
              const bounds = SENSOR_BOUNDS[sensor.type];
              return (
              <div
                key={sensor.id}
                className="card telemetry-insight-card"
                onClick={() => setSelectedSensor(sensor)}
                style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
              >
                {/* Status accent bar */}
                {(() => {
                  const status = SENSOR_THRESHOLDS[sensor.type]?.(sensor.value) ?? "normal";
                  const st = STATUS_STYLE[status];
                  return (
                    <div style={{ height: '3px', background: st.dot, borderRadius: '4px 4px 0 0', margin: '-16px -16px 16px' }} />
                  );
                })()}
                <div className="flex-between mb-16">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <span className="item-subtitle">{sensor.type}</span>
                      <h2 style={{ margin: '2px 0 0', fontSize: '1.6rem' }}>
                        {sensor.value} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{sensor.unit}</span>
                      </h2>
                    </div>
                  </div>
                  {(() => {
                    const status = SENSOR_THRESHOLDS[sensor.type]?.(sensor.value) ?? "normal";
                    const st = STATUS_STYLE[status];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', background: st.bg, color: st.color, borderRadius: '4px', padding: '2px 7px', transition: 'background 0.4s, color 0.4s' }}>
                          {st.label.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Live</span>
                      </div>
                    );
                  })()}
                </div>
                <MiniChart
                  data={sensor.trend}
                  color={color}
                  timestamps={trendTimestamps}
                />
                <div style={{ marginTop: '6px', fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>Click to expand →</div>
              </div>
              );
            })}
          </div>

          {/* Sensor Legend — collapsible */}
          <div className="card mt-24">
            <button
              onClick={() => setShowLegend(v => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <h3 className="dashboard-section-title" style={{ margin: 0 }}>Sensor Behaviour Legend</h3>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showLegend ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showLegend && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {data.sensors.map(sensor => {
                  const legend = SENSOR_LEGEND[sensor.type];
                  if (!legend) return null;
                  const color = SENSOR_COLORS[sensor.type] || '#10b981';
                  return (
                    <div key={sensor.id} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '12px', paddingTop: '4px', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#10233c' }}>{sensor.type}</strong>
                        {legend.range && <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', padding: '1px 6px' }}>{legend.range}</span>}
                      </div>
                      <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#475569' }}><em>Measures:</em> {legend.measures}</p>
                      <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#64748b' }}>{legend.whyWARS}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Point Info column */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div className="card mb-24">
            <h3 className="dashboard-section-title">Point Information</h3>
            <div className="info-list mt-16">
              <div className="info-item mb-12">
                <label className="item-subtitle">Hardware ID</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.hardwareId}</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Installation Date</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.installationDate}</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Infrastructure Age</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.config.infrastructureAge} years</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Last Maintenance</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.lastMaintenance}</p>
              </div>
              <div className="info-item">
                <label className="item-subtitle">Assigned Sector</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.assignedSector}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="dashboard-section-title">Operating Conditions</h3>
            <div className="info-list mt-16">
              <div className="info-item mb-12">
                <label className="item-subtitle">Repair Team Availability</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.conditions.repairTeamAvailability} technicians</p>
              </div>
              <div className="info-item">
                <label className="item-subtitle">Authority Responsiveness</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{Math.round(data.conditions.localAuthorityResponsiveness * 100)}%</p>
              </div>
            </div>
            <hr className="divider my-24" />
            <button className="btn btn-outline w-full">Request Diagnostics</button>
          </div>
        </div>

        {/* More Details column */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div className="card">
            <h3 className="dashboard-section-title">More Details</h3>
            <div className="info-list mt-16">
              <div className="info-item mb-12">
                <label className="item-subtitle">Coordinates</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.config.location.lat}, {data.config.location.lon}</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Dist. to Treatment Plant</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.config.distanceToPlant} km</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Population Density</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.config.populationDensity} / km²</p>
              </div>
              <div className="info-item mb-12">
                <label className="item-subtitle">Population Impacted</label>
                <p className="item-title" style={{ fontSize: '0.9rem' }}>{data.config.populationImpacted} people</p>
              </div>
              <div className="info-item">
                <label className="item-subtitle">Priority Level</label>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div
                      key={lvl}
                      style={{
                        width: '20px',
                        height: '6px',
                        borderRadius: '3px',
                        background: lvl <= data.config.priorityLevel ? '#ef4444' : '#e2e8f0'
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: '#64748b' }}>{data.config.priorityLevel}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sensor Detail Chart Modal */}
      {selectedSensor && (
        <SensorChartModal
          sensor={selectedSensor}
          color={SENSOR_COLORS[selectedSensor.type] || '#10b981'}
          bounds={SENSOR_BOUNDS[selectedSensor.type] ?? [0, 100, 1]}
          onClose={() => setSelectedSensor(null)}
        />
      )}

      {/* Admin Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2>Edit Admin Configuration</h2>
            <p className="mb-24">Update the fixed registration and operational parameters for this WaterPoint.</p>
            
            <form onSubmit={handleSaveConfig}>
              <div className="grid-2 flex-gap mb-16">
                <div className="filter-group">
                  <label>Latitude</label>
                  <input 
                    type="number" step="0.0001" 
                    value={editForm.lat} 
                    onChange={e => setEditForm({...editForm, lat: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div className="filter-group">
                  <label>Longitude</label>
                  <input 
                    type="number" step="0.0001" 
                    value={editForm.lon} 
                    onChange={e => setEditForm({...editForm, lon: e.target.value})}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="grid-2 flex-gap mb-16">
                <div className="filter-group">
                  <label>Infrastructure Age (Years)</label>
                  <input 
                    type="number" 
                    value={editForm.age} 
                    onChange={e => setEditForm({...editForm, age: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div className="filter-group">
                  <label>Dist. to Plant (km)</label>
                  <input 
                    type="number" step="0.1" 
                    value={editForm.distance} 
                    onChange={setEditForm ? (e => setEditForm({...editForm, distance: e.target.value})) : undefined}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="grid-2 flex-gap mb-16">
                <div className="filter-group">
                  <label>Population Density</label>
                  <input 
                    type="number" 
                    value={editForm.density} 
                    onChange={e => setEditForm({...editForm, density: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div className="filter-group">
                  <label>Population Impacted</label>
                  <input 
                    type="number" 
                    value={editForm.impacted} 
                    onChange={e => setEditForm({...editForm, impacted: e.target.value})}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="grid-2 flex-gap mb-24">
                <div className="filter-group">
                  <label>Priority Level (1-5)</label>
                  <select 
                    value={editForm.priority} 
                    onChange={e => setEditForm({...editForm, priority: e.target.value})}
                    className="input-field"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Team Availability</label>
                  <input 
                    type="number" min="0" max="5" 
                    value={editForm.team} 
                    onChange={e => setEditForm({...editForm, team: e.target.value})}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="filter-group mb-24">
                <label>Authority Responsiveness (0-1)</label>
                <input 
                  type="number" step="0.1" min="0" max="1" 
                  value={editForm.responsiveness} 
                  onChange={e => setEditForm({...editForm, responsiveness: e.target.value})}
                  className="input-field" 
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Save Configuration</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

