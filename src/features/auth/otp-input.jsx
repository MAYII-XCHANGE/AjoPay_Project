import { useRef } from "react";

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, disabled = false, autoFocus = false }) {
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || "");

  const setDigit = (index, input) => {
    const numeric = input.replace(/\D/g, "");
    if (numeric.length > 1) {
      const completeCode = numeric.slice(0, OTP_LENGTH);
      onChange(completeCode);
      refs.current[Math.min(completeCode.length, OTP_LENGTH) - 1]?.focus();
      return;
    }
    const digit = numeric.slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const onPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  return (
    <fieldset className="otp-input" disabled={disabled} onPaste={onPaste}>
      <legend>6-digit verification code</legend>
      <div>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { refs.current[index] = element; }}
            value={digit}
            className={digit ? "has-value" : ""}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Verification code digit ${index + 1}`}
            autoFocus={autoFocus && index === 0}
            maxLength="1"
          />
        ))}
      </div>
    </fieldset>
  );
}
