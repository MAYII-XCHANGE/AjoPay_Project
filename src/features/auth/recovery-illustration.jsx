function FloatingDot({ cx, cy, fill, radius = 4 }) {
  return <circle cx={cx} cy={cy} r={radius} fill={fill} />;
}

function EmailArtwork() {
  return (
    <>
      <path d="M68 151c25-36 51-44 78-22 23 18 50 14 82-12 5 31-4 53-27 66H91c-20-7-28-18-23-32Z" fill="#eef7f3" />
      <rect x="60" y="43" width="150" height="107" rx="22" fill="#fff" stroke="#dceae5" strokeWidth="4" />
      <path d="m78 69 57 42 57-42" fill="none" stroke="#2c765f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      <path d="m78 132 39-34m75 34-39-34" fill="none" stroke="#b9d9ce" strokeLinecap="round" strokeWidth="4" />
      <circle cx="215" cy="129" r="35" fill="#f6ce70" />
      <path d="M205 130c5 5 10 10 14 14l18-26" fill="none" stroke="#173f35" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
      <FloatingDot cx="235" cy="55" fill="#f6ce70" />
      <FloatingDot cx="250" cy="68" fill="#2c765f" radius="3" />
      <FloatingDot cx="45" cy="117" fill="#2c765f" radius="3" />
    </>
  );
}

function OtpArtwork() {
  return (
    <>
      <path d="M76 164c9-37 36-57 75-58 39-1 68 17 87 54-37 23-119 25-162 4Z" fill="#eef7f3" />
      <rect x="92" y="31" width="118" height="143" rx="26" fill="#fff" stroke="#dceae5" strokeWidth="4" />
      <path d="M125 47h52" stroke="#173f35" strokeLinecap="round" strokeWidth="4" />
      <rect x="108" y="69" width="86" height="58" rx="14" fill="#e9f5f0" />
      <path d="m118 84 33 25 33-25" fill="none" stroke="#2c765f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <circle cx="115" cy="148" r="13" fill="#f6ce70" />
      <circle cx="151" cy="148" r="13" fill="#2c765f" />
      <circle cx="187" cy="148" r="13" fill="#f6ce70" />
      <path d="M111 148h8m28 0h8m28 0h8" stroke="#fff" strokeLinecap="round" strokeWidth="3" />
      <path d="M230 53c19 4 29 15 30 35-1 20-11 32-30 36-19-4-29-16-30-36 1-20 11-31 30-35Z" fill="#173f35" />
      <path d="m218 89 9 9 17-21" fill="none" stroke="#f6ce70" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      <FloatingDot cx="63" cy="63" fill="#f6ce70" />
      <FloatingDot cx="72" cy="79" fill="#2c765f" radius="3" />
      <FloatingDot cx="250" cy="137" fill="#f6ce70" radius="3" />
    </>
  );
}

function PasswordArtwork() {
  return (
    <>
      <path d="M66 160c20-42 53-56 98-42 37 12 65 7 84-15 4 36-11 61-45 74H96c-21-2-31-8-30-17Z" fill="#eef7f3" />
      <path d="M95 83V68c0-35 20-53 51-53s51 18 51 53v15" fill="none" stroke="#173f35" strokeLinecap="round" strokeWidth="10" />
      <rect x="72" y="75" width="148" height="100" rx="25" fill="#fff" stroke="#dceae5" strokeWidth="4" />
      <circle cx="146" cy="117" r="19" fill="#2c765f" />
      <path d="M146 133v17" stroke="#2c765f" strokeLinecap="round" strokeWidth="8" />
      <circle cx="222" cy="67" r="31" fill="#f6ce70" />
      <path d="m210 68 9 9 17-21" fill="none" stroke="#173f35" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      <FloatingDot cx="54" cy="101" fill="#f6ce70" />
      <FloatingDot cx="246" cy="130" fill="#2c765f" radius="3" />
    </>
  );
}

export function RecoveryIllustration({ variant = "otp" }) {
  const Artwork = variant === "email" ? EmailArtwork : variant === "password" ? PasswordArtwork : OtpArtwork;

  return (
    <div className="auth-process__illustration" aria-hidden="true">
      <svg viewBox="0 0 300 190" role="presentation">
        <Artwork />
      </svg>
    </div>
  );
}
