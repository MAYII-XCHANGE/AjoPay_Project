import { BrandMark } from "../brand-mark";
import { CloseIcon, LogoutIcon } from "../icons";
import { adminNavigationSections } from "../../config/navigation/admin-navigation";
import { SidebarSection } from "./sidebar-section";
import { LanguageSelector } from "../language-selector";
import { useTranslation } from "react-i18next";

export function AdminSidebar({ open, onClose, user, badges, onSignOut }) {
  const { t } = useTranslation();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "AD";
  return (
    <aside
      className={`sidebar sidebar--admin ${open ? "sidebar--open" : ""}`}
      aria-label={t("navigation.openAdmin")}
    >
      <div className="sidebar__brand">
        <BrandMark light />
        <button
          className="icon-button sidebar__close"
          onClick={onClose}
          aria-label={t("navigation.close")}
        >
          <CloseIcon />
        </button>
      </div>
      <span className="sidebar__context">{t("navigation.adminOperations")}</span>
      <nav className="sidebar__nav" aria-label="Admin navigation">
        {adminNavigationSections.map((section) => (
          <SidebarSection
            key={section.label}
            section={section}
            badges={badges}
            role={user?.role}
            onNavigate={onClose}
          />
        ))}
      </nav>
      <div className="sidebar__language">
        <LanguageSelector variant="dark" />
      </div>
      <div className="sidebar__profile">
        <span>{initials}</span>
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.email}</small>
        </div>
        <button onClick={onSignOut} aria-label={t("navigation.signOut")}>
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
