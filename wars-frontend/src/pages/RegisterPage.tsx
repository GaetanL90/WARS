import { FormEvent, useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { resendRegistrationOtp, startRegistration, verifyRegistrationOtp } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import type { RegisterPayload } from "../auth/types";
import { CountrySelector } from "../components/CountrySelector";
import { useCountries } from "../hooks/useCountries";

const API_BASE_URL = "/api/admin";

function isValidPhone(phone: string): boolean {
  return /^[0-9\s()-]{7,15}$/.test(phone.replace(/\D/g, ''));
}

const RESEND_COOLDOWN_SECONDS = [30, 60, 300];
const OTP_COOLDOWN_STORAGE_KEY = "wars-register-otp-cooldown";
const REGISTRATION_DRAFT_STORAGE_KEY = "wars-register-draft";

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface AdminEntity {
  id: number;
  name: string;
}

function EyeIcon({ closed }: { closed: boolean }) {
  if (closed) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M3 4l17 17M10.6 10.7a2 2 0 002.8 2.8M9.9 5.2A11.9 11.9 0 0112 5c5.3 0 9.3 3.3 10.8 7-0.7 1.8-2 3.6-3.9 4.9M6.1 7.1C4.4 8.3 3.3 10 2.2 12c0.8 1.9 2.1 3.8 4.2 5.1A11.7 11.7 0 0012 19c1 0 2-.1 2.9-.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2.2 12C3.8 8.2 7.7 5 12 5s8.2 3.2 9.8 7c-1.6 3.8-5.5 7-9.8 7s-8.2-3.2-9.8-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"identity" | "contact" | "security" | "otp">("identity");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registrationSessionId, setRegistrationSessionId] = useState("");
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);

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

  // Country Codes State
  const { countries, loading: loadingCountries } = useCountries();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+250");
  const [phoneNoPrefix, setPhoneNoPrefix] = useState("");

  const [form, setForm] = useState<RegisterPayload & { province?: string }>({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    password: "",
    role: "citizen"
  });

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

  // Fetch logic
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
    const pName = provinces.find(p => p.id === pId)?.name || "";
    setProvinceId(pId);
    setDistrictId("");
    setSectorId("");
    setCellId("");
    setVillageId("");
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    setForm(prev => ({ ...prev, province: pName, district: "", sector: "", cell: "", village: "" }));
    if (pId) fetchDistricts(pId);
  };

  const handleDistrictChange = (dId: number) => {
    const dName = districts.find(d => d.id === dId)?.name || "";
    setDistrictId(dId);
    setSectorId("");
    setCellId("");
    setVillageId("");
    setSectors([]);
    setCells([]);
    setVillages([]);
    setForm(prev => ({ ...prev, district: dName, sector: "", cell: "", village: "" }));
    if (dId) fetchSectors(dId);
  };

  const handleSectorChange = (sId: number) => {
    const sName = sectors.find(s => s.id === sId)?.name || "";
    setSectorId(sId);
    setCellId("");
    setVillageId("");
    setCells([]);
    setVillages([]);
    setForm(prev => ({ ...prev, sector: sName, cell: "", village: "" }));
    if (sId) fetchCells(sId);
  };

  const handleCellChange = (cId: number) => {
    const cName = cells.find(c => c.id === cId)?.name || "";
    setCellId(cId);
    setVillageId("");
    setVillages([]);
    setForm(prev => ({ ...prev, cell: cName, village: "" }));
    if (cId) fetchVillages(cId);
  };

  const handleVillageChange = (vId: number) => {
    const vName = villages.find(v => v.id === vId)?.name || "";
    setVillageId(vId);
    setForm(prev => ({ ...prev, village: vName }));
  };

  const fullNamePreview = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
  
  const motivationalCopy: Record<typeof step, string> = {
    identity: "Every complete profile helps us build trusted community reporting.",
    contact: "Nice work - now add your location so teams can reach the issue faster.",
    security: "Almost there - securing your account protects your reports.",
    otp: "Final step - verify your email and start making impact."
  };

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  useEffect(() => {
    const raw = localStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        form: RegisterPayload;
        step: "identity" | "contact" | "security" | "otp";
        registrationSessionId: string;
        otpDebugCode: string | null;
      };

      if (parsed.form) {
        setForm(parsed.form);
        if (parsed.form.phoneNumber.includes(" ")) {
          const parts = parsed.form.phoneNumber.split(" ");
          setSelectedCountryCode(parts[0]);
          setPhoneNoPrefix(parts[1]);
        }
      }
      if (parsed.step) setStep(parsed.step);
      if (parsed.registrationSessionId) setRegistrationSessionId(parsed.registrationSessionId);
      if (parsed.otpDebugCode) setOtpDebugCode(parsed.otpDebugCode);
    } catch {
      localStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      REGISTRATION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        form: { ...form, phoneNumber: `${selectedCountryCode} ${phoneNoPrefix}`.trim() },
        step,
        registrationSessionId,
        otpDebugCode
      })
    );
  }, [form, step, registrationSessionId, otpDebugCode, selectedCountryCode, phoneNoPrefix]);

  useEffect(() => {
    if (!registrationSessionId) return;
    const raw = localStorage.getItem(OTP_COOLDOWN_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        registrationSessionId: string;
        resendAttempts: number;
        cooldownUntilMs: number;
      };

      if (parsed.registrationSessionId !== registrationSessionId) return;

      const remaining = Math.max(0, Math.ceil((parsed.cooldownUntilMs - Date.now()) / 1000));
      setResendAttempts(parsed.resendAttempts);
      setResendRemainingSeconds(remaining);
    } catch {
      localStorage.removeItem(OTP_COOLDOWN_STORAGE_KEY);
    }
  }, [registrationSessionId]);

  useEffect(() => {
    if (step !== "otp" || resendRemainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, resendRemainingSeconds]);

  useEffect(() => {
    if (!registrationSessionId) return;
    if (step !== "otp") return;

    if (resendRemainingSeconds <= 0) {
      localStorage.removeItem(OTP_COOLDOWN_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      OTP_COOLDOWN_STORAGE_KEY,
      JSON.stringify({
        registrationSessionId,
        resendAttempts,
        cooldownUntilMs: Date.now() + resendRemainingSeconds * 1000
      })
    );
  }, [registrationSessionId, resendAttempts, resendRemainingSeconds, step]);

  const validateCurrentStep = () => {
    if (step === "identity") {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError("First name and last name are required.");
        return false;
      }
      if (!isValidPhone(phoneNoPrefix)) {
        setError("Enter a valid phone number (7-15 digits).");
        return false;
      }
      if (!form.email.trim()) {
        setError("Email is required.");
        return false;
      }
      return true;
    }

    if (step === "contact") {
      if (!form.district.trim() || !form.sector.trim() || !form.cell.trim() || !form.village.trim()) {
        setError("Fill all address fields before continuing.");
        return false;
      }
      return true;
    }

    if (step === "security") {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (form.password !== confirmPassword) {
        setError("Password and confirm password must match.");
        return false;
      }
      return true;
    }

    return true;
  };

  const goNextStep = () => {
    setError(null);
    if (!validateCurrentStep()) return;

    if (step === "identity") setStep("contact");
    else if (step === "contact") setStep("security");
  };

  const goPreviousStep = () => {
    setError(null);
    if (step === "contact") setStep("identity");
    else if (step === "security") setStep("contact");
  };

  const submitDetails = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const { province, ...payload } = form;
      payload.phoneNumber = `${selectedCountryCode}${phoneNoPrefix}`;
      const result = await startRegistration(payload);
      setRegistrationSessionId(result.registrationSessionId);
      setOtpDebugCode(result.otpDebugCode ?? null);
      setResendAttempts(0);
      setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS[0]);
      localStorage.setItem(
        OTP_COOLDOWN_STORAGE_KEY,
        JSON.stringify({
          registrationSessionId: result.registrationSessionId,
          resendAttempts: 0,
          cooldownUntilMs: Date.now() + RESEND_COOLDOWN_SECONDS[0] * 1000
        })
      );
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start registration");
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await verifyRegistrationOtp({
        registrationSessionId,
        otpCode
      });
      localStorage.removeItem(OTP_COOLDOWN_STORAGE_KEY);
      localStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
      navigate("/login", {
        replace: true,
        state: { registered: true, email: form.email }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendRemainingSeconds > 0 || !registrationSessionId) return;

    setError(null);
    setSubmitting(true);

    try {
      const result = await resendRegistrationOtp({ registrationSessionId });
      setOtpDebugCode(result.otpDebugCode ?? null);

      const nextAttempts = resendAttempts + 1;
      const cooldownIndex = Math.min(nextAttempts, RESEND_COOLDOWN_SECONDS.length - 1);
      setResendAttempts(nextAttempts);
      setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS[cooldownIndex]);
      localStorage.setItem(
        OTP_COOLDOWN_STORAGE_KEY,
        JSON.stringify({
          registrationSessionId,
          resendAttempts: nextAttempts,
          cooldownUntilMs: Date.now() + RESEND_COOLDOWN_SECONDS[cooldownIndex] * 1000
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="card auth-card auth-card--wide">
        <div className="register-progress">
          <p>{motivationalCopy[step]}</p>
        </div>

        {step !== "otp" ? (
          <>
            <h2>Create account</h2>
            <p>Register as a citizen reporter. Verify your email with OTP to complete account creation.</p>
            <form onSubmit={submitDetails}>
              {step === "identity" && (
                <>
                  <div className="input-grid three">
                    <label>
                      First name
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      Middle name (optional)
                      <input
                        value={form.middleName}
                        onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
                      />
                    </label>
                    <label>
                      Last name
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </label>
                  </div>

                  <div className="input-grid two">
                    <label>
                      Phone number
                      <div className="phone-input-container">
                        <CountrySelector 
                          countries={countries}
                          selectedCode={selectedCountryCode}
                          onSelect={setSelectedCountryCode}
                          loading={loadingCountries}
                        />
                        <input
                          className="phone-number-input"
                          value={phoneNoPrefix}
                          onChange={(e) => setPhoneNoPrefix(e.target.value)}
                          placeholder={getPlaceholder(selectedCountryCode)}
                          type="tel"
                          required
                        />
                      </div>
                    </label>

                    <label>
                      Email
                      <input
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        type="email"
                        required
                      />
                    </label>
                  </div>
                </>
              )}

              {step === "contact" && (
                <>
                  <div className="input-grid two">
                    <label>
                      Province
                      <div className={`input-wrapper ${loadingLocations && provinces.length === 0 ? 'loading-skeleton' : ''}`}>
                        <select
                          value={provinceId}
                          onChange={(e) => handleProvinceChange(Number(e.target.value))}
                          disabled={loadingLocations}
                          required
                        >
                          <option value="">{loadingLocations && provinces.length === 0 ? "Fetching..." : "Select province"}</option>
                          {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label>
                      District
                      <div className={`input-wrapper ${loadingLocations && provinceId && districts.length === 0 ? 'loading-skeleton' : ''}`}>
                        <select
                          value={districtId}
                          onChange={(e) => handleDistrictChange(Number(e.target.value))}
                          disabled={!provinceId || loadingLocations}
                          required
                        >
                          <option value="">{loadingLocations && provinceId && districts.length === 0 ? "Fetching..." : "Select district"}</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>

                  <div className="input-grid two">
                    <label>
                      Sector
                      <div className={`input-wrapper ${loadingLocations && districtId && sectors.length === 0 ? 'loading-skeleton' : ''}`}>
                        <select
                          value={sectorId}
                          onChange={(e) => handleSectorChange(Number(e.target.value))}
                          disabled={!districtId || loadingLocations}
                          required
                        >
                          <option value="">{loadingLocations && districtId && sectors.length === 0 ? "Fetching..." : "Select sector"}</option>
                          {sectors.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label>
                      Cell
                      <div className={`input-wrapper ${loadingLocations && sectorId && cells.length === 0 ? 'loading-skeleton' : ''}`}>
                        <select
                          value={cellId}
                          onChange={(e) => handleCellChange(Number(e.target.value))}
                          disabled={!sectorId || loadingLocations}
                          required
                        >
                          <option value="">{loadingLocations && sectorId && cells.length === 0 ? "Fetching..." : "Select cell"}</option>
                          {cells.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>

                  <div className="input-grid two">
                    <label>
                      Village
                      <div className={`input-wrapper ${loadingLocations && cellId && villages.length === 0 ? 'loading-skeleton' : ''}`}>
                        <select
                          value={villageId}
                          onChange={(e) => handleVillageChange(Number(e.target.value))}
                          disabled={!cellId || loadingLocations}
                          required
                        >
                          <option value="">{loadingLocations && cellId && villages.length === 0 ? "Fetching..." : "Select village"}</option>
                          {villages.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>
                  {loadingLocations && <p className="hint">Loading locations...</p>}
                </>
              )}

              {step === "security" && (
                <>
                  <label>
                    Password
                    <div className="password-field">
                      <input
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        type={showPassword ? "text" : "password"}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="password-visibility"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        <EyeIcon closed={showPassword} />
                      </button>
                    </div>
                  </label>

                  <label>
                    Confirm password
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      required
                    />
                  </label>
                </>
              )}

              {fullNamePreview && <p className="hint">Account name preview: {fullNamePreview}</p>}
              {error && <p className="error">{error}</p>}
              <div className="step-actions">
                {step !== "identity" && (
                  <button type="button" className="button-secondary" onClick={goPreviousStep}>
                    Back
                  </button>
                )}
                {step !== "security" ? (
                  <button type="button" onClick={goNextStep}>
                    Continue
                  </button>
                ) : (
                  <button disabled={submitting} type="submit">
                    {submitting ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
              </div>
            </form>
            <p className="auth-footer-text">
              Already registered? <Link to="/login">Back to login</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify email</h2>
            <p>Enter the OTP sent to {form.email} to activate your account.</p>
            {otpDebugCode && <p className="hint">Mock OTP code: {otpDebugCode}</p>}
            <form onSubmit={submitOtp}>
              <label>
                OTP code
                <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} inputMode="numeric" required />
              </label>
              {error && <p className="error">{error}</p>}
              <button disabled={submitting} type="submit">
                {submitting ? "Verifying..." : "Verify and continue"}
              </button>
            </form>
            <div className="otp-resend-row">
              <button
                type="button"
                className="button-secondary"
                onClick={handleResendOtp}
                disabled={submitting || resendRemainingSeconds > 0}
              >
                Resend OTP
              </button>
              <span className="hint">
                {resendRemainingSeconds > 0
                  ? `You can resend in ${formatCountdown(resendRemainingSeconds)}`
                  : "Didn't receive code? Request a new OTP."}
              </span>
            </div>
            <p className="auth-footer-text">
              Wrong email?{" "}
              <button type="button" className="text-button" onClick={() => setStep("identity")}>
                Edit details
              </button>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
