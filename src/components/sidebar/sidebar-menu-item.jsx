import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SidebarMenuItem({ item, badge, onNavigate }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  if (item.disabled)
    return (
      <span
        className="sidebar-menu-item sidebar-menu-item--disabled"
        aria-disabled="true"
      >
        <Icon />
        <span>{t(`navigation.${item.translationKey}`, { defaultValue: item.label })}</span>
        {item.badge && <b>{item.badge}</b>}
      </span>
    );

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-menu-item${isActive ? " active" : ""}`
      }
    >
      <Icon />
      <span>{t(`navigation.${item.translationKey}`, { defaultValue: item.label })}</span>
      {badge > 0 && (
        <b aria-label={t("navigation.unread", { count: badge })}>{badge > 99 ? "99+" : badge}</b>
      )}
    </NavLink>
  );
}
