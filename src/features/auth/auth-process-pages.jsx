import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../../components/brand-mark";
import { CheckIcon, LockIcon, MailIcon, ShieldIcon } from "../../components/icons";
import { Button } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import "../../pages/auth.css";

function AuthProcessShell({ eyebrow, title, description, children }) {
  return (
    <main className="auth-process">
      <Link to="/" aria-label="AjoPay home"><BrandMark /></Link>
      <section>
        <span className="auth-process__icon"><ShieldIcon /></span>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </section>
    </main>
  );
}

export function EmailVerificationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const email = state?.email || sessionStorage.getItem("ajopay-verification-email") || "";
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (user) return <Navigate to="/dashboard" replace />;
  const verify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the complete 6-digit verification code.");
    setBusy(true);
    setError("");
    try {
      await verifyRegistrationOtp(email, otp);
      sessionStorage.removeItem("ajopay-verification-email");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "We couldn’t verify this code.");
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      await resendRegistrationOtp(email);
      setNotice("A new verification code has been sent.");
    } catch (requestError) {
      setError(requestError.message || "We couldn’t resend the code.");
    } finally {
      setBusy(false);
    }
  };
  if (!email)
    return <Navigate to="/register" replace />;
  return (
    <AuthProcessShell eyebrow="EMAIL VERIFICATION" title="Check your email" description={<>Enter the verification code sent to <b>{email}</b> to activate your account and wallet.</>}>
      <form onSubmit={verify}>
        {notice && <div className="success-banner"><CheckIcon /> {notice}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <label>6-digit verification code<div className="auth-input"><LockIcon /><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" autoFocus /></div></label>
        <Button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify and continue"}</Button>
      </form>
      <div className="auth-process__links"><button type="button" onClick={resend} disabled={busy}>Resend code</button><Link to="/register">Use another email</Link></div>
      <p className="auth-process__demo">Frontend demo code: <b>123456</b></p>
    </AuthProcessShell>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordResetOtp, confirmPasswordResetOtp, resetPassword } = useAuth();
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (action) => {
    setBusy(true);
    setError("");
    try { await action(); } catch (requestError) { setError(requestError.message || "We couldn’t complete this request."); } finally { setBusy(false); }
  };
  const submitEmail = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    run(async () => { await requestPasswordResetOtp(email); setStep("OTP"); });
  };
  const submitOtp = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the complete 6-digit reset code.");
    run(async () => { const result = await confirmPasswordResetOtp(email, otp); setResetToken(result.resetToken); setStep("PASSWORD"); });
  };
  const submitPassword = (event) => {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters for your new password.");
    if (password !== confirm) return setError("The passwords do not match.");
    run(async () => { await resetPassword(email, resetToken, password); navigate("/login", { replace: true, state: { passwordReset: true } }); });
  };
  const content = {
    EMAIL: { eyebrow: "PASSWORD RECOVERY", title: "Reset your password", description: "Enter your account email and we’ll send a one-time reset code." },
    OTP: { eyebrow: "CONFIRM RESET CODE", title: "Check your email", description: `Enter the reset code sent to ${email}.` },
    PASSWORD: { eyebrow: "NEW PASSWORD", title: "Choose a new password", description: "Create a strong password you have not used for this account before." },
  }[step];
  return (
    <AuthProcessShell {...content}>
      {step === "EMAIL" && <form onSubmit={submitEmail}>{error && <div className="form-error" role="alert">{error}</div>}<label>Email address<div className="auth-input"><MailIcon /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} autoFocus /></div></label><Button type="submit" disabled={busy}>{busy ? "Sending code…" : "Send reset code"}</Button></form>}
      {step === "OTP" && <form onSubmit={submitOtp}>{error && <div className="form-error" role="alert">{error}</div>}<label>6-digit reset code<div className="auth-input"><LockIcon /><input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" autoFocus /></div></label><Button type="submit" disabled={busy}>{busy ? "Confirming…" : "Confirm reset code"}</Button><p className="auth-process__demo">Frontend demo code: <b>123456</b></p></form>}
      {step === "PASSWORD" && <form onSubmit={submitPassword}>{error && <div className="form-error" role="alert">{error}</div>}<label>New password<div className="auth-input"><LockIcon /><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus /></div></label><label>Confirm new password<div className="auth-input"><LockIcon /><input type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></div></label><Button type="submit" disabled={busy}>{busy ? "Updating password…" : "Set new password"}</Button></form>}
      <div className="auth-process__links"><Link to="/login">← Back to login</Link></div>
    </AuthProcessShell>
  );
}
