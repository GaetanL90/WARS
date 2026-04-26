import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { resendRegistrationOtp, startRegistration, verifyRegistrationOtp } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import type { RegisterPayload } from "../auth/types";

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

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

const RESEND_COOLDOWN_SECONDS = [30, 60, 300];
const OTP_COOLDOWN_STORAGE_KEY = "wars-register-otp-cooldown";
const REGISTRATION_DRAFT_STORAGE_KEY = "wars-register-draft";

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const [form, setForm] = useState<RegisterPayload>({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    password: "",
    role: "citizen"
  });

  const fullNamePreview = useMemo(
    () => [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" "),
    [form.firstName, form.middleName, form.lastName]
  );
  const districts = useMemo(() => Object.keys(LOCATION_TREE), []);
  const sectors = useMemo(() => {
    if (!form.district) return [];
    return Object.keys(LOCATION_TREE[form.district as keyof typeof LOCATION_TREE] ?? {});
  }, [form.district]);
  const cells = useMemo(() => {
    if (!form.district || !form.sector) return [];
    return Object.keys(
      LOCATION_TREE[form.district as keyof typeof LOCATION_TREE]?.[form.sector as keyof (typeof LOCATION_TREE)[keyof typeof LOCATION_TREE]] ?? {}
    );
  }, [form.district, form.sector]);
  const villages = useMemo(() => {
    if (!form.district || !form.sector || !form.cell) return [];
    return (
      LOCATION_TREE[form.district as keyof typeof LOCATION_TREE]?.[form.sector as keyof (typeof LOCATION_TREE)[keyof typeof LOCATION_TREE]]?.[
        form.cell as keyof (typeof LOCATION_TREE)[keyof typeof LOCATION_TREE][keyof (typeof LOCATION_TREE)[keyof typeof LOCATION_TREE]]
      ] ?? []
    );
  }, [form.district, form.sector, form.cell]);
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

      if (parsed.form) setForm(parsed.form);
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
        form,
        step,
        registrationSessionId,
        otpDebugCode
      })
    );
  }, [form, step, registrationSessionId, otpDebugCode]);

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
      if (!isValidPhone(form.phoneNumber)) {
        setError("Enter a valid phone number (10-15 digits, optional +).");
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
      const result = await startRegistration(form);
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
                      <input
                        value={form.phoneNumber}
                        onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+2507XXXXXXXX"
                        required
                      />
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
                      District
                      <select
                        value={form.district}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            district: e.target.value,
                            sector: "",
                            cell: "",
                            village: ""
                          }))
                        }
                        required
                      >
                        <option value="">Select district</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Sector
                      <select
                        value={form.sector}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            sector: e.target.value,
                            cell: "",
                            village: ""
                          }))
                        }
                        disabled={!form.district}
                        required
                      >
                        <option value="">Select sector</option>
                        {sectors.map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="input-grid two">
                    <label>
                      Cell
                      <select
                        value={form.cell}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            cell: e.target.value,
                            village: ""
                          }))
                        }
                        disabled={!form.sector}
                        required
                      >
                        <option value="">Select cell</option>
                        {cells.map((cell) => (
                          <option key={cell} value={cell}>
                            {cell}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Village
                      <select
                        value={form.village}
                        onChange={(e) => setForm((prev) => ({ ...prev, village: e.target.value }))}
                        disabled={!form.cell}
                        required
                      >
                        <option value="">Select village</option>
                        {villages.map((village) => (
                          <option key={village} value={village}>
                            {village}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
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
