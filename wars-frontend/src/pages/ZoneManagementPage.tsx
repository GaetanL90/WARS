import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zoneStore, Zone } from "../utils/zoneStore";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export function ZoneManagementPage() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    setZones(zoneStore.getAll());
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Zone Governance</h1>
            <p>Manage distribution zones from province down to village level.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/infrastructure/zones/new')}>
            <PlusIcon /> Create New Zone
          </button>
        </div>
      </div>

      <div className="card mt-24">
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Location</th>
                <th>Water Points</th>
                <th>Health</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone.zone_id}>
                  <td>
                    <span className="item-title" style={{ fontWeight: 600 }}>{zone.name}</span>
                    {zone.notes && <div className="item-subtitle" style={{ fontSize: '0.72rem', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{zone.notes}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{zone.district}, {zone.sector}</div>
                    <div className="item-subtitle" style={{ fontSize: '0.72rem' }}>{zone.province} · {zone.cell} · {zone.village}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{zone.pointCount}</span>
                    <span className="item-subtitle" style={{ marginLeft: '4px', fontSize: '0.8rem' }}>pts</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ width: `${zone.health}%`, background: zone.health > 80 ? '#10b981' : zone.health > 50 ? '#f59e0b' : '#ef4444', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{zone.health}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${zone.status === 'stable' ? 'status-resolved' : 'status-pending'}`}>{zone.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/dashboard/infrastructure/zones/${zone.zone_id}`)}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {zones.length === 0 && <p className="item-subtitle" style={{ textAlign: 'center', padding: '32px' }}>No zones registered yet.</p>}
        </div>
      </div>
    </div>
  );
}
