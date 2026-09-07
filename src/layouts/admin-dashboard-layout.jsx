import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { MenuIcon } from "../components/icons";
import { AdminSidebar } from "../components/sidebar/admin-sidebar";
import { useAuth } from "../contexts/auth-context";
import { useTranslation } from "react-i18next";
import { adminService } from "../services/admin-service";
import { supportService } from "../services/support-service";
import { LogoutConfirmationModal } from "../components/logout-confirmation-modal";
import { SupportIssueStatus } from "../enums/statuses";

export function AdminDashboardLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user } = useAuth();
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.dashboard,
  });
  const pendingWithdrawals = Number(dashboard?.pendingWithdrawals ?? 0)
    + Number(dashboard?.processingWithdrawals ?? 0);
  const { data: supportIssuePage } = useQuery({
    queryKey: ["support-issues", "admin"],
    queryFn: supportService.listAll,
  });
  const openIssues = (supportIssuePage?.items || []).filter(
    (issue) => issue.status !== SupportIssueStatus.RESOLVED,
  ).length;
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

  return <div className="admin-shell">
    <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} badges={{ withdrawals: pendingWithdrawals, issues: openIssues }} onSignOut={requestSignOut} />
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label={t("navigation.close")} />}
    <main className="admin-main">
      <header className="admin-mobile-header"><button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label={t("navigation.openAdmin")} aria-expanded={sidebarOpen}><MenuIcon /></button><BrandMark /></header>
      <div className="admin-content"><Outlet /></div>
    </main>
    <LogoutConfirmationModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
  </div>;
}
