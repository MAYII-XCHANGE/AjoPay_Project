import {
  createBrowserRouter,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute, RoleRoute } from "./route-guards";
import { UserDashboardLayout } from "../layouts/user-dashboard-layout";
import { AdminDashboardLayout } from "../layouts/admin-dashboard-layout";
import { ADMIN_ROLES, UserRole } from "../enums/roles";

const lazyNamed = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const LandingPage = lazyNamed(() => import("../pages/landing"), "LandingPage");
const AuthPage = lazyNamed(() => import("../pages/auth"), "AuthPage");
const EmailVerificationPage = lazyNamed(() => import("../features/auth/auth-process-pages"), "EmailVerificationPage");
const ForgotPasswordPage = lazyNamed(() => import("../features/auth/auth-process-pages"), "ForgotPasswordPage");
const TermsPage = lazyNamed(() => import("../pages/legal"), "TermsPage");
const PrivacyPage = lazyNamed(() => import("../pages/legal"), "PrivacyPage");
const DashboardPage = lazyNamed(() => import("../pages/dashboard"), "DashboardPage");
const FindAjoPage = lazyNamed(() => import("../pages/ajos"), "FindAjoPage");
const MyAjosPage = lazyNamed(() => import("../pages/ajos"), "MyAjosPage");
const AjoDetailPage = lazyNamed(() => import("../pages/ajos"), "AjoDetailPage");
const CreateAjoPage = lazyNamed(() => import("../pages/ajos"), "CreateAjoPage");
const ManageAjoPage = lazyNamed(() => import("../pages/manage"), "ManageAjoPage");
const OrderPage = lazyNamed(() => import("../pages/manage"), "OrderPage");
const WalletPage = lazyNamed(() => import("../pages/money"), "WalletPage");
const TransactionsPage = lazyNamed(() => import("../pages/money"), "TransactionsPage");
const NotificationsPage = lazyNamed(() => import("../pages/account"), "NotificationsPage");
const ProfilePage = lazyNamed(() => import("../pages/account"), "ProfilePage");
const UserSupportPage = lazyNamed(() => import("../features/support/support-pages"), "UserSupportPage");
const AdminSupportIssuesPage = lazyNamed(() => import("../features/support/support-pages"), "AdminSupportIssuesPage");
const AdminJoinRequestsPage = lazyNamed(() => import("../features/join-requests/join-requests"), "AdminJoinRequestsPage");
const AdminOverviewPage = lazyNamed(() => import("../pages/admin"), "AdminOverviewPage");
const AdminUsersPage = lazyNamed(() => import("../pages/admin"), "AdminUsersPage");
const AdminAjosPage = lazyNamed(() => import("../pages/admin"), "AdminAjosPage");
const AdminTransactionsPage = lazyNamed(() => import("../pages/admin"), "AdminTransactionsPage");
const AdminWithdrawalsPage = lazyNamed(() => import("../pages/admin"), "AdminWithdrawalsPage");
const AdminSettingsPage = lazyNamed(() => import("../pages/admin"), "AdminSettingsPage");
const AdminsPage = lazyNamed(() => import("../pages/admin"), "AdminsPage");
const NotFoundPage = lazyNamed(() => import("../pages/status"), "NotFoundPage");
const UnauthorizedPage = lazyNamed(() => import("../pages/status"), "UnauthorizedPage");
const page = (Component, props) => <Suspense fallback={<main className="route-loader" aria-busy="true">Loading page...</main>}><Component {...props} /></Suspense>;
export const router = createBrowserRouter([
  { path: "/", element: page(LandingPage) },
  { path: "/login", element: page(AuthPage, { mode: "login" }) },
  { path: "/register", element: page(AuthPage, { mode: "register" }) },
  { path: "/verify-email", element: page(EmailVerificationPage) },
  { path: "/forgot-password", element: page(ForgotPasswordPage) },
  { path: "/terms", element: page(TermsPage) },
  { path: "/privacy", element: page(PrivacyPage) },
  { path: "/ajos", element: page(FindAjoPage, { publicView: true }) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={["USER"]} />,
        children: [
          {
            element: <UserDashboardLayout />,
            children: [
              { path: "/dashboard", element: page(DashboardPage) },
              { path: "/find-ajo", element: page(FindAjoPage) },
              { path: "/my-ajos", element: page(MyAjosPage) },
              { path: "/wallet", element: page(WalletPage) },
              { path: "/transactions", element: page(TransactionsPage) },
              { path: "/notifications", element: page(NotificationsPage) },
              { path: "/profile", element: page(ProfilePage) },
              { path: "/support", element: page(UserSupportPage) },
              { path: "/join-requests", element: page(AdminJoinRequestsPage) },
              { path: "/ajos/create", element: page(CreateAjoPage) },
              { path: "/ajos/:ajoId", element: page(AjoDetailPage) },
              { path: "/ajos/:ajoId/manage", element: page(ManageAjoPage) },
              { path: "/ajos/:ajoId/order", element: page(OrderPage) },
            ],
          },
        ],
      },
      {
        element: <RoleRoute roles={ADMIN_ROLES} />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              { path: "/admin", element: page(AdminOverviewPage) },
              { path: "/admin/users", element: page(AdminUsersPage) },
              { path: "/admin/ajos", element: page(AdminAjosPage) },
              {
                path: "/admin/transactions",
                element: page(AdminTransactionsPage),
              },
              { path: "/admin/withdrawals", element: page(AdminWithdrawalsPage) },
              { path: "/admin/settings", element: page(AdminSettingsPage) },
              { path: "/admin/system-issues", element: page(AdminSupportIssuesPage) },
              {
                element: <RoleRoute roles={[UserRole.SUPER_ADMIN]} />,
                children: [{ path: "/admin/admins", element: page(AdminsPage) }],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/unauthorized", element: page(UnauthorizedPage) },
  { path: "*", element: page(NotFoundPage) },
]);
