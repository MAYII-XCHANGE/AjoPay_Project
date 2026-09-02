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
import { useAuth } from "../contexts/auth-context";
import "./auth.css";

export function AuthPage({ mode }) {
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
      setError(
        "Please complete all fields. Passwords need at least 6 characters.",
      );
      return;
    }
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      const destination = location.state?.from ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch {
      setError("We couldn’t sign you in. Please try again.");
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
          <span className="eyebrow">SAVE WITH CONFIDENCE</span>
          <h1>
            Big goals feel lighter when we carry them <em>together.</em>
          </h1>
          <p>
            Join thousands of Nigerians building better futures through trusted
            savings circles.
          </p>
          <ul>
            <li>
              <CheckIcon />
              Transparent contribution records
            </li>
            <li>
              <CheckIcon />
              Secure, confirmed transactions
            </li>
            <li>
              <CheckIcon />
              Community ratings you can trust
            </li>
          </ul>
        </div>
        <small>
          <ShieldIcon />
          Your information is encrypted and protected.
        </small>
      </aside>
      <main>
        <button className="auth-back" type="button" onClick={goBack}>
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="auth-card">
          <BrandMark />
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>
            {mode === "login"
              ? "Log in to continue your savings journey."
              : "Start saving towards what matters to you."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Full name
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
              Email address
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
            <label>
              Password
              <div className="auth-input">
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </Button>
          </form>
          <div className="demo-row">
            <button onClick={() => demo()}>Use member demo</button>
            <button onClick={() => demo(true)}>Use admin demo</button>
          </div>
          <p className="auth-switch">
            {mode === "login" ? "New to AjoPay?" : "Already have an account?"}{" "}
            <Link to={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Create account" : "Log in"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
