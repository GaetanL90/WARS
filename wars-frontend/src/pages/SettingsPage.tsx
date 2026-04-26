import { useState } from "react";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function SettingsPage() {
  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    setIsChangingPassword(true);
    // Mock API call
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordSuccess("Password successfully updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your app preferences and account security.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card card">
          <div className="settings-card-header">
            <h3>Notifications</h3>
            <p className="subtitle">Control how you receive alerts and updates.</p>
          </div>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <strong>Email Notifications</strong>
                <span>Receive alerts directly to your inbox.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <strong>Push Notifications</strong>
                <span>Receive desktop alerts for urgent issues.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <strong>Weekly Digest Reports</strong>
                <span>A weekly summary of system analytics.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={weeklyReports} onChange={() => setWeeklyReports(!weeklyReports)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <div className="settings-card-header">
            <h3>Account Security</h3>
            <p className="subtitle">Update your password to keep your account secure.</p>
          </div>
          
          <form className="profile-form" onSubmit={handlePasswordChange}>
            {passwordError && <div className="error-message" style={{ marginBottom: "16px" }}>{passwordError}</div>}
            {passwordSuccess && <div className="success-message" style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 500 }}>{passwordSuccess}</div>}

            <div className="form-group">
              <label>Current Password</label>
              <div className="password-field" style={{ position: 'relative', marginTop: '4px' }}>
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  className="input-field" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
                <button type="button" className="password-visibility" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b829a', padding: 0 }}>
                  {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="input-grid two">
              <div className="form-group">
                <label>New Password</label>
                <div className="password-field" style={{ position: 'relative', marginTop: '4px' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    className="input-field" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    minLength={8}
                    style={{ width: '100%' }}
                  />
                  <button type="button" className="password-visibility" onClick={() => setShowNewPassword(!showNewPassword)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b829a', padding: 0 }}>
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-field" style={{ position: 'relative', marginTop: '4px' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="input-field" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={8}
                    style={{ width: '100%' }}
                  />
                  <button type="button" className="password-visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b829a', padding: 0 }}>
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <button type="submit" className="btn btn-primary" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
