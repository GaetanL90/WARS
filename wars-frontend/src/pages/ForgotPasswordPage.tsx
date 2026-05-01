import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { completeForgotPassword, resendForgotPasswordOtp, startForgotPassword, verifyForgotPasswordOtp } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

type ForgotStep = "request" | "verifyOtp" | "resetPassword";
const RESEND_COOLDOWN_SECONDS = [30, 60, 300];

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSessionId, setResetSessionId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (step !== "verifyOtp" || resendRemainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendRemainingSeconds]);

  const onRequestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await startForgotPassword({ email });
      setResetSessionId(result.resetSessionId);
      setOtpDebugCode(result.otpDebugCode ?? null);
      setResendAttempts(0);
      setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS[0]);
      setStep("verifyOtp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const onResendOtp = async () => {
    if (!resetSessionId || resendRemainingSeconds > 0) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await resendForgotPasswordOtp({ resetSessionId });
      setOtpDebugCode(result.otpDebugCode ?? null);
      const nextAttempts = resendAttempts + 1;
      const cooldownIndex = Math.min(nextAttempts, RESEND_COOLDOWN_SECONDS.length - 1);
      setResendAttempts(nextAttempts);
      setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS[cooldownIndex]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!resetSessionId) {
      setStep("request");
      setError("Start with account email first.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyForgotPasswordOtp({ resetSessionId, otpCode });
      setResetToken(result.resetToken);
      setStep("resetPassword");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!resetToken) {
      setStep("request");
      setError("Session expired. Start again.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password and confirmation must match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await completeForgotPassword({ resetToken, newPassword });
      navigate("/login", {
        replace: true,
        state: {
          registered: false,
          email,
          resetDone: true
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <h2>Forgot password</h2>

        {step === "request" && (
          <>
            <p>Enter your account email. If the account exists and is enabled, we will send an OTP.</p>
            <form onSubmit={onRequestOtp}>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === "verifyOtp" && (
          <>
            <p>Enter the OTP sent to {email}. This verifies account ownership before password reset.</p>
            {otpDebugCode && <p className="hint">Mock OTP code: {otpDebugCode}</p>}
            <form onSubmit={onVerifyOtp}>
              <label>
                OTP code
                <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} inputMode="numeric" required />
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <div className="otp-resend-row">
              <button
                type="button"
                className="button-secondary"
                onClick={onResendOtp}
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
          </>
        )}

        {step === "resetPassword" && (
          <>
            <p>Create your new password and confirm it.</p>
            <form onSubmit={onResetPassword}>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={submitting}>
                {submitting ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer-text">
          Remembered password? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}
