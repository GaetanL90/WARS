import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { WaterPoint } from "../types/sensorTypes";

// Use the same mock data for now
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
      populationDensity: 4500,
      populationImpacted: 12500,
      priorityLevel: 4
    },
    conditions: {
      repairTeamAvailability: 2,
      localAuthorityResponsiveness: 0.85
    },
    sensors: []
  }
};

export function WaterPointConfigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WaterPoint | null>(null);

  const [editForm, setEditForm] = useState({
    name: "", locationName: "", status: "online",
    lat: "", lon: "", age: "", distance: "",
    density: "", impacted: "", priority: "3",
    team: "2", responsiveness: "0.5"
  });

  useEffect(() => {
    // Simulate API fetch
    const wp = MOCK_WP_DATA[id as keyof typeof MOCK_WP_DATA] || MOCK_WP_DATA["wp-1"];
    setData(wp);
    if (wp) {
      setEditForm({
        name: wp.name,
        locationName: wp.locationName,
        status: wp.status,
        lat: wp.config.location.lat.toString(),
        lon: wp.config.location.lon.toString(),
        age: wp.config.infrastructureAge.toString(),
        distance: wp.config.distanceToPlant.toString(),
        density: wp.config.populationDensity.toString(),
        impacted: wp.config.populationImpacted.toString(),
        priority: wp.config.priorityLevel.toString(),
        team: wp.conditions.repairTeamAvailability.toString(),
        responsiveness: wp.conditions.localAuthorityResponsiveness.toString()
      });
    }
  }, [id]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    
    // Simulate save, then navigate back
    console.log("Saving config:", editForm);
    navigate(`/dashboard/infrastructure/water-point/${id}`);
  };

  if (!data) return <div className="page-container">Loading configuration...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumbs mb-8">
          <Link to="/dashboard/infrastructure">Infrastructure</Link> /{" "}
          <Link to={`/dashboard/infrastructure/water-point/${id}`}>{data.name}</Link> /{" "}
          <span>Configuration</span>
        </div>
        <div>
          <h1>Admin Configuration: {data.name}</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            System parameters and operational priority overrides.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '32px' }}>
        <form onSubmit={handleSaveConfig}>
          {/* Section 1: Infrastructure */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></div>
              Identity & Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Point Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="input-field" style={{ background: '#f8fafc' }} />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Operational Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-field" style={{ background: '#f8fafc' }}>
                  <option value="online">Online / Active</option>
                  <option value="warning">Maintenance Warning</option>
                  <option value="outage">Critical Outage</option>
                </select>
              </div>
              <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Location Descriptor</label>
                <input type="text" value={editForm.locationName} onChange={e => setEditForm({...editForm, locationName: e.target.value})} className="input-field" style={{ background: '#f8fafc' }} />
              </div>
            </div>

            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
              Geospatial & Infrastructure
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Latitude</label>
                <input type="number" step="0.0001" value={editForm.lat} onChange={e => setEditForm({...editForm, lat: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px' }} />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Longitude</label>
                <input type="number" step="0.0001" value={editForm.lon} onChange={e => setEditForm({...editForm, lon: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px' }} />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Infrastructure Age</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', width: '100%', paddingRight: '48px' }} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8', pointerEvents: 'none' }}>Years</span>
                </div>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Distance to Plant</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.1" value={editForm.distance} onChange={e => setEditForm({...editForm, distance: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', width: '100%', paddingRight: '48px' }} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8', pointerEvents: 'none' }}>km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Demographics */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              Demographic Impact
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Population Density</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={editForm.density} onChange={e => setEditForm({...editForm, density: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', width: '100%', paddingRight: '48px' }} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8', pointerEvents: 'none' }}>/ km²</span>
                </div>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Total People Impacted</label>
                <input type="number" value={editForm.impacted} onChange={e => setEditForm({...editForm, impacted: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px' }} />
              </div>
            </div>
          </div>

          {/* Section 3: Priority */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
              Operational Priority
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Priority Level</label>
                <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', appearance: 'auto' }}>
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>Level {v} {v === 5 ? '(Critical)' : ''}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Repair Team Availability</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" max="5" value={editForm.team} onChange={e => setEditForm({...editForm, team: e.target.value})} className="input-field" style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', width: '100%', paddingRight: '56px' }} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8', pointerEvents: 'none' }}>Teams</span>
                </div>
              </div>
              <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Authority Responsiveness (0.0 - 1.0)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input type="range" min="0" max="1" step="0.05" value={editForm.responsiveness} onChange={e => setEditForm({...editForm, responsiveness: e.target.value})} style={{ flex: 1, accentColor: '#3b82f6' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', width: '48px', textAlign: 'right' }}>{Math.round(parseFloat(editForm.responsiveness) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 500, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>Save Configuration</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/dashboard/infrastructure/water-point/${id}`)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 500 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
