import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <main className="route-loader" aria-live="polite" aria-busy="true">
        <span className="route-loader__mark" aria-hidden="true"><i /><i /><i /></span>
        <p>Restoring your secure session…</p>
      </main>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function RoleRoute({ roles }) {
  const { user } = useAuth();
  const profileAllowed = roles.includes(user?.role);
  const tokenAllowed = roles.includes(user?.tokenRole || user?.role);
  return profileAllowed && tokenAllowed ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
