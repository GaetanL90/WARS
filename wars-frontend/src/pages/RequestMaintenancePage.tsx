import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getTechnicians } from "../api/authApi";
import type { AuthUser } from "../auth/types";

export function RequestMaintenancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch technicians from the shared mock API
  useEffect(() => {
    getTechnicians().then(data => {
      setTechnicians(data);
      setIsLoading(false);
    });
  }, []);

  // Pre-fill description if passed via state (from telemetry dashboard)
  useEffect(() => {
    if (location.state && location.state.anomalies) {
      const anomalies = location.state.anomalies as string[];
      if (anomalies.length > 0) {
        setDescription(`AI detected the following anomalies: ${anomalies.join(", ")}. Please inspect the node immediately.`);
      }
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech || !description) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Auto-navigate back after 3 seconds
      setTimeout(() => {
        navigate(`/dashboard/infrastructure/water-point/${id}`);
      }, 3000);
    }, 1500);
  };

  const selectedTechnician = technicians.find(t => String(t.user_id) === selectedTech);

  if (isSuccess) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card shadow-2xl p-48" style={{ maxWidth: '500px', textAlign: 'center', animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#ecfdf5', 
            color: '#10b981', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '3rem', 
            margin: '0 auto 24px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#0f172a' }}>Technician Dispatched</h1>
          <p className="item-subtitle" style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Maintenance case has been successfully assigned to <strong style={{ color: '#1e293b' }}>{selectedTechnician?.full_name}</strong>. 
            The technician will receive all telemetry diagnostics immediately.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em' }}>Assignment Details</div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Priority</span>
                <span className={`urgency-pill urgency-${priority === 'critical' ? 'critical' : priority === 'high' ? 'medium' : 'low'}`} style={{ fontSize: '0.7rem' }}>{priority.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Specialty</span>
                <span style={{ color: '#1e293b', fontSize: '0.85rem', fontWeight: 700 }}>{selectedTechnician?.expertise || 'General'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary w-full" onClick={() => navigate(`/dashboard/infrastructure/water-point/${id}`)}>
              Return to Dashboard
            </button>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Auto-redirecting in 3 seconds...</p>
          </div>
        </div>
        <style>{`
          @keyframes scaleUp {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumbs mb-8">
          <span onClick={() => navigate("/dashboard/infrastructure")} style={{ cursor: "pointer", color: "#6366f1" }}>Infrastructure</span> 
          {" / "}
          <span onClick={() => navigate(`/dashboard/infrastructure/water-point/${id}`)} style={{ cursor: "pointer", color: "#6366f1" }}>Water Point</span>
          {" / Request Maintenance"}
        </div>
        <h1>Request Maintenance Assignment</h1>
        <p className="item-subtitle">Dispatch a technician to address node anomalies or general infrastructure issues.</p>
      </div>

      <div className="max-w-800 mt-24">
        <form onSubmit={handleSubmit} className="card shadow-lg p-32">
          <div className="form-group mb-24">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Select Technician</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {isLoading ? (
                <p>Loading staff...</p>
              ) : (
                technicians.map((tech) => (
                  <div 
                    key={tech.user_id} 
                    onClick={() => setSelectedTech(String(tech.user_id))}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '12px', 
                      border: `2px solid ${selectedTech === String(tech.user_id) ? '#6366f1' : '#f1f5f9'}`,
                      background: selectedTech === String(tech.user_id) ? '#f5f3ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{tech.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{tech.expertise || 'Generalist'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px', fontWeight: 600 }}>{tech.zone_id || 'Global'}</div>
                  </div>
                ))
              )}
              {!isLoading && technicians.length === 0 && <p>No technicians available in the registry.</p>}
            </div>
          </div>

          <div className="form-group mb-24">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Maintenance Priority</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {["low", "medium", "high", "critical"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`urgency-pill urgency-${p === 'critical' ? 'critical' : p === 'high' ? 'medium' : 'low'}`}
                  style={{ 
                    opacity: priority === p ? 1 : 0.4, 
                    transform: priority === p ? 'scale(1.1)' : 'scale(1)',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group mb-32">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Issue Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's wrong with the water point or water quality..."
              style={{ 
                width: '100%', 
                minHeight: '150px', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                lineHeight: 1.6
              }}
              required
            />
          </div>

          <div className="flex-between">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-outline"
              style={{ padding: '12px 24px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || !selectedTech || !description}
              style={{ padding: '12px 32px' }}
            >
              {isSubmitting ? "Dispatching..." : "Dispatch Technician"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
