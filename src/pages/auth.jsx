import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "../components/icons";
import { Button } from "../components/ui";
import { LanguageSelector } from "../components/language-selector";
import { useAuth } from "../contexts/auth-context";
import { Trans, useTranslation } from "react-i18next";
import { hasErrors, validateLogin, validateRegistration } from "../utils/auth-validation";
import { notifyError, notifySuccess } from "../utils/notifications";
import "./auth.css";

export function AuthPage({ mode }) {
  const { t } = useTranslation();
  const { user, login, register, loading, sessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  useEffect(() => {
    if (retryAfterSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setRetryAfterSeconds((seconds) => Math.max(0, seconds - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  useEffect(() => {
    if (mode !== "login") return;
    if (location.state?.passwordReset) {
      notifySuccess("Password updated. You can now log in.", { id: "password-reset-complete" });
    } else if (location.state?.verified) {
      notifySuccess("Email verified. Sign in to continue.", { id: "email-verification-complete" });
    }
  }, [location.state, mode]);

  useEffect(() => {
    if (mode === "login" && sessionMessage) {
      notifyError(sessionMessage, undefined, { id: "session-message" });
    }
  }, [mode, sessionMessage]);

  if (user) return <Navigate to={user.role === "USER" ? "/dashboard" : "/admin"} replace />;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const nextErrors = mode === "register"
      ? validateRegistration({ name, email, password })
      : validateLogin({ email, password });
    setFieldErrors(nextErrors);
    if (hasErrors(nextErrors)) return setError(t("auth.validation"));
    try {
      let authenticatedUser;
      if (mode === "login") authenticatedUser = await login(email, password);
      else {
        const registration = await register(name, email, password);
        navigate("/verify-email", { state: { email, resendCooldownSeconds: registration.resendCooldownSeconds }, replace: true });
        return;
      }
      const fallback = authenticatedUser?.role === "USER" ? "/dashboard" : "/admin";
      const destination = location.state?.from ?? fallback;
      navigate(destination, { replace: true });
    } catch (requestError) {
      if (requestError.code === "EMAIL_VERIFICATION_REQUIRED") {
        navigate("/verify-email", { state: { email }, replace: true });
        return;
      }
      if (requestError.code === "RATE_LIMIT_EXCEEDED") {
        setRetryAfterSeconds(Number(requestError.data?.retryAfterSeconds));
      }
      const message = requestError.message || t("auth.loginError");
      setError(message);
      notifyError(message);
    }
  };

  return (
    <div className="auth-page">
      <aside>
        <BrandMark light />
        <div>
          <span className="eyebrow">{t("auth.saveWithConfidence")}</span>
          <h1>
            <Trans i18nKey="auth.headline" components={{ em: <em /> }} />
          </h1>
          <p>{t("auth.introduction")}</p>
          <ul>
            <li>
              <CheckIcon />
              {t("auth.transparentRecords")}
            </li>
            <li>
              <CheckIcon />
              {t("auth.secureTransactions")}
            </li>
            <li>
              <CheckIcon />
              {t("auth.trustedRatings")}
            </li>
          </ul>
        </div>
        <small>
          <ShieldIcon />
          {t("auth.protected")}
        </small>
      </aside>
      <main>
        <button className="auth-back" type="button" onClick={goBack}>
          <span aria-hidden="true">←</span> {t("auth.back")}
        </button>
        <div className="auth-language">
          <LanguageSelector />
        </div>
        <div className="auth-card">
          <BrandMark />
          <h2>{mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}</h2>
          <p>
            {mode === "login"
              ? t("auth.loginIntro")
              : t("auth.registerIntro")}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                {t("auth.fullName")}
                <div className="auth-input">
                  <UserIcon />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                </div>
                {fieldErrors.name && <small className="form-error">{fieldErrors.name}</small>}
              </label>
            )}
            <label>
              {t("auth.email")}
              <div className="auth-input">
                <MailIcon />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </div>
              {fieldErrors.email && <small className="form-error">{fieldErrors.email}</small>}
            </label>
            <label>
              {t("auth.password")}
              <div className="auth-input auth-input--password">
                <LockIcon />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password && <small className="form-error">{fieldErrors.password}</small>}
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {mode === "login" && (
              <Link className="auth-forgot" to="/forgot-password">
                Forgot password?
              </Link>
            )}
            <Button type="submit" disabled={loading || retryAfterSeconds > 0}>
              {retryAfterSeconds > 0
                ? `Try again in ${retryAfterSeconds}s`
                : loading
                ? t("auth.pleaseWait")
                : mode === "login"
                  ? t("auth.login")
                  : t("auth.create")}
            </Button>
            {mode === "register" && (
              <p className="auth-legal">
                <Trans
                  i18nKey="auth.legal"
                  components={{ terms: <Link to="/terms" /> }}
                />
              </p>
            )}
          </form>
          <p className="auth-switch">
            {mode === "login" ? t("auth.newToAjoPay") : t("auth.alreadyAccount")}{" "}
            <Link to={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? t("auth.create") : t("auth.login")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
