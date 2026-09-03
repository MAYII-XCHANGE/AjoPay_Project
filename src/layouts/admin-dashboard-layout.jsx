import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { ArrowIcon, MenuIcon } from "../components/icons";
import { AdminSidebar } from "../components/sidebar/admin-sidebar";
import { useAuth } from "../contexts/auth-context";
import { useTranslation } from "react-i18next";
import { mockApi } from "../api/mock-service";

export function AdminDashboardLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { data: pendingJoinRequests = [] } = useQuery({
    queryKey: ["join-requests", "admin", "PENDING"],
    queryFn: () => mockApi.getJoinRequests({ status: "PENDING" }),
  });
  const { data: withdrawalRequests = [] } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: mockApi.getAdminWithdrawals,
  });
  const pendingWithdrawals = withdrawalRequests.filter((request) =>
    ["PENDING", "PROCESSING"].includes(request.status),
  ).length;
  const { data: supportIssues = [] } = useQuery({
    queryKey: ["support-issues", "admin"],
    queryFn: mockApi.getAdminSupportIssues,
  });
  const openIssues = supportIssues.filter(
    (issue) => issue.status !== "RESOLVED",
  ).length;
  const navigate = useNavigate();
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  const signOut = () => { logout(); navigate("/"); };

  return <div className="admin-shell">
    <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} badges={{ withdrawals: pendingWithdrawals, issues: openIssues, joinRequests: pendingJoinRequests.length }} onSignOut={signOut} />
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label={t("navigation.close")} />}
    <main className="admin-main">
      <header className="admin-mobile-header"><button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label={t("navigation.openAdmin")} aria-expanded={sidebarOpen}><MenuIcon /></button><BrandMark /><Link to="/dashboard" aria-label={t("navigation.backToMember")}><ArrowIcon /></Link></header>
      <div className="admin-content"><Outlet /></div>
    </main>
  </div>;
}
