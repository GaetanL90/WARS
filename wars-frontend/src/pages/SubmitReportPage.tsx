import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { CountrySelector } from "../components/CountrySelector";
import { useCountries } from "../hooks/useCountries";

const API_BASE_URL = "/api/admin";

const ISSUE_TYPES = [
  { value: "contamination", label: "Water Contamination" },
  { value: "low_pressure", label: "Low Water Pressure" },
  { value: "pipe_burst", label: "Pipe Burst / Leakage" },
  { value: "no_water", label: "No Water Supply" },
  { value: "discoloration", label: "Water Discoloration" },
  { value: "bad_odor", label: "Bad Odor / Taste" },
  { value: "meter_issue", label: "Meter Issue" },
  { value: "other", label: "Other" },
] as const;

type IssueType = typeof ISSUE_TYPES[number]["value"];

interface AdminEntity {
  id: number;
  name: string;
}

export function SubmitReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const user = auth?.user;

  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [phoneNoPrefix, setPhoneNoPrefix] = useState("780000000");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+250");
  
  const { countries, loading: loadingCountries } = useCountries();
  
  const [description, setDescription] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  
  const isEditMode = !!id;

  const getPlaceholder = (code: string) => {
    switch (code) {
      case "+250": return "7XX XXX XXX";
      case "+1": return "(555) 000 0000";
      case "+44": return "7700 900000";
      case "+33": return "06 12 34 56 78";
      case "+49": return "0151 2345678";
      case "+254": return "7XX XXX XXX";
      case "+256": return "7XX XXX XXX";
      case "+255": return "7XX XXX XXX";
      default: return "123 456 789";
    }
  };

  // Location IDs and Names
  const [sectorId, setSectorId] = useState<number | "">("");
  const [cellId, setCellId] = useState<number | "">("");
  const [villageId, setVillageId] = useState<number | "">("");
  
  const [sectorName, setSectorName] = useState("");
  const [villageName, setVillageName] = useState("");

  // Data lists
  const [sectors, setSectors] = useState<AdminEntity[]>([]);
  const [cells, setCells] = useState<AdminEntity[]>([]);
  const [villages, setVillages] = useState<AdminEntity[]>([]);

  // Loading states
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingCells, setLoadingCells] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Constants for Pilot (Bugesera, Eastern Province)
  const DISTRICT_ID = 121;

  const fetchSectors = useCallback(async () => {
    setLoadingSectors(true);
    setLocationError("");
    try {
      const response = await fetch(`${API_BASE_URL}/sectors/?district=${DISTRICT_ID}&page_size=100`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setSectors(data.results || []);
    } catch (error) {
      console.error("Failed to fetch sectors", error);
      setLocationError("Failed to load sectors. Please check your connection or try again.");
    } finally {
      setLoadingSectors(false);
    }
  }, []);

  const fetchCells = useCallback(async (sId: number) => {
    setLoadingCells(true);
    setLocationError("");
    try {
      const response = await fetch(`${API_BASE_URL}/cells/?sector=${sId}&page_size=100`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setCells(data.results || []);
    } catch (error) {
      console.error("Failed to fetch cells", error);
      setLocationError("Failed to load cells.");
    } finally {
      setLoadingCells(false);
    }
  }, []);

  const fetchVillages = useCallback(async (cId: number) => {
    setLoadingVillages(true);
    setLocationError("");
    try {
      const response = await fetch(`${API_BASE_URL}/villages/?cell=${cId}&page_size=100`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setVillages(data.results || []);
    } catch (error) {
      console.error("Failed to fetch villages", error);
      setLocationError("Failed to load villages.");
    } finally {
      setLoadingVillages(false);
    }
  }, []);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = Number(e.target.value);
    const sName = sectors.find(s => s.id === sId)?.name || "";
    setSectorId(sId);
    setSectorName(sName);
    setCellId("");
    setVillageId("");
    setVillageName("");
    setCells([]);
    setVillages([]);
    if (sId) fetchCells(sId);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = Number(e.target.value);
    setCellId(cId);
    setVillageId("");
    setVillageName("");
    setVillages([]);
    if (cId) fetchVillages(cId);
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = Number(e.target.value);
    const vName = villages.find(v => v.id === vId)?.name || "";
    setVillageId(vId);
    setVillageName(vName);
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!issueType) {
      setSubmitError("Please select an issue type.");
      return;
    }

    if (!sectorId || !villageId) {
      setSubmitError("Please complete the location selection.");
      return;
    }

    setIsSubmitting(true);

    // Mock API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setIssueType("");
    setPhoneNoPrefix("780000000");
    setSelectedCountryCode("+250");
    setDescription("");
    setLocationDetail("");
    setSectorId("");
    setCellId("");
    setVillageId("");
    setSectorName("");
    setVillageName("");
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    setSubmitError("");
    setSubmitSuccess(false);
  };

  if (submitSuccess) {
    return (
      <div className="page-container">
        <div className="report-success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Report Submitted!</h2>
          <p>Thank you, <strong>{user?.name || user?.email}</strong>. Your report in <strong>{villageName}, {sectorName}</strong> has been received.</p>
          <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: '24px' }}>
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEditMode ? `Edit Report #${id}` : "Report Water Issue"}</h1>
        <p>{isEditMode ? "Update the details of your submitted report." : "Fill out the form below to report a water-related problem in your area."}</p>
      </div>

      <div className="report-form-layout">
        <form className="report-form-card card" onSubmit={handleSubmit}>

          {/* Issue Type */}
          <div className="report-section">
            <h3 className="report-section-title">Issue Details</h3>
            <div className="input-grid two">
              <div className="form-group">
                <label>Issue Type <span className="required-star">*</span></label>
                <select
                  className="input-field"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  required
                >
                  <option value="" disabled>Select an issue type...</option>
                  {ISSUE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="description-card">
              <div className="description-card-header">
                <label className="description-card-label">
                  Description <span className="required-star">*</span>
                </label>
                <span className={`char-count ${description.length > 900 ? 'char-count-warn' : ''}`}>
                  {description.length} / 1000
                </span>
              </div>
              <textarea
                className="description-card-textarea"
                rows={5}
                placeholder="Describe the issue in detail — when did it start, how severe it is, any unusual observations..."
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                required
              />
              <div className="description-card-footer">
                <span className="description-hint">Be as specific as possible to help our team respond faster.</span>
              </div>
            </div>
          </div>

          <div className="report-divider" />

          {/* Location & Contact */}
          <div className="report-section">
            <div className="pilot-notice-card">
              <div className="pilot-notice-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="pilot-notice-content">
                <strong>Bugesera District Pilot</strong>
                <p>We are currently operating exclusively in Bugesera. Our platform will expand to other districts of Rwanda very soon. Stay tuned!</p>
              </div>
            </div>

            <h3 className="report-section-title" style={{ marginTop: '24px' }}>Location in Bugesera</h3>
            
            <div className="input-grid two">
              <div className="form-group">
                <label>Sector <span className="required-star">*</span></label>
                <div className={`input-wrapper ${loadingSectors ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={sectorId} 
                    onChange={handleSectorChange} 
                    disabled={loadingSectors || !!locationError}
                    required
                  >
                    <option value="" disabled>{loadingSectors ? "Fetching sectors..." : "Select Sector"}</option>
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Cell <span className="required-star">*</span></label>
                <div className={`input-wrapper ${loadingCells ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={cellId}
                    onChange={handleCellChange} 
                    disabled={!sectorId || loadingCells || !!locationError}
                    required
                  >
                    <option value="" disabled>{loadingCells ? "Fetching cells..." : "Select Cell"}</option>
                    {cells.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {locationError && (
              <div className="error-message mb-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{locationError}</span>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => fetchSectors()}>Retry</button>
              </div>
            )}

            <div className="input-grid two">
              <div className="form-group">
                <label>Village <span className="required-star">*</span></label>
                <div className={`input-wrapper ${loadingVillages ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={villageId} 
                    onChange={handleVillageChange} 
                    disabled={!sectorId || loadingVillages || !!locationError}
                    required
                  >
                    <option value="" disabled>{loadingVillages ? "Fetching villages..." : "Select Village"}</option>
                    {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number <span className="required-star">*</span></label>
                <div className="phone-input-container">
                  <CountrySelector 
                    countries={countries}
                    selectedCode={selectedCountryCode}
                    onSelect={setSelectedCountryCode}
                    loading={loadingCountries}
                  />
                  <input
                    type="tel"
                    className="input-field phone-number-input"
                    value={phoneNoPrefix}
                    onChange={(e) => setPhoneNoPrefix(e.target.value)}
                    placeholder={getPlaceholder(selectedCountryCode)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Specific Location Detail</label>
              <input
                type="text"
                className="input-field"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="e.g. Near the school gate, Block B"
              />
            </div>
          </div>

          <div className="report-divider" />

          {/* Image Upload */}
          <div className="report-section">
            <h3 className="report-section-title">Photo Evidence</h3>
            <p style={{ fontSize: '0.9rem', color: '#5f768f', marginBottom: '16px', marginTop: '-8px' }}>
              Attach a photo to help our team better understand the issue.
            </p>

            {imagePreview ? (
              <div className="report-image-preview">
                <img src={imagePreview} alt="Report preview" />
                <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Remove
                </button>
                <p className="image-filename">{imageFile?.name}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()} style={{ display: 'center', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Upload Photo
                </button>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>PNG, JPG up to 5MB</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {imageError && <p className="error-message" style={{ marginTop: '8px' }}>{imageError}</p>}
          </div>

          <div className="report-divider" />

          {/* Submit */}
          {submitError && (
            <div className="error-message" style={{ marginBottom: '16px' }}>{submitError}</div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                isEditMode ? "Saving Changes..." : "Submitting Report..."
              ) : (
                isEditMode ? "Save Changes" : "Submit Report"
              )}
            </button>
            {isEditMode && (
              <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>
                Cancel
              </button>
            )}
            {!isEditMode && (
              <button type="button" className="btn btn-outline" onClick={handleReset} disabled={isSubmitting}>
                Clear Form
              </button>
            )}
          </div>

        </form>

        {/* Side info panel */}
        <aside className="report-info-panel">
          <div className="info-card card" style={{ marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0 }}>System Status</h4>
              <span className="status-pill status-resolved" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Normal</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#5f768f', margin: 0, lineHeight: '1.5' }}>
              All major water systems are currently operating normally. No known outages in your region.
            </p>
          </div>

          <div className="info-card card">
            <h4>What happens next?</h4>
            <ol className="report-steps">
              <li>
                <span className="step-num">1</span>
                <div>
                  <strong>Report Received</strong>
                  <p>Your report is logged and given a tracking ID.</p>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <strong>Assigned to Technician</strong>
                  <p>A field technician is dispatched to investigate.</p>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <strong>Issue Resolved</strong>
                  <p>You'll be notified once the issue is resolved.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="info-card card" style={{ marginTop: '20px' }}>
            <h4>Reporting as</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <div className="avatar-small">{user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#10233c' }}>{user?.name || user?.email?.split("@")[0]}</strong>
                <span style={{ fontSize: '0.8rem', color: '#5f768f' }}>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="info-card card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
            <h4>Urgent Issues?</h4>
            <p style={{ fontSize: '0.85rem', color: '#5f768f', margin: '0 0 16px', lineHeight: '1.5' }}>
              For urgent water emergencies in the Bugesera area, please contact the <strong>WASAC Bugesera Branch</strong> directly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1d4ed8' }}>0793 900 522</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#3a5573' }}>bugesera@wasac.rw</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
