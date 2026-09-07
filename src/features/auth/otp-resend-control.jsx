import { useEffect, useState } from "react";

const RESEND_DELAY_SECONDS = 60;

export function OtpResendControl({ onResend, busy, prompt = "Didn't receive the email?" }) {
  const [remaining, setRemaining] = useState(RESEND_DELAY_SECONDS);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  const resend = async () => {
    await onResend();
    setRemaining(RESEND_DELAY_SECONDS);
  };

  return <div className="auth-process__resend"><span>{prompt}</span><button type="button" onClick={resend} disabled={busy || remaining > 0}>{remaining > 0 ? `Resend in ${remaining}s` : "Resend code"}</button></div>;
}
