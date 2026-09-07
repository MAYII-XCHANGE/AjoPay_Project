import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CheckIcon, MailIcon } from "../../components/icons";
import { Button } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { AuthProcessShell } from "./auth-process-shell";
import { OtpInput } from "./otp-input";
import { OtpResendControl } from "./otp-resend-control";
import { PasswordField } from "./password-field";
import { PasswordRequirements } from "./password-requirements";
import { notifyError, notifySuccess } from "../../utils/notifications";
import "../../pages/auth.css";

function Feedback({ error }) {
  if (error) return <div className="auth-process__feedback auth-process__feedback--error" role="alert"><span>!</span><p>{error}</p></div>;
  return null;
}

function EmailSummary({ email, onEdit }) {
  return (
    <div className="auth-process__email-summary">
      <span><MailIcon /></span>
      <div><small>CODE SENT TO</small><b>{email}</b></div>
      {onEdit && <button type="button" onClick={onEdit}>Change</button>}
    </div>
  );
}

export function EmailVerificationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to={user.role === "USER" ? "/dashboard" : "/admin"} replace />;
  if (!email) return <Navigate to="/register" replace />;

  const verify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the complete 6-digit verification code.");
    setBusy(true);
    setError("");
    try {
      await verifyRegistrationOtp(email, otp);
      navigate("/login", { replace: true, state: { verified: true } });
    } catch (requestError) {
      setError(requestError.message || "We couldn’t verify this code.");
      notifyError(requestError, "We couldn’t verify this code.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      await resendRegistrationOtp(email);
      setOtp("");
      notifySuccess("A fresh verification code has been sent to your email.");
    } catch (requestError) {
      setError(requestError.message || "We couldn’t resend the code.");
      notifyError(requestError, "We couldn’t resend the code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthProcessShell eyebrow="EMAIL VERIFICATION" title="Enter your verification code" description="Confirm your email to activate your AjoPay account and wallet." illustration="otp">
      <EmailSummary email={email} onEdit={() => navigate("/register", { replace: true })} />
      <form className="auth-process__form" onSubmit={verify}>
        <Feedback error={error} />
        <OtpInput value={otp} onChange={(value) => { setOtp(value); setError(""); }} disabled={busy} autoFocus />
        <Button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Verifying your code…" : "Verify email"}</Button>
      </form>
      <OtpResendControl onResend={resend} busy={busy} />
      <p className="auth-process__hint">For your security, verification codes expire after a short time and can only be used once.</p>
      <Link className="auth-process__back" to="/login">← Back to login</Link>
    </AuthProcessShell>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordResetOtp, resendPasswordResetOtp, confirmPasswordResetOtp, resetPassword } = useAuth();
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message || "We couldn’t complete this request.");
      notifyError(requestError, "We couldn’t complete this request.");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    run(async () => {
      await requestPasswordResetOtp(email.trim());
      notifySuccess("A password reset code was sent to your email.");
      setStep("OTP");
    });
  };

  const submitOtp = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the complete 6-digit reset code.");
    run(async () => {
      await confirmPasswordResetOtp(email.trim(), otp);
      setStep("PASSWORD");
    });
  };

  const passwordIsStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  const passwordsMatch = Boolean(confirm) && password === confirm;
  const submitPassword = (event) => {
    event.preventDefault();
    if (!passwordIsStrong) return setError("Complete all password requirements before continuing.");
    if (!passwordsMatch) return setError("The passwords do not match.");
    run(async () => {
      await resetPassword(email.trim(), password);
      navigate("/login", { replace: true, state: { passwordReset: true } });
    });
  };

  const resend = () => run(async () => {
    await resendPasswordResetOtp(email.trim());
    setOtp("");
    notifySuccess("A new reset code has been sent.");
  });

  const content = {
    EMAIL: { step: 1, eyebrow: "PASSWORD RECOVERY", title: "Forgot your password?", description: "Enter the email connected to your account and we’ll send you a secure reset code.", illustration: "email", align: "left" },
    OTP: { step: 2, eyebrow: "OTP VERIFICATION", title: "Enter verification code", description: "Enter the six-digit code we sent to your email address.", illustration: "otp" },
    PASSWORD: { step: 3, eyebrow: "CREATE NEW PASSWORD", title: "Choose a new password", description: "Create a secure password that is unique to your AjoPay account.", illustration: "password", align: "left" },
  }[step];

  return (
    <AuthProcessShell {...content}>
      {step === "EMAIL" && (
        <form className="auth-process__form" onSubmit={submitEmail} noValidate>
          <Feedback error={error} />
          <label className="auth-process__field">
            <span>Email address</span>
            <div className="auth-input"><MailIcon /><input type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="you@example.com" autoFocus /></div>
          </label>
          <Button type="submit" disabled={busy}>{busy ? "Sending secure code…" : "Continue"}</Button>
        </form>
      )}

      {step === "OTP" && (
        <>
          <EmailSummary email={email} onEdit={() => { setStep("EMAIL"); setOtp(""); setError(""); }} />
          <form className="auth-process__form" onSubmit={submitOtp}>
            <Feedback error={error} />
            <OtpInput value={otp} onChange={(value) => { setOtp(value); setError(""); }} disabled={busy} autoFocus />
            <Button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Confirming code…" : "Confirm code"}</Button>
          </form>
          <OtpResendControl onResend={resend} busy={busy} prompt="Code missing or expired?" />
        </>
      )}

      {step === "PASSWORD" && (
        <form className="auth-process__form" onSubmit={submitPassword}>
          <Feedback error={error} />
          <PasswordField label="New password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoFocus />
          <PasswordRequirements password={password} />
          <PasswordField label="Confirm new password" value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(""); }} />
          {confirm && <span className={`auth-process__match ${passwordsMatch ? "is-valid" : ""}`}>{passwordsMatch ? <><CheckIcon /> Passwords match</> : "Passwords do not match yet"}</span>}
          <Button type="submit" disabled={busy || !passwordIsStrong || !passwordsMatch}>{busy ? "Updating password…" : "Set new password"}</Button>
        </form>
      )}

      <Link className="auth-process__back" to="/login">← Back to login</Link>
    </AuthProcessShell>
  );
}
