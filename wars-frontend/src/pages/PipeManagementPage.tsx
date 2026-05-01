import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Pipe = {
  pipe_id: string;
  label: string;
  material: string;
  diameter_mm: number;
  from_zone: string;
  to_zone: string;
  from_point: string;
  to_point: string;
  install_date: string;       // ISO date string
  rated_lifespan_years: number;
  notes?: string;
};

const ZONES = ["Nyamata Center", "Kabeza Bypass", "Nyarutarama North"];
const WATER_POINTS = ["Water Point #101", "Water Point #102", "Water Point #201", "Water Point #301"];
const MATERIALS = ["PVC", "HDPE", "Ductile Iron", "Steel", "GRP", "Copper"];

const INITIAL_PIPES: Pipe[] = [
  {
    pipe_id: "p-1", label: "Main Trunk — Nyamata to Kabeza", material: "Ductile Iron", diameter_mm: 200,
    from_zone: "Nyamata Center", to_zone: "Kabeza Bypass",
    from_point: "Water Point #101", to_point: "Water Point #201",
    install_date: "2015-03-12", rated_lifespan_years: 25, notes: "Primary distribution trunk. Subject to high pressure."
  },
  {
    pipe_id: "p-2", label: "Sector HQ Branch", material: "PVC", diameter_mm: 110,
    from_zone: "Nyamata Center", to_zone: "Nyamata Center",
    from_point: "Water Point #101", to_point: "Water Point #102",
    install_date: "2018-07-20", rated_lifespan_years: 20,
  },
  {
    pipe_id: "p-3", label: "Hospital Road Feed", material: "HDPE", diameter_mm: 90,
    from_zone: "Kabeza Bypass", to_zone: "Nyarutarama North",
    from_point: "Water Point #201", to_point: "Water Point #301",
    install_date: "2020-01-05", rated_lifespan_years: 30, notes: "New line, excellent condition."
  },
];

function getRiskLevel(pipe: Pipe): { label: string; color: string; pct: number } {
  const install = new Date(pipe.install_date).getTime();
  const wearOut = install + pipe.rated_lifespan_years * 365.25 * 24 * 3600 * 1000;
  const now = Date.now();
  const pct = Math.min(100, Math.round(((now - install) / (wearOut - install)) * 100));
  if (pct >= 80) return { label: "Critical", color: "#ef4444", pct };
  if (pct >= 55) return { label: "High", color: "#f59e0b", pct };
  if (pct >= 30) return { label: "Moderate", color: "#3b82f6", pct };
  return { label: "Low", color: "#10b981", pct };
}

function wearOutDate(pipe: Pipe): string {
  const d = new Date(pipe.install_date);
  d.setFullYear(d.getFullYear() + pipe.rated_lifespan_years);
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}



const emptyForm = {
  label: "", material: "PVC", diameter_mm: 110,
  from_zone: "", to_zone: "", from_point: "", to_point: "",
  install_date: "", rated_lifespan_years: 20, notes: ""
};

export function PipeManagementPage() {
  const navigate = useNavigate();
  const [pipes, setPipes] = useState<Pipe[]>(INITIAL_PIPES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });
  const [filterRisk, setFilterRisk] = useState("all");

  const close = () => { setIsModalOpen(false); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPipes(prev => [...prev, { ...form, pipe_id: `p-${Date.now()}` }]);
    close();
  };

  const filteredPipes = pipes.filter(p => {
    if (filterRisk === "all") return true;
    return getRiskLevel(p).label.toLowerCase() === filterRisk;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Pipe Network Registry</h1>
            <p>Track pipe segments, their routes, material lifespans, and burst risk predictions.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusIcon /> Register Pipe
          </button>
        </div>
      </div>

      {/* Risk summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px', marginBottom: '8px' }}>
        {[
          { label: "Critical Risk", risk: "critical", color: "#ef4444", bg: "#fef2f2" },
          { label: "High Risk", risk: "high", color: "#f59e0b", bg: "#fffbeb" },
          { label: "Moderate Risk", risk: "moderate", color: "#3b82f6", bg: "#eff6ff" },
          { label: "Low Risk", risk: "low", color: "#10b981", bg: "#ecfdf5" },
        ].map(({ label, risk, color, bg }) => {
          const count = pipes.filter(p => getRiskLevel(p).label.toLowerCase() === risk).length;
          return (
            <button key={risk} onClick={() => setFilterRisk(filterRisk === risk ? "all" : risk)}
              style={{ background: filterRisk === risk ? color : bg, color: filterRisk === risk ? 'white' : color, border: `1px solid ${color}33`, borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <p style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800 }}>{count}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
            </button>
          );
        })}
      </div>
      {filterRisk !== "all" && (
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', marginBottom: '8px' }} onClick={() => setFilterRisk("all")}>
          ✕ Clear filter
        </button>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Pipe / Route</th>
                <th>Material · Ø</th>
                <th>Installed</th>
                <th>Wear-Out Date</th>
                <th>Burst Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPipes.map(pipe => {
                const risk = getRiskLevel(pipe);
                return (
                  <tr key={pipe.pipe_id}>
                    <td>
                      <span className="item-title" style={{ fontWeight: 700 }}>{pipe.label}</span>
                      <div className="item-subtitle" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                        {pipe.from_zone} ({pipe.from_point}) → {pipe.to_zone} ({pipe.to_point})
                      </div>
                    </td>
                    <td>
                      <span className="badge-outline">{pipe.material}</span>
                      <span className="item-subtitle" style={{ marginLeft: '6px', fontSize: '0.78rem' }}>Ø {pipe.diameter_mm}mm</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(pipe.install_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{wearOutDate(pipe)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '64px', background: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${risk.pct}%`, background: risk.color, height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: risk.color }}>{risk.label}</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/dashboard/infrastructure/pipes/${pipe.pipe_id}`)}>Details</button>
                    </td>
                  </tr>
                );
              })}
              {filteredPipes.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No pipes match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="flex-between mb-20">
              <h2>Register Pipe Segment</h2>
              <button className="btn btn-icon" onClick={close}>×</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                <div className="form-group mb-14">
                  <label>Pipe Label / Identifier <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" className="input-field" placeholder="e.g. Main Trunk — Nyamata to Kabeza" value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Material <span style={{ color: '#ef4444' }}>*</span></label>
                    <select className="input-field" value={form.material} onChange={e => setForm(f => ({...f, material: e.target.value}))}>
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diameter (mm) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="number" className="input-field" min={10} value={form.diameter_mm} onChange={e => setForm(f => ({...f, diameter_mm: Number(e.target.value)}))} required />
                  </div>
                </div>

                <p className="item-subtitle mb-10" style={{ fontWeight: 700, fontSize: '0.78rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Route — From</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>From Zone <span style={{ color: '#ef4444' }}>*</span></label>
                    <select className="input-field" value={form.from_zone} onChange={e => setForm(f => ({...f, from_zone: e.target.value}))} required>
                      <option value="">— Select Zone —</option>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>From Water Point <span style={{ color: '#ef4444' }}>*</span></label>
                    <select className="input-field" value={form.from_point} onChange={e => setForm(f => ({...f, from_point: e.target.value}))} required>
                      <option value="">— Select Point —</option>
                      {WATER_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <p className="item-subtitle mb-10" style={{ fontWeight: 700, fontSize: '0.78rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Route — To</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>To Zone <span style={{ color: '#ef4444' }}>*</span></label>
                    <select className="input-field" value={form.to_zone} onChange={e => setForm(f => ({...f, to_zone: e.target.value}))} required>
                      <option value="">— Select Zone —</option>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Water Point <span style={{ color: '#ef4444' }}>*</span></label>
                    <select className="input-field" value={form.to_point} onChange={e => setForm(f => ({...f, to_point: e.target.value}))} required>
                      <option value="">— Select Point —</option>
                      {WATER_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <p className="item-subtitle mb-10" style={{ fontWeight: 700, fontSize: '0.78rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Manufacturer Data</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Installation Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="date" className="input-field" value={form.install_date} onChange={e => setForm(f => ({...f, install_date: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label>Rated Lifespan (years) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="number" className="input-field" min={1} max={100} value={form.rated_lifespan_years} onChange={e => setForm(f => ({...f, rated_lifespan_years: Number(e.target.value)}))} required />
                  </div>
                </div>

                {form.install_date && form.rated_lifespan_years > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#15803d' }}>
                    📅 Predicted wear-out: <strong>{(() => { const d = new Date(form.install_date); d.setFullYear(d.getFullYear() + form.rated_lifespan_years); return d.toLocaleDateString("en-GB", { year: "numeric", month: "long" }); })()}</strong>
                  </div>
                )}

                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} style={{ resize: 'vertical' }} />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Pipe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
