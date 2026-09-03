import { useState } from "react";
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
import "./auth.css";

export function AuthPage({ mode }) {
  const { t } = useTranslation();
  const { user, login, register, loading, enterDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (
      !email.includes("@") ||
      password.length < 6 ||
      (mode === "register" && !name.trim())
    ) {
      setError(t("auth.validation"));
      return;
    }
    try {
      if (mode === "login") await login(email, password);
      else {
        await register(name, email, password);
        sessionStorage.setItem("ajopay-verification-email", email);
        navigate("/verify-email", { state: { email }, replace: true });
        return;
      }
      const destination = location.state?.from ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || t("auth.loginError"));
    }
  };

  const demo = (admin = false) => {
    enterDemo(admin);
    navigate(admin ? "/admin" : "/dashboard");
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
          {mode === "login" && location.state?.passwordReset && (
            <div className="success-banner" role="status">
              <CheckIcon /> Password updated. You can now log in.
            </div>
          )}
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
                  />
                </div>
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
                />
              </div>
            </label>
            {mode === "login" && (
              <Link className="auth-forgot" to="/forgot-password">
                Forgot password?
              </Link>
            )}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading
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
          <div className="demo-row">
            <button onClick={() => demo()}>{t("auth.memberDemo")}</button>
            <button onClick={() => demo(true)}>{t("auth.adminDemo")}</button>
          </div>
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
