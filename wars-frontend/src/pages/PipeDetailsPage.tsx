import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MOCK_PIPES = [
  { pipe_id: "p-1", label: "Main Trunk — Nyamata to Kabeza", material: "Ductile Iron", diameter_mm: 200, from_zone: "Nyamata Center", to_zone: "Kabeza Bypass", from_point: "Water Point #101", to_point: "Water Point #201", install_date: "2015-03-12", rated_lifespan_years: 25, notes: "Primary distribution trunk. Subject to high pressure." },
  { pipe_id: "p-2", label: "Sector HQ Branch", material: "PVC", diameter_mm: 110, from_zone: "Nyamata Center", to_zone: "Nyamata Center", from_point: "Water Point #101", to_point: "Water Point #102", install_date: "2018-07-20", rated_lifespan_years: 20, notes: "" },
  { pipe_id: "p-3", label: "Hospital Road Feed", material: "HDPE", diameter_mm: 90, from_zone: "Kabeza Bypass", to_zone: "Nyarutarama North", from_point: "Water Point #201", to_point: "Water Point #301", install_date: "2020-01-05", rated_lifespan_years: 30, notes: "New line, excellent condition." },
];

function getRiskLevel(pipe: typeof MOCK_PIPES[0]): { label: string; color: string; pct: number } {
  const install = new Date(pipe.install_date).getTime();
  const wearOut = install + pipe.rated_lifespan_years * 365.25 * 24 * 3600 * 1000;
  const pct = Math.min(100, Math.round(((Date.now() - install) / (wearOut - install)) * 100));
  if (pct >= 80) return { label: "Critical", color: "#ef4444", pct };
  if (pct >= 55) return { label: "High", color: "#f59e0b", pct };
  if (pct >= 30) return { label: "Moderate", color: "#3b82f6", pct };
  return { label: "Low", color: "#10b981", pct };
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path><path d="M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="item-subtitle" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{value ?? '—'}</p>
    </div>
  );
}

export function PipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const pipe = MOCK_PIPES.find(p => p.pipe_id === id);

  if (!pipe) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <h2>Pipe Record Not Found</h2>
        <p className="item-subtitle">This pipe segment does not exist in the registry.</p>
        <button className="btn btn-primary mt-24" onClick={() => navigate('/dashboard/infrastructure/pipes')}>Back to Pipe Network</button>
      </div>
    );
  }

  const risk = getRiskLevel(pipe);
  const wearOut = new Date(pipe.install_date);
  wearOut.setFullYear(wearOut.getFullYear() + pipe.rated_lifespan_years);

  return (
    <div className="page-container">
      <button className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }} onClick={() => navigate('/dashboard/infrastructure/pipes')}>
        <BackIcon /> Pipe Network Registry
      </button>

      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1 style={{ marginBottom: '4px' }}>{pipe.label}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge-outline">{pipe.material}</span>
              <span className="badge-outline">Ø {pipe.diameter_mm}mm</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: risk.color }}>● {risk.label} Risk</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate(`/dashboard/infrastructure/pipes/${id}/edit`)}>
              <EditIcon /> Edit Record
            </button>
            <button className="btn" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowDeleteConfirm(true)}>
              <TrashIcon /> Delete
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <h3 className="dashboard-section-title mb-16">Route</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InfoRow label="From Zone" value={pipe.from_zone} />
            <InfoRow label="From Water Point" value={pipe.from_point} />
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
              <InfoRow label="To Zone" value={pipe.to_zone} />
            </div>
            <InfoRow label="To Water Point" value={pipe.to_point} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 className="dashboard-section-title mb-16">Manufacturer Data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InfoRow label="Installation Date" value={new Date(pipe.install_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })} />
              <InfoRow label="Rated Lifespan" value={`${pipe.rated_lifespan_years} years`} />
              <InfoRow label="Projected Wear-Out" value={wearOut.toLocaleDateString("en-GB", { year: "numeric", month: "long" })} />
            </div>
          </div>

          <div className="card">
            <h3 className="dashboard-section-title mb-12">Burst Risk Forecast</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: risk.color, margin: '0 0 10px', lineHeight: 1 }}>{risk.pct}%</p>
            <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ width: `${risk.pct}%`, background: risk.color, height: '100%', transition: 'width 0.6s' }}></div>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: risk.color }}>{risk.label} Risk Level</span>
            <p className="item-subtitle" style={{ fontSize: '0.75rem', marginTop: '6px' }}>
              Based on age vs manufacturer-rated lifespan.
            </p>
          </div>
        </div>

        {pipe.notes && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="dashboard-section-title mb-12">Operational Notes</h3>
            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.7', background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a', margin: 0 }}>
              {pipe.notes}
            </p>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px' }}>Delete Pipe Record?</h2>
            <p className="item-subtitle" style={{ marginBottom: '8px' }}>
              You are about to permanently remove <strong style={{ color: '#1e293b' }}>{pipe.label}</strong> from the registry.
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '32px' }}>This cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={() => navigate('/dashboard/infrastructure/pipes')}>
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
