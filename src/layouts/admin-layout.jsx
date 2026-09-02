import { NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
const links = [
  ["/admin", "Overview"],
  ["/admin/users", "Users"],
  ["/admin/ajos", "Ajos"],
  ["/admin/transactions", "Transactions"],
  ["/admin/withdrawals", "Withdrawals"],
  ["/admin/settings", "Settings"],
  ["/admin/system-issues", "System issues"],
];
export function AdminLayout() {
  return (
    <div className="admin-shell">
      <header>
        <BrandMark />
        <span>Operations</span>
        <NavLink to="/dashboard">Back to app</NavLink>
      </header>
      <nav aria-label="Admin navigation">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
