import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zoneStore } from "../utils/zoneStore";

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

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="item-subtitle" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>{value || '—'}</p>
    </div>
  );
}

export function ZoneDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  const zone = id ? zoneStore.getById(id) : undefined;

  if (!zone) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <h2>Zone Not Found</h2>
        <p className="item-subtitle">The zone you are looking for does not exist.</p>
        <button className="btn btn-primary mt-24" onClick={() => navigate('/dashboard/infrastructure/zones')}>Back to Zone Directory</button>
      </div>
    );
  }

  const handleDelete = () => {
    if (id) {
      zoneStore.delete(id);
      navigate('/dashboard/infrastructure/zones');
    }
  };

  return (
    <div className="page-container">
      {/* Back nav */}
      <button className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }} onClick={() => navigate('/dashboard/infrastructure/zones')}>
        <BackIcon /> Zone Directory
      </button>

      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1 style={{ marginBottom: '4px' }}>{zone.name}</h1>
            <div className="flex-gap" style={{ gap: '8px' }}>
              <span className="badge-outline">{zone.district}</span>
              <span className={`status-pill ${zone.status === 'stable' ? 'status-resolved' : 'status-pending'}`}>{zone.status}</span>
            </div>
          </div>
          <div className="flex-gap" style={{ gap: '10px' }}>
            <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate(`/dashboard/infrastructure/zones/${id}/edit`)}>
              <EditIcon /> Edit Zone
            </button>
            <button className="btn" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowDeleteConfirm(true)}>
              <TrashIcon /> Delete
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left: Identity */}
        <div>
          <div className="card mb-24">
            <h3 className="dashboard-section-title mb-16">Villages in Zone</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {(zone.villages || []).length > 0 ? (
                zone.villages?.map(v => (
                  <div key={v.id} 
                    style={{ 
                      padding: '16px', 
                      background: selectedVillageId === v.id ? '#f0f7ff' : '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid',
                      borderColor: selectedVillageId === v.id ? '#3b82f6' : '#e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedVillageId(selectedVillageId === v.id ? null : v.id)}
                  >
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{v.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {selectedVillageId === v.id ? 'Hide Hierarchy' : 'View Hierarchy'}
                      </span>
                    </div>

                    {selectedVillageId === v.id && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <InfoRow label="Province" value={zone.province} />
                        <InfoRow label="District" value={zone.district} />
                        <InfoRow label="Sector" value={v.sector} />
                        <InfoRow label="Cell" value={v.cell} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic' }}>
                  No villages registered for this zone.
                </div>
              )}
            </div>
          </div>

          {zone.notes && (
            <div className="card">
              <h3 className="dashboard-section-title mb-12">Operational Notes</h3>
              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.7', background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a', margin: 0 }}>
                {zone.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Health & Assets */}
        <div>
          <div className="card mb-24">
            <h3 className="dashboard-section-title mb-16">Network Health</h3>
            <p style={{ fontSize: '3rem', fontWeight: 800, color: zone.health > 80 ? '#10b981' : zone.health > 50 ? '#f59e0b' : '#ef4444', margin: '0 0 12px', lineHeight: 1 }}>
              {zone.health}%
            </p>
            <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${zone.health}%`, background: zone.health > 80 ? '#10b981' : zone.health > 50 ? '#f59e0b' : '#ef4444', height: '100%', transition: 'width 0.6s' }}></div>
            </div>
          </div>

          <div className="card">
            <h3 className="dashboard-section-title mb-16">Asset Summary</h3>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1d4ed8', margin: 0, lineHeight: 1 }}>{zone.pointCount}</p>
              <p className="item-subtitle" style={{ marginTop: '4px' }}>Water Points</p>
            </div>
            <button className="btn btn-outline w-full mt-16" onClick={() => navigate('/dashboard/infrastructure')}>
              View Infrastructure
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px' }}>Delete Zone?</h2>
            <p className="item-subtitle" style={{ marginBottom: '8px' }}>
              You are about to permanently delete <strong style={{ color: '#1e293b' }}>{zone.name}</strong>.
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '32px' }}>
              This cannot be undone. All {zone.pointCount} associated water points will be unlinked.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={handleDelete}>
                Yes, Delete Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
