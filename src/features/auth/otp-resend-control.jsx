import { useEffect, useState } from "react";

export function OtpResendControl({ cooldownSeconds, onResend, busy, prompt = "Didn't receive the email?" }) {
  const [remaining, setRemaining] = useState(cooldownSeconds);

  useEffect(() => {
    if (!Number.isFinite(remaining) || remaining <= 0) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  const resend = async () => {
    const response = await onResend();
    setRemaining(response.resendCooldownSeconds);
  };

  return <div className="auth-process__resend"><span>{prompt}</span><button type="button" onClick={resend} disabled={busy || remaining > 0}>{remaining > 0 ? `Resend in ${remaining}s` : "Resend code"}</button></div>;
}
