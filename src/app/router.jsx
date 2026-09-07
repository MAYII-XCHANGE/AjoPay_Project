import {
  createBrowserRouter,
} from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./route-guards";
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
  AdminsPage,
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
  TransactionsPage,
  TermsPage,
  WalletPage,
  UserSupportPage,
} from "../pages";
import { NotFoundPage, UnauthorizedPage } from "../pages/status";
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
        element: <RoleRoute roles={["USER"]} />,
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
              { path: "/join-requests", element: <AdminJoinRequestsPage /> },
              { path: "/ajos/create", element: <CreateAjoPage /> },
              { path: "/ajos/:ajoId", element: <AjoDetailPage /> },
              { path: "/ajos/:ajoId/manage", element: <ManageAjoPage /> },
              { path: "/ajos/:ajoId/order", element: <OrderPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute roles={["ADMIN", "SUPER_ADMIN"]} />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              { path: "/admin", element: <AdminOverviewPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/ajos", element: <AdminAjosPage /> },
              {
                path: "/admin/transactions",
                element: <AdminTransactionsPage />,
              },
              { path: "/admin/withdrawals", element: <AdminWithdrawalsPage /> },
              { path: "/admin/settings", element: <AdminSettingsPage /> },
              { path: "/admin/system-issues", element: <AdminSupportIssuesPage /> },
              {
                element: <RoleRoute roles={["SUPER_ADMIN"]} />,
                children: [{ path: "/admin/admins", element: <AdminsPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
