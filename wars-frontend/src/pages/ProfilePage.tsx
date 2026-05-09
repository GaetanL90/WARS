import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCountries } from "../hooks/useCountries";
import { CountrySelector } from "../components/CountrySelector";
import { validatePhone, getMaxLengthForCountry } from "../utils/validation";

const API_BASE_URL = "/api-admin";

interface AdminEntity {
  id: number;
  name: string;
}

export function ProfilePage() {
  const { auth } = useAuth();
  const user = auth?.user;
  
  const { countries, loading: loadingCountries } = useCountries();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+250");
  const [selectedIsoCode, setSelectedIsoCode] = useState("RW");
  const [phoneError, setPhoneError] = useState("");
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlaceholder = (code: string) => {
    switch (code) {
      case "+250": return "78X XXX XXX";
      case "+1": return "555 000 0000";
      case "+44": return "7700 900000";
      case "+33": return "06 12 34 56 78";
      default: return "123 456 789";
    }
  };

  const [firstName, setFirstName] = useState(user?.full_name?.split(" ")[0] || "");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState(user?.full_name?.split(" ").slice(1).join(" ") || "");
  const [phoneNoPrefix, setPhoneNoPrefix] = useState("780000000");
  const [email, setEmail] = useState(user?.email || "");
  const [expertise, setExpertise] = useState(user?.expertise || "");

  // Administrative Data States
  const [provinces, setProvinces] = useState<AdminEntity[]>([]);
  const [districts, setDistricts] = useState<AdminEntity[]>([]);
  const [sectors, setSectors] = useState<AdminEntity[]>([]);
  const [cells, setCells] = useState<AdminEntity[]>([]);
  const [villages, setVillages] = useState<AdminEntity[]>([]);

  // Selection state IDs
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [sectorId, setSectorId] = useState<number | "">("");
  const [cellId, setCellId] = useState<number | "">("");
  const [villageId, setVillageId] = useState<number | "">("");

  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchProvinces = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/provinces/?page_size=100`);
      const data = await response.json();
      setProvinces(data.results || []);
    } catch (error) {
      console.error("Failed to fetch provinces", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (pId: number) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/districts/?province=${pId}&page_size=100`);
      const data = await response.json();
      setDistricts(data.results || []);
    } catch (error) {
      console.error("Failed to fetch districts", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchSectors = useCallback(async (dId: number) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sectors/?district=${dId}&page_size=100`);
      const data = await response.json();
      setSectors(data.results || []);
    } catch (error) {
      console.error("Failed to fetch sectors", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchCells = useCallback(async (sId: number) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cells/?sector=${sId}&page_size=100`);
      const data = await response.json();
      setCells(data.results || []);
    } catch (error) {
      console.error("Failed to fetch cells", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchVillages = useCallback(async (cId: number) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/villages/?cell=${cId}&page_size=100`);
      const data = await response.json();
      setVillages(data.results || []);
    } catch (error) {
      console.error("Failed to fetch villages", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const handleProvinceChange = (pId: number) => {
    setProvinceId(pId);
    setDistrictId("");
    setSectorId("");
    setCellId("");
    setVillageId("");
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    if (pId) fetchDistricts(pId);
  };

  const handleDistrictChange = (dId: number) => {
    setDistrictId(dId);
    setSectorId("");
    setCellId("");
    setVillageId("");
    setSectors([]);
    setCells([]);
    setVillages([]);
    if (dId) fetchSectors(dId);
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePicture(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setUploadError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setPhoneError("");

    const isPhoneValid = validatePhone(`${selectedCountryCode}${phoneNoPrefix}`, selectedIsoCode);
    if (!isPhoneValid) {
      setPhoneError("Please enter a valid phone number for the selected country.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Account Profile</h1>
        <p>Manage your personal information, contact details, and location.</p>
      </div>

      <div className="profile-content-grid">
        <div className="profile-sidebar">
          <div className="profile-card card">
            <button className="avatar-large-wrapper" onClick={() => setIsAvatarModalOpen(true)}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="avatar-large" />
              ) : (
                <div className="avatar-large-placeholder">{initial}</div>
              )}
              <div className="avatar-overlay">
                <span>View</span>
              </div>
            </button>
            {uploadError && <p className="mb-8 text-danger text-center" style={{ fontSize: '0.8rem' }}>{uploadError}</p>}
            <p className="photo-help-text">Click the avatar to view in full size.</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <div className="photo-actions">
              <button className="btn btn-primary" type="button" onClick={() => fileInputRef.current?.click()}>Upload new picture</button>
              <button className="btn btn-outline" type="button" onClick={handleRemovePicture} disabled={!profilePicture}>Remove</button>
            </div>
          </div>
        </div>
        
        <div className="profile-details-card card">
          <div className="profile-details-header flex-between">
            <h3>Personal Information</h3>
            <span className="role-pill">{user?.role}</span>
          </div>
          <form className="profile-form" onSubmit={handleSave}>
            <div className="input-grid two">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" className="input-field" value={middleName} onChange={e => setMiddleName(e.target.value)} />
              </div>
            </div>

            <div className="input-grid two">
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="phone-input-container">
                    <CountrySelector 
                      countries={countries}
                      selectedCode={selectedCountryCode}
                      onSelect={(prefix, iso) => {
                        setSelectedCountryCode(prefix);
                        setSelectedIsoCode(iso);
                        setPhoneNoPrefix("");
                        setPhoneError("");
                      }}
                      loading={loadingCountries}
                    />
                    <input
                      className={`phone-number-input ${phoneError ? 'error-input' : ''}`}
                      value={phoneNoPrefix}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhoneNoPrefix(val);
                        setPhoneError("");
                      }}
                      placeholder={getPlaceholder(selectedCountryCode)}
                      maxLength={getMaxLengthForCountry(selectedIsoCode)}
                      type="tel"
                    />
                  </div>
                  {phoneError && <span className="input-error-message">{phoneError}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {user?.role === 'technician' && (
              <div className="form-group mb-16">
                <label>Technical Expertise / Specialization</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={expertise} 
                  onChange={e => setExpertise(e.target.value)} 
                  placeholder="e.g. IoT, Plumbing, Water Quality"
                />
              </div>
            )}

            <h4 className="section-title">Location Details</h4>
            
            <div className="input-grid two">
              <div className="form-group">
                <label>Province</label>
                <div className={`input-wrapper ${loadingLocations && provinces.length === 0 ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={provinceId} 
                    onChange={e => handleProvinceChange(Number(e.target.value))} 
                    required
                  >
                    <option value="" disabled>Select Province</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>District</label>
                <div className={`input-wrapper ${loadingLocations && provinceId && districts.length === 0 ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={districtId} 
                    onChange={e => handleDistrictChange(Number(e.target.value))} 
                    disabled={!provinceId} 
                    required
                  >
                    <option value="" disabled>Select District</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="input-grid two">
              <div className="form-group">
                <label>Sector</label>
                <div className={`input-wrapper ${loadingLocations && districtId && sectors.length === 0 ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={sectorId} 
                    onChange={e => handleSectorChange(Number(e.target.value))} 
                    disabled={!districtId} 
                    required
                  >
                    <option value="" disabled>Select Sector</option>
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Cell</label>
                <div className={`input-wrapper ${loadingLocations && sectorId && cells.length === 0 ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={cellId} 
                    onChange={e => handleCellChange(Number(e.target.value))} 
                    disabled={!sectorId} 
                    required
                  >
                    <option value="" disabled>Select Cell</option>
                    {cells.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="input-grid two">
              <div className="form-group">
                <label>Village</label>
                <div className={`input-wrapper ${loadingLocations && cellId && villages.length === 0 ? 'loading-skeleton' : ''}`}>
                  <select 
                    className="input-field" 
                    value={villageId} 
                    onChange={e => setVillageId(Number(e.target.value))} 
                    disabled={!cellId} 
                    required
                  >
                    <option value="" disabled>Select Village</option>
                    {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            {successMsg && <div className="success-message mb-16 bg-success-light text-success" style={{ padding: '12px', borderRadius: '8px', fontWeight: 500 }}>{successMsg}</div>}

            <div className="form-actions mt-16">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isAvatarModalOpen && (
        <div className="avatar-modal-overlay" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="avatar-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAvatarModalOpen(false)}>×</button>
            {profilePicture ? (
              <img src={profilePicture} alt="Full size profile" className="avatar-modal-img" />
            ) : (
              <div className="avatar-modal-placeholder">{initial}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
