import { useState, useEffect, useCallback, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zoneStore } from "../utils/zoneStore";

const API_BASE_URL = "/api-admin";

interface AdminEntity {
  id: number;
  name: string;
}

export function ZoneCreationPage() {
  const navigate = useNavigate();
  
  // Form State
  const [zoneName, setZoneName] = useState("");
  const [zoneNotes, setZoneNotes] = useState("");
  
  // Added Villages List
  const [selectedVillages, setSelectedVillages] = useState<Array<{ id: number; name: string; sector: string; cell: string }>>([]);

  // Administrative Data States
  const [sectors, setSectors] = useState<AdminEntity[]>([]);
  const [cells, setCells] = useState<AdminEntity[]>([]);
  const [villages, setVillages] = useState<AdminEntity[]>([]);

  // Selection state IDs
  const [sectorId, setSectorId] = useState<number | "">("");
  const [cellId, setCellId] = useState<number | "">("");
  const [villageId, setVillageId] = useState<number | "">("");

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Discovery logic to find Eastern -> Bugesera IDs dynamically
  useEffect(() => {
    async function discoverHierarchy() {
      setLoadingLocations(true);
      setError(null);
      try {
        // 1. Find Eastern Province
        const pRes = await fetch(`${API_BASE_URL}/provinces/?page_size=100`);
        if (!pRes.ok) throw new Error("Failed to fetch provinces");
        const pData = await pRes.json();
        const eastern = (pData.results || []).find((p: AdminEntity) => 
          p.name.toLowerCase().includes("eastern")
        );
        if (!eastern) throw new Error("Eastern province not found.");

        // 2. Find Bugesera District in Eastern
        const dRes = await fetch(`${API_BASE_URL}/districts/?province=${eastern.id}&page_size=100`);
        if (!dRes.ok) throw new Error("Failed to fetch districts");
        const dData = await dRes.json();
        const bugesera = (dData.results || []).find((d: AdminEntity) => 
          d.name.toLowerCase().includes("bugesera")
        );
        if (!bugesera) throw new Error("Bugesera district not found.");

        // 3. Fetch Sectors for Bugesera
        const sRes = await fetch(`${API_BASE_URL}/sectors/?district=${bugesera.id}&page_size=100`);
        if (!sRes.ok) throw new Error("Failed to fetch sectors");
        const sData = await sRes.json();
        setSectors(sData.results || []);
      } catch (err) {
        console.error("Hierarchy discovery failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load location data.");
      } finally {
        setLoadingLocations(false);
      }
    }
    discoverHierarchy();
  }, []);

  const fetchCells = useCallback(async (sId: number) => {
    setLoadingLocations(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cells/?sector=${sId}&page_size=100`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setCells(data.results || []);
    } catch (error) {
      console.error("Failed to fetch cells", error);
      setError("Failed to load cells.");
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchVillages = useCallback(async (cId: number) => {
    setLoadingLocations(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/villages/?cell=${cId}&page_size=100`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setVillages(data.results || []);
    } catch (error) {
      console.error("Failed to fetch villages", error);
      setError("Failed to load villages.");
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const handleSectorChange = (sId: number) => {
    setSectorId(sId);
    setCellId("");
    setVillageId("");
    setCells([]);
    setVillages([]);
    if (sId) fetchCells(sId);
  };

  const handleCellChange = (cId: number) => {
    setCellId(cId);
    setVillageId("");
    setVillages([]);
    if (cId) fetchVillages(cId);
  };

  const handleAddVillage = () => {
    if (!sectorId || !cellId || !villageId) return;

    const vObj = villages.find(v => v.id === villageId);
    const cObj = cells.find(c => c.id === cellId);
    const sObj = sectors.find(s => s.id === sectorId);

    if (vObj && cObj && sObj) {
      // Prevent duplicates
      if (!selectedVillages.find(sv => sv.id === vObj.id)) {
        setSelectedVillages([...selectedVillages, {
          id: vObj.id,
          name: vObj.name,
          cell: cObj.name,
          sector: sObj.name
        }]);
      }
      
      // Reset village selection for next input
      setVillageId("");
    }
  };

  const removeVillage = (vId: number) => {
    setSelectedVillages(selectedVillages.filter(v => v.id !== vId));
  };

  const handleCreateZone = (e: FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || selectedVillages.length < 2) return;

    // Save to localStorage store
    zoneStore.add({
      name: zoneName,
      province: "Eastern Province",
      district: "Bugesera",
      sector: selectedVillages[0]?.sector || "", // Default to first village's sector
      cell: selectedVillages[0]?.cell || "",
      village: selectedVillages[0]?.name || "",
      villages: selectedVillages,
      notes: zoneNotes
    });

    // Navigate back to zones list
    navigate("/dashboard/infrastructure/zones");
  };

  const isValid = zoneName.trim() && selectedVillages.length >= 2;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumbs mb-8">
          <Link to="/dashboard/infrastructure">Infrastructure</Link> /{" "}
          <Link to="/dashboard/infrastructure/zones">Zones</Link> /{" "}
          <span>Create New</span>
        </div>
        <div>
          <h1>Create Distribution Zone</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Define a new water distribution zone covering multiple villages in Bugesera.
          </p>
        </div>
      </div>

      <div className="grid-2 flex-gap" style={{ marginTop: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Form Details & Village Adder */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Zone Details</h3>
          
          <div className="filter-group mb-24">
            <label style={{ fontWeight: 600 }}>Zone Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Nyamata Central Hub"
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
            />
          </div>

          <div className="filter-group mb-32">
            <label style={{ fontWeight: 600 }}>Description (Optional)</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Notes about this zone..."
              value={zoneNotes}
              onChange={e => setZoneNotes(e.target.value)}
            />
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Add Villages</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            Zone region is strictly locked to <strong>Eastern Province, Bugesera District</strong>. Select sectors and cells to add specific villages to this zone.
          </p>

          {error && <p className="input-error-message mb-16">{error}</p>}

          <div className="grid-2 flex-gap mb-16">
            <div className="filter-group">
              <label>Sector</label>
              <div className={`input-wrapper ${loadingLocations && sectors.length === 0 ? 'loading-skeleton' : ''}`}>
                <select
                  value={sectorId}
                  onChange={(e) => handleSectorChange(Number(e.target.value))}
                  disabled={loadingLocations || sectors.length === 0}
                  className="input-field"
                >
                  <option value="">Select sector</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Cell</label>
              <div className={`input-wrapper ${loadingLocations && sectorId && cells.length === 0 ? 'loading-skeleton' : ''}`}>
                <select
                  value={cellId}
                  onChange={(e) => handleCellChange(Number(e.target.value))}
                  disabled={!sectorId || loadingLocations}
                  className="input-field"
                >
                  <option value="">Select cell</option>
                  {cells.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="filter-group mb-24">
            <label>Village</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className={`input-wrapper ${loadingLocations && cellId && villages.length === 0 ? 'loading-skeleton' : ''}`} style={{ flex: 1 }}>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(Number(e.target.value))}
                  disabled={!cellId || loadingLocations}
                  className="input-field"
                >
                  <option value="">Select village</option>
                  {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                disabled={!villageId}
                onClick={handleAddVillage}
              >
                Add
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Selected Villages List & Submit */}
        <div>
          <div className="card mb-24">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Included Villages</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedVillages.length >= 2 ? '#10b981' : '#ef4444', background: selectedVillages.length >= 2 ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '12px' }}>
                {selectedVillages.length} Added
              </span>
            </div>

            {selectedVillages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No villages added yet.</p>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>A zone requires at least 2 villages.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }} className="scrollbar-hide">
                {selectedVillages.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{v.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.sector} Sector · {v.cell} Cell</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeVillage(v.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '1.25rem', lineHeight: 1 }}
                      title="Remove village"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#334155' }}>Ready to Create?</h4>
            <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, paddingLeft: '20px', marginBottom: '24px' }}>
              <li style={{ color: zoneName.trim() ? '#10b981' : '#ef4444' }}>Zone name provided</li>
              <li style={{ color: selectedVillages.length >= 2 ? '#10b981' : '#ef4444' }}>At least 2 villages added</li>
            </ul>
            <button 
              className="btn btn-primary w-full" 
              disabled={!isValid}
              onClick={handleCreateZone}
              style={isValid ? { boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' } : {}}
            >
              Create Zone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
