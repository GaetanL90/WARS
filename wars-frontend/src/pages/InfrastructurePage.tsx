import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock Data (matches ERD)
const INITIAL_ZONES = [
  { 
    zone_id: "zone-a", 
    zone_name: "Nyamata Center", 
    district: "Bugesera",
    pointCount: 12,
    health: 98,
    waterPoints: [
      { point_id: "wp-1", name: "Water Point #101", status: "online", location: "Main Market", sensors: [
        { sensor_id: "s-1", type: "Flow", value: "12.5", unit: "L/s", status: "online" },
        { sensor_id: "s-2", type: "Pressure", value: "3.2", unit: "Bar", status: "online" }
      ]},
      { point_id: "wp-2", name: "Water Point #102", status: "warning", location: "Sector HQ", sensors: [
        { sensor_id: "s-3", type: "Flow", value: "0.0", unit: "L/s", status: "warning" }
      ]},
    ]
  },
  { 
    zone_id: "zone-b", 
    zone_name: "Kabeza Bypass", 
    district: "Bugesera",
    pointCount: 8,
    health: 100,
    waterPoints: [
      { point_id: "wp-3", name: "Water Point #201", status: "online", location: "Hospital Road", sensors: [
        { sensor_id: "s-5", type: "Flow", value: "8.2", unit: "L/s", status: "online" }
      ]}
    ]
  },
];

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

export function InfrastructurePage() {
  const navigate = useNavigate();
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [expandedZones, setExpandedZones] = useState<string[]>(["zone-a"]);
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // Form states

  const [sensorForm, setSensorForm] = useState({ type: "Flow", unit: "L/s", status: "online" });

  const toggleZone = (id: string) => {
    setExpandedZones(prev => prev.includes(id) ? prev.filter(zid => zid !== id) : [...prev, id]);
  };





  const openSensorModal = (e: any, pointId: string, sensor: any = null) => {
    e.stopPropagation();
    setParentId(pointId);
    setEditingItem(sensor);
    setSensorForm(sensor ? { type: sensor.type, unit: sensor.unit, status: sensor.status } : { type: "Flow", unit: "L/s", status: "online" });
    setActiveModal('sensor');
  };





  const handleSaveSensor = () => {
    if (editingItem) {
      setZones(prev => prev.map(z => ({
        ...z,
        waterPoints: z.waterPoints.map(p => ({
          ...p,
          sensors: p.sensors.map(s => s.sensor_id === editingItem.sensor_id ? { ...s, ...sensorForm } : s)
        }))
      })));
    } else {
      setZones(prev => prev.map(z => ({
        ...z,
        waterPoints: z.waterPoints.map(p => p.point_id === parentId ? {
          ...p,
          sensors: [...p.sensors, { ...sensorForm, sensor_id: `s-${Date.now()}`, value: "0.0" }]
        } : p)
      })));
    }
    setActiveModal(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between w-full">
          <div>
            <h1>Infrastructure Command</h1>
            <p>Monitor and manage the hierarchical water distribution network.</p>
          </div>
          <button className="btn btn-primary btn-with-icon" onClick={() => navigate('/dashboard/infrastructure/zones/new')}>
            <PlusIcon /> New Zone
          </button>
        </div>
      </div>

      <div className="infrastructure-grid mt-24">
        {zones.map(zone => (
          <div key={zone.zone_id} className={`infra-zone-card card ${expandedZones.includes(zone.zone_id) ? 'expanded' : ''}`}>
            <div className="infra-zone-header" onClick={() => toggleZone(zone.zone_id)}>
              <div className="infra-zone-info">
                <div className="flex-gap">
                  <h3 className="item-title" style={{ fontSize: '1.25rem' }}>{zone.zone_name}</h3>
                  <span className="badge-outline" style={{ fontSize: '0.65rem' }}>{zone.district}</span>
                </div>
                <div className="infra-zone-meta flex-gap mt-4">
                  <span className="item-subtitle"><MapPinIcon /> {zone.pointCount} Water Points</span>
                  <span className="item-subtitle" style={{ color: zone.health > 90 ? '#10b981' : '#f59e0b' }}>
                    <ActivityIcon /> {zone.health}% Health
                  </span>
                </div>
              </div>
              <div className="infra-zone-actions flex-gap">
                <button className="btn btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/infrastructure/zones/${zone.zone_id}/edit`); }} title="Edit Zone"><EditIcon /></button>

                <div className={`chevron-icon ${expandedZones.includes(zone.zone_id) ? 'rotate' : ''}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {expandedZones.includes(zone.zone_id) && (
              <div className="infra-zone-content">
                <div className="infra-points-list">
                  {zone.waterPoints.map(point => (
                    <div key={point.point_id} className="infra-point-item">
                      <div className="infra-point-header flex-between">
                        <div className="infra-point-main">
                          <div className="flex-gap">
                            <span className="item-title">{point.name}</span>
                            <span className={`status-dot ${point.status === 'online' ? 'status-online' : 'status-warning'}`}></span>
                          </div>
                          <p className="item-subtitle">{point.location}</p>
                        </div>
                        <div className="infra-point-actions flex-gap">
                          <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/dashboard/infrastructure/water-point/${point.point_id}`)}>
                            Telemetry
                          </button>
                          <button className="btn btn-icon btn-sm" onClick={() => navigate(`/dashboard/infrastructure/water-point/${point.point_id}/config`)} title="Edit Configuration"><EditIcon /></button>
                          <button className="btn btn-sm btn-outline btn-icon" onClick={(e) => openSensorModal(e, point.point_id)} title="Add Sensor">
                            <PlusIcon />
                          </button>
                        </div>
                      </div>

                      <div className="infra-sensors-row mt-12">
                        {point.sensors.map(sensor => (
                          <div key={sensor.sensor_id} className="infra-sensor-pill" onClick={(e) => openSensorModal(e, point.point_id, sensor)}>
                            <span className="sensor-type">{sensor.type}</span>
                            <span className="sensor-val">{sensor.value}{sensor.unit}</span>
                            <EditIcon />
                          </div>
                        ))}
                        {point.sensors.length === 0 && (
                          <span className="item-subtitle" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>No sensors attached</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {zone.waterPoints.length === 0 && (
                    <div className="empty-state-subtle">
                      <p>No distribution points registered in this zone.</p>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals - Reusing existing patterns but with cleaner layout */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between mb-24">
              <h2>{editingItem ? 'Update' : 'Register'} {activeModal === 'point' ? 'Water Point' : 'Sensor'}</h2>
              <button className="btn btn-icon" onClick={() => setActiveModal(null)}>×</button>
            </div>
            




            {activeModal === 'sensor' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Telemetry Type</label>
                  <select className="input-field" value={sensorForm.type} onChange={e => setSensorForm({...sensorForm, type: e.target.value})}>
                    <option value="Flow">Flow Rate (L/s)</option>
                    <option value="Pressure">Pressure (Bar)</option>
                    <option value="Quality">Water Quality (pH)</option>
                    <option value="Turbidity">Turbidity (NTU)</option>
                  </select>
                </div>
                <div className="form-group mt-16">
                  <label>Unit of Measure</label>
                  <input type="text" className="input-field" value={sensorForm.unit} onChange={e => setSensorForm({...sensorForm, unit: e.target.value})} />
                </div>
              </div>
            )}

            <div className="modal-footer mt-32">
              <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSensor}>
                {editingItem ? 'Save Changes' : 'Create Entity'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .infra-zone-card {
          margin-bottom: 16px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
        }
        .infra-zone-card.expanded {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border-color: #3b82f6;
        }
        .infra-zone-header {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: white;
          transition: background 0.2s;
          min-height: 84px;
        }
        .infra-zone-header:hover {
          background: #f8fafc;
        }
        .infra-zone-info {
          flex: 1;
          min-width: 0;
          margin-right: 24px;
        }
        .infra-zone-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .infra-zone-actions .btn {
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          white-space: nowrap;
          gap: 8px;
          font-weight: 600;
        }
        .infra-zone-actions .btn-icon {
          width: 40px;
          padding: 0;
        }
        .infra-zone-meta {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          gap: 20px;
          color: #64748b;
        }
        .item-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .chevron-icon {
          transition: transform 0.3s;
          color: #94a3b8;
        }
        .chevron-icon.rotate {
          transform: rotate(180deg);
          color: #3b82f6;
        }
        .infra-zone-content {
          padding: 0 24px 24px 24px;
          border-top: 1px solid #f1f5f9;
        }
        .infra-point-item {
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .infra-point-item:last-child {
          border-bottom: none;
        }
        .infra-point-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .infra-point-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-direction: row !important;
        }
        .infra-point-actions .btn {
          height: 32px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .infra-point-actions .btn-icon {
          width: 32px;
          padding: 0;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-online { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
        .status-warning { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
        
        .infra-sensors-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-left: 0;
        }
        .infra-sensor-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .infra-sensor-pill:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }
        .sensor-type {
          font-weight: 600;
          color: #64748b;
        }
        .sensor-val {
          color: #1e293b;
          font-weight: 700;
        }
        .empty-state-subtle {
          text-align: center;
          padding: 40px 0;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
