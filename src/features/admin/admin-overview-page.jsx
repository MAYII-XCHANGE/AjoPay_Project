import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "../../services/admin-service";
import { useAuth } from "../../contexts/auth-context";
import { Card, Skeleton } from "../../components/ui";
import { ArrowIcon, ReceiptIcon, ShieldIcon, TrendIcon, UsersIcon, WalletIcon } from "../../components/icons";
import { QueryErrorState } from "../../components/query-state";
import { formatCurrency, formatCurrentDate } from "../../utils/formatters";
import { UserRole } from "../../enums/roles";
import "./admin-pages.css";

function OverviewMetric({ icon, label, value, note, tone }) {
  return (
    <Card className={`super-admin-metric super-admin-metric--${tone}`}>
      <span className="super-admin-metric__icon">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong><span>{note}</span></div>
    </Card>
  );
}

export function AdminOverviewPage() {
  const { user } = useAuth();
  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.dashboard, refetchInterval: 60_000 });
  const data = dashboard.data || {};
  const totalUsers = Number(data.totalUsers ?? 0);
  const totalAjos = Number(data.totalAjos ?? 0);
  const availableBalance = Number(data.availableBalance ?? 0);
  const ajoBalance = Number(data.ajoBalance ?? 0);
  const pendingWithdrawals = Number(data.pendingWithdrawals ?? 0);
  const processingWithdrawals = Number(data.processingWithdrawals ?? 0);
  const totalWalletFunds = availableBalance + ajoBalance;
  const availableShare = totalWalletFunds > 0 ? Math.round((availableBalance / totalWalletFunds) * 100) : 0;
  const withdrawalQueue = pendingWithdrawals + processingWithdrawals;
  const firstName = user?.name?.split(" ")[0] || "Administrator";

  return (
    <div className="super-admin-page super-admin-overview">
      <section className="super-admin-welcome">
        <div>
          <span className="super-admin-welcome__eyebrow">
            {user?.role === UserRole.SUPER_ADMIN ? "SUPER ADMIN CONSOLE" : "ADMIN CONSOLE"}
          </span>
          <h1>Welcome !</h1>
          <p>Monitor platform activity, customer access, Ajo groups, and financial operations from one place.</p>
        </div>
      </section>

      {dashboard.isError && <QueryErrorState error={dashboard.error} title="Platform overview could not be loaded" />}

      {dashboard.isLoading ? (
        <div className="super-admin-metrics">{[1, 2, 3, 4].map((item) => <Skeleton className="skeleton--card" key={item} />)}</div>
      ) : (
        <div className="super-admin-metrics">
          <OverviewMetric icon={<UsersIcon />} label="Registered users" value={totalUsers.toLocaleString()} note="Platform accounts" tone="green" />
          <OverviewMetric icon={<ShieldIcon />} label="Ajo groups" value={totalAjos.toLocaleString()} note="Across all statuses" tone="blue" />
          <OverviewMetric icon={<WalletIcon />} label="Funds in wallets" value={formatCurrency(totalWalletFunds)} note="Available and committed" tone="gold" />
          <OverviewMetric icon={<ReceiptIcon />} label="Withdrawal queue" value={withdrawalQueue.toLocaleString()} note="Requires attention" tone="red" />
        </div>
      )}

      <div className="super-admin-overview-grid">
        <Card className="super-admin-treasury">
          <header><div><small>TREASURY POSITION</small><h2>Wallet balances</h2></div><WalletIcon /></header>
          <strong>{formatCurrency(totalWalletFunds)}</strong>
          <p>Total funds currently represented across customer wallets.</p>
          <div className="super-admin-treasury__bar" aria-label={`${availableShare}% available wallet balance`}>
            <span style={{ width: `${availableShare}%` }} />
          </div>
          <dl>
            <div><dt><i className="available" />Available wallets</dt><dd>{formatCurrency(availableBalance)}</dd></div>
            <div><dt><i className="committed" />Ajo wallets</dt><dd>{formatCurrency(ajoBalance)}</dd></div>
          </dl>
        </Card>

        <Card className="super-admin-queue">
          <header><div><small>OPERATIONS QUEUE</small><h2>Withdrawals</h2></div><Link to="/admin/withdrawals">Open queue <ArrowIcon /></Link></header>
          <div className="super-admin-queue__total"><strong>{withdrawalQueue}</strong><span>requests in progress</span></div>
          <div className="super-admin-queue__rows">
            <div><span>Pending review</span><b>{pendingWithdrawals}</b></div>
            <div><span>Processing settlement</span><b>{processingWithdrawals}</b></div>
          </div>
        </Card>
      </div>

      <section className="super-admin-shortcuts">
        <header><div><small>QUICK ACCESS</small><h2>Continue managing AjoPay</h2></div></header>
        <div>
          <Link to="/admin/users"><span><UsersIcon /></span><div><b>Manage users</b><small>Review accounts and access</small></div><ArrowIcon /></Link>
          <Link to="/admin/ajos"><span><ShieldIcon /></span><div><b>Review Ajos</b><small>Monitor groups and capacity</small></div><ArrowIcon /></Link>
          <Link to="/admin/transactions"><span><TrendIcon /></span><div><b>General ledger</b><small>Inspect financial entries</small></div><ArrowIcon /></Link>
        </div>
      </section>
    </div>
  );
}
