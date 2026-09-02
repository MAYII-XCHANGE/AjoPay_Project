/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { AppLayout } from "../layouts/app-layout";
import { AdminLayout } from "../layouts/admin-layout";
import { AdminAjosPage, AdminOverviewPage, AdminSettingsPage, AdminTransactionsPage, AdminUsersPage, AdminWithdrawalsPage, AjoDetailPage, AuthPage, CreateAjoPage, DashboardPage, FindAjoPage, LandingPage, ManageAjoPage, MyAjosPage, NotificationsPage, OrderPage, ProfilePage, RenewPage, SystemIssuesPage, TransactionsPage, WalletPage } from "../pages";
function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();
    return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }}/>;
}
function AdminRoute() {
    const { user } = useAuth();
    return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/dashboard" replace/>;
}
export const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    { path: "/login", element: <AuthPage mode="login"/> },
    { path: "/register", element: <AuthPage mode="register"/> },
    { path: "/ajos", element: <FindAjoPage publicView/> },
    { element: <ProtectedRoute />, children: [
            { element: <AppLayout />, children: [
                    { path: "/dashboard", element: <DashboardPage /> },
                    { path: "/find-ajo", element: <FindAjoPage /> },
                    { path: "/my-ajos", element: <MyAjosPage /> },
                    { path: "/wallet", element: <WalletPage /> },
                    { path: "/transactions", element: <TransactionsPage /> },
                    { path: "/notifications", element: <NotificationsPage /> },
                    { path: "/profile", element: <ProfilePage /> },
                    { path: "/ajos/create", element: <CreateAjoPage /> },
                    { path: "/ajos/", element: <AjoDetailPage /> },
                    { path: "/ajos/manage", element: <ManageAjoPage /> },
                    { path: "/ajos/order", element: <OrderPage /> },
                    { path: "/ajos/renew", element: <RenewPage /> },
                ] },
            { element: <AdminRoute />, children: [{ element: <AdminLayout />, children: [
                            { path: "/admin", element: <AdminOverviewPage /> },
                            { path: "/admin/users", element: <AdminUsersPage /> },
                            { path: "/admin/ajos", element: <AdminAjosPage /> },
                            { path: "/admin/transactions", element: <AdminTransactionsPage /> },
                            { path: "/admin/withdrawals", element: <AdminWithdrawalsPage /> },
                            { path: "/admin/settings", element: <AdminSettingsPage /> },
                            { path: "/admin/system-issues", element: <SystemIssuesPage /> },
                        ] }] },
        ] },
    { path: "*", element: <Navigate to="/" replace/> },
]);
