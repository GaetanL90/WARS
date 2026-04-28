import { useState, useMemo, useRef } from "react";
import { useAuth } from "../auth/AuthContext";

const LOCATION_TREE = {
  Gasabo: {
    Remera: {
      Nyarutarama: ["Rukiri I", "Rukiri II", "Amahoro"],
      Nyabisindu: ["Gisimenti", "Inyarutarama", "Akabuga"]
    },
    Kimironko: {
      Bibare: ["Kibagabaga", "Rugando", "Ubumwe"],
      Nyagatovu: ["Koraneza", "Akamuhoza", "Intwari"]
    }
  },
  Kicukiro: {
    Kagarama: {
      Kanserege: ["Marembo", "Amahoro", "Ubumwe"],
      Rukatsa: ["Gikondo", "Taba", "Gatenga"]
    },
    Niboye: {
      Nyakabanda: ["Nyenyeri", "Mubuga", "Icyerekezo"],
      Niboye: ["Akasusa", "Kabeza", "Kigina"]
    }
  },
  Nyarugenge: {
    Nyamirambo: {
      Mumena: ["Kivugiza", "Sovu", "Imena"],
      Rugarama: ["Kabagari", "Mpazi", "Cyivugiza"]
    },
    Kigali: {
      Rwesero: ["Biryogo", "Kimisagara", "Rugenge"],
      Mwendo: ["Kanyinya", "Nyabugogo", "Rwampara"]
    }
  }
} as const;

export function ProfilePage() {
  const { auth } = useAuth();
  const user = auth?.user;
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState("+250780000000");
  const [email, setEmail] = useState(user?.email || "");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [cell, setCell] = useState("");
  const [village, setVillage] = useState("");

  const districts = Object.keys(LOCATION_TREE);
  const sectors = useMemo(() => district ? Object.keys(LOCATION_TREE[district as keyof typeof LOCATION_TREE] || {}) : [], [district]);
  const cells = useMemo(() => {
    if (!district || !sector) return [];
    const distObj = LOCATION_TREE[district as keyof typeof LOCATION_TREE] as any;
    return Object.keys(distObj?.[sector] || {});
  }, [district, sector]);
  const villages = useMemo(() => {
    if (!district || !sector || !cell) return [];
    const distObj = LOCATION_TREE[district as keyof typeof LOCATION_TREE] as any;
    return distObj?.[sector]?.[cell] || [];
  }, [district, sector, cell]);

  const handleDistrictChange = (val: string) => { setDistrict(val); setSector(""); setCell(""); setVillage(""); };
  const handleSectorChange = (val: string) => { setSector(val); setCell(""); setVillage(""); };
  const handleCellChange = (val: string) => { setCell(val); setVillage(""); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

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
                <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <h4 className="section-title">Location Details</h4>
            
            <div className="input-grid two">
              <div className="form-group">
                <label>District</label>
                <select className="input-field" value={district} onChange={e => handleDistrictChange(e.target.value)} required>
                  <option value="" disabled>Select District</option>
                  {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sector</label>
                <select className="input-field" value={sector} onChange={e => handleSectorChange(e.target.value)} disabled={!district} required>
                  <option value="" disabled>Select Sector</option>
                  {sectors.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="input-grid two">
              <div className="form-group">
                <label>Cell</label>
                <select className="input-field" value={cell} onChange={e => handleCellChange(e.target.value)} disabled={!sector} required>
                  <option value="" disabled>Select Cell</option>
                  {cells.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Village</label>
                <select className="input-field" value={village} onChange={e => setVillage(e.target.value)} disabled={!cell} required>
                  <option value="" disabled>Select Village</option>
                  {villages.map((v: string) => <option key={v} value={v}>{v}</option>)}
                </select>
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
