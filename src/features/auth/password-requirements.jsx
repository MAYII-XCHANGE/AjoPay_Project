import { CheckIcon } from "../../components/icons";

export function PasswordRequirements({ password }) {
  const requirements = [
    [password.length >= 8, "At least 8 characters"],
    [/[A-Z]/.test(password), "One uppercase letter"],
    [/[a-z]/.test(password), "One lowercase letter"],
    [/\d/.test(password), "One number"],
  ];
  return (
    <div className="password-requirements" aria-label="Password requirements">
      {requirements.map(([complete, label]) => (
        <span key={label} className={complete ? "is-complete" : ""}>
          <i>{complete ? <CheckIcon /> : null}</i>{label}
        </span>
      ))}
    </div>
  );
}
