import { Link } from "react-router-dom";
import { BrandMark } from "../../components/brand-mark";
import { RecoveryIllustration } from "./recovery-illustration";

export function AuthProcessShell({
  eyebrow,
  title,
  description,
  step,
  illustration = "otp",
  align = "center",
  children,
}) {
  return (
    <main className="auth-process">
      <header className="auth-process__header">
        <BrandMark />
        <span>Secure account access</span>
      </header>

      <section className={`auth-process__shell auth-process__shell--${align}`}>
        <Link className="auth-process__close" to="/login" aria-label="Close and return to login">×</Link>
        <div className="auth-process__card">
          {step && (
            <div className="auth-process__progress" aria-label={`Step ${step} of 3`}>
              <span style={{ width: `${(step / 3) * 100}%` }} />
              <small>Step {step} of 3</small>
            </div>
          )}
          <RecoveryIllustration variant={illustration} />
          <div className="auth-process__heading">
            <small>{eyebrow}</small>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
      </section>
      <footer className="auth-process__footer">Protected by AjoPay security</footer>
    </main>
  );
}
