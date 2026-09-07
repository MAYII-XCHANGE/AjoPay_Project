import { BrandMark } from "../brand-mark";
import { CloseIcon, LogoutIcon } from "../icons";
import { userNavigationSections } from "../../config/navigation/user-navigation";
import { SidebarSection } from "./sidebar-section";
import { LanguageSelector } from "../language-selector";
import { useTranslation } from "react-i18next";

export function UserSidebar({
  open,
  onClose,
  user,
  unreadNotifications,
  onSignOut,
}) {
  const { t } = useTranslation();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "AP";
  return (
    <aside
      className={`sidebar user-sidebar ${open ? "sidebar--open" : ""}`}
      aria-label={t("navigation.open")}
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
      <nav className="sidebar__nav" aria-label="User navigation">
        {userNavigationSections.map((section) => (
          <SidebarSection
            key={section.label}
            section={section}
            badges={{ notifications: unreadNotifications }}
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
