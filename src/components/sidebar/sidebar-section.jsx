import { SidebarMenuItem } from "./sidebar-menu-item";
import { useTranslation } from "react-i18next";

export function SidebarSection({ section, badges, role, onNavigate }) {
  const { t } = useTranslation();
  const items = section.items.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
  if (!items.length) return null;
  const headingId = `sidebar-${section.label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <section className="sidebar-section" aria-labelledby={headingId}>
      <p id={headingId}>{t(`navigation.${section.translationKey}`, { defaultValue: section.label })}</p>
      <div>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.path}
            item={item}
            badge={badges[item.badgeKey] ?? 0}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
