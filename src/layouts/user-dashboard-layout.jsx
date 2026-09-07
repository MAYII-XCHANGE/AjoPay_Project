import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet } from "react-router-dom";
import { notificationService } from "../services/notification-service";
import { BrandMark } from "../components/brand-mark";
import { BellIcon, MenuIcon } from "../components/icons";
import { UserSidebar } from "../components/sidebar/user-sidebar";
import { useAuth } from "../contexts/auth-context";
import { useTranslation } from "react-i18next";
import { LogoutConfirmationModal } from "../components/logout-confirmation-modal";
import { DEFAULT_PAGE_SIZE } from "../config/pagination";

export function UserDashboardLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user } = useAuth();
  const { data: notificationPage } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationService.list({ page: 0, size: DEFAULT_PAGE_SIZE }),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000,
  });
  const unread = notificationPage?.unreadCount ?? 0;

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  const requestSignOut = () => {
    setSidebarOpen(false);
    setLogoutOpen(true);
  };

  return <div className="app-shell">
    <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} unreadNotifications={unread} onSignOut={requestSignOut} />
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label={t("navigation.close")} />}
    <main className="app-main">
      <header className="mobile-header"><button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label={t("navigation.open")} aria-expanded={sidebarOpen}><MenuIcon /></button><BrandMark /><NavLink to="/notifications" aria-label={t("navigation.unreadNotifications", { count: unread })} className="notification-link"><BellIcon />{unread > 0 && <b>{unread}</b>}</NavLink></header>
      <Outlet />
    </main>
    <LogoutConfirmationModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
  </div>;
}
