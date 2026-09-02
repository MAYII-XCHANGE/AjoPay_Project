import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "../api/mock-service";
import { BrandMark } from "../components/brand-mark";
import { BellIcon, CloseIcon, HomeIcon, LogoutIcon, MenuIcon, ReceiptIcon, SearchIcon, UserIcon, UsersIcon, WalletIcon } from "../components/icons";
import { useAuth } from "../contexts/auth-context";
const nav = [
    { to: "/dashboard", label: "Home", icon: HomeIcon },
    { to: "/find-ajo", label: "Find an Ajo", icon: SearchIcon },
    { to: "/my-ajos", label: "My Ajos", icon: UsersIcon },
    { to: "/wallet", label: "Wallet", icon: WalletIcon },
    { to: "/transactions", label: "Transactions", icon: ReceiptIcon },
];
export function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: mockApi.notifications });
    const unread = notifications.filter((item) => !item.read).length;
    const signOut = () => { logout(); navigate("/"); };
    return (<div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand"><BrandMark light/><button className="icon-button sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><CloseIcon /></button></div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          <p>Overview</p>
          {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}><Icon />{label}</NavLink>)}
          <p>Account</p>
          <NavLink to="/notifications" onClick={() => setMobileOpen(false)}><BellIcon />Notifications{unread > 0 && <b>{unread}</b>}</NavLink>
          <NavLink to="/profile" onClick={() => setMobileOpen(false)}><UserIcon />Profile</NavLink>
          {user?.role === "ADMIN" && <NavLink to="/admin" onClick={() => setMobileOpen(false)}><UsersIcon />Admin portal</NavLink>}
        </nav>
        <div className="sidebar__profile">
          <span>{user?.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <div><strong>{user?.name}</strong><small>{user?.email}</small></div>
          <button onClick={signOut} aria-label="Sign out"><LogoutIcon /></button>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
      <main className="app-main">
        <header className="mobile-header"><button className="icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuIcon /></button><BrandMark /><NavLink to="/notifications" aria-label={`${unread} unread notifications`} className="notification-link"><BellIcon />{unread > 0 && <b>{unread}</b>}</NavLink></header>
        <Outlet />
      </main>
    </div>);
}
