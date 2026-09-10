import { Badge } from "../../components/ui";

export function AdminStatus({ status }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();
  const tone = ["ACTIVE", "OPEN", "COMPLETED", "CYCLE_COMPLETED"].includes(normalized)
    ? "green"
    : ["SUSPENDED", "CLOSED", "ENDED_PRE_START"].includes(normalized)
      ? "red"
      : "amber";

  return <Badge tone={tone}>{normalized.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function AdminPageIntro({ eyebrow, title, description, meta, children }) {
  return (
    <header className="super-admin-page-intro">
      <div>
        <span className="super-admin-page-intro__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {(meta || children) && <aside>{meta && <span>{meta}</span>}{children}</aside>}
    </header>
  );
}
