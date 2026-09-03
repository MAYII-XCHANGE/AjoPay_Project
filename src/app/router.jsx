/* eslint-disable react-refresh/only-export-components */
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { UserDashboardLayout } from "../layouts/user-dashboard-layout";
import { AdminDashboardLayout } from "../layouts/admin-dashboard-layout";
import {
  AdminAjosPage,
  AdminJoinRequestsPage,
  AdminSupportIssuesPage,
  AdminOverviewPage,
  AdminSettingsPage,
  AdminTransactionsPage,
  AdminUsersPage,
  AdminWithdrawalsPage,
  AjoDetailPage,
  AuthPage,
  CreateAjoPage,
  DashboardPage,
  FindAjoPage,
  EmailVerificationPage,
  ForgotPasswordPage,
  LandingPage,
  PrivacyPage,
  ManageAjoPage,
  MyAjosPage,
  NotificationsPage,
  OrderPage,
  ProfilePage,
  RenewPage,
  TransactionsPage,
  TermsPage,
  WalletPage,
  UserSupportPage,
} from "../pages";
function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
function AdminRoute() {
  const { user } = useAuth();
  return user?.role === "ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/register", element: <AuthPage mode="register" /> },
  { path: "/verify-email", element: <EmailVerificationPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/ajos", element: <FindAjoPage publicView /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserDashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/find-ajo", element: <FindAjoPage /> },
          { path: "/my-ajos", element: <MyAjosPage /> },
          { path: "/wallet", element: <WalletPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/support", element: <UserSupportPage /> },
          { path: "/ajos/create", element: <CreateAjoPage /> },
          { path: "/ajos/:ajoId", element: <AjoDetailPage /> },
          { path: "/ajos/:ajoId/manage", element: <ManageAjoPage /> },
          { path: "/ajos/:ajoId/order", element: <OrderPage /> },
          { path: "/ajos/:ajoId/renew", element: <RenewPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              { path: "/admin", element: <AdminOverviewPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/ajos", element: <AdminAjosPage /> },
              {
                path: "/admin/join-requests",
                element: <AdminJoinRequestsPage />,
              },
              {
                path: "/admin/transactions",
                element: <AdminTransactionsPage />,
              },
              { path: "/admin/withdrawals", element: <AdminWithdrawalsPage /> },
              { path: "/admin/settings", element: <AdminSettingsPage /> },
              { path: "/admin/system-issues", element: <AdminSupportIssuesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
