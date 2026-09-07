import { Link } from "react-router-dom";
export function BrandMark({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand--light" : ""}`}
      aria-label="AjoPay home"
    >
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        Ajo<span>Pay</span>
      </span>
    </Link>
  );
}
