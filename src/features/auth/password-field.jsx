import { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "../../components/icons";

export function PasswordField({ label, value, onChange, autoFocus = false, autoComplete = "new-password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="auth-process__field">
      <span>{label}</span>
      <div className="auth-input auth-input--password">
        <LockIcon />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          minLength="8"
          required
        />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}
