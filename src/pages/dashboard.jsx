import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { mockApi } from "../api/mock-service";
import {
  ArrowIcon,
  BellIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  TrendIcon,
  UsersIcon,
  WalletIcon,
} from "../components/icons";
import { Badge, Card, Skeleton } from "../components/ui";
import { AjoCard } from "../features/ajo/ajo-card";
import { useAuth } from "../contexts/auth-context";
import { formatCurrency } from "../utils/formatters";
export function DashboardPage() {
  const { user } = useAuth();
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: mockApi.wallet });
  const ajos = useQuery({ queryKey: ["ajos"], queryFn: mockApi.getAjos });
  const transactions = useQuery({
    queryKey: ["transactions"],
    queryFn: mockApi.transactions,
  });
  const active = ajos.data?.filter((ajo) => ajo.joined) ?? [];
  return (
    <div className="page dashboard">
      <header className="welcome">
        <div>
          <span className="eyebrow">WEDNESDAY, 2 SEPTEMBER</span>
          <h1>
            Good afternoon, {user?.name.split(" ")[0]} <span>👋🏾</span>
          </h1>
          <p>Here’s how your savings are doing today.</p>
        </div>
        <Link to="/ajos/create" className="button button--primary">
          <PlusIcon />
          Create an Ajo
        </Link>
      </header>
      <section className="stats-grid">
        <Card className="balance-card balance-card--main">
          <span>
            <WalletIcon />
            Available balance
          </span>
          {wallet.isLoading ? (
            <Skeleton className="skeleton--amount" />
          ) : (
            <strong>{formatCurrency(wallet.data?.available ?? 0)}</strong>
          )}
          <div>
            <small>Ready to withdraw</small>
            <Link to="/wallet">
              View wallet <ArrowIcon />
            </Link>
          </div>
        </Card>
        <Card className="balance-card">
          <span>
            <UsersIcon />
            Ajo balance
          </span>
          {wallet.isLoading ? (
            <Skeleton className="skeleton--amount" />
          ) : (
            <strong>{formatCurrency(wallet.data?.ajoBalance ?? 0)}</strong>
          )}
          <div>
            <small>Across {active.length || 1} active Ajos</small>
            <i className="positive">
              <TrendIcon />
              +12.5%
            </i>
          </div>
        </Card>
        <Card className="balance-card">
          <span>
            <ReceiptIcon />
            Next contribution
          </span>
          <strong>{formatCurrency(100_000)}</strong>
          <div>
            <small>New Home Fund • 3 days</small>
            <Badge tone="amber">Due soon</Badge>
          </div>
        </Card>
      </section>
      <div className="section-title">
        <div>
          <h2>Your active Ajos</h2>
          <p>Keep track of your ongoing savings circles.</p>
        </div>
        <Link to="/my-ajos">
          View all <ArrowIcon />
        </Link>
      </div>
      <div className="ajo-grid">
        {ajos.isLoading
          ? [1, 2].map((n) => <Skeleton className="skeleton--card" key={n} />)
          : active.map((ajo) => <AjoCard ajo={ajo} key={ajo.id} />)}
        {active.length === 1 &&
          ajos.data
            ?.filter((ajo) => ajo.status === "OPEN")
            .slice(0, 1)
            .map((ajo) => <AjoCard ajo={ajo} key={ajo.id} />)}
      </div>
      <div className="dashboard-bottom">
        <Card>
          <div className="section-title section-title--compact">
            <div>
              <h2>Recent activity</h2>
              <p>Your latest wallet movements.</p>
            </div>
            <Link to="/transactions">
              See all <ArrowIcon />
            </Link>
          </div>
          <div className="activity-list">
            {transactions.data?.slice(0, 3).map((tx) => (
              <div key={tx.id}>
                <span
                  className={`activity-icon activity-icon--${tx.direction}`}
                >
                  {tx.direction === "credit" ? <TrendIcon /> : <ReceiptIcon />}
                </span>
                <div>
                  <b>{tx.title}</b>
                  <small>{tx.subtitle}</small>
                </div>
                <strong className={tx.direction}>
                  {tx.direction === "credit" ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </strong>
              </div>
            ))}
          </div>
        </Card>
        <Card className="quick-actions">
          <h2>Quick actions</h2>
          <Link to="/find-ajo">
            <span>
              <SearchIcon />
            </span>
            <div>
              <b>Find an Ajo</b>
              <small>Browse trusted savings circles</small>
            </div>
            <ArrowIcon />
          </Link>
          <Link to="/wallet">
            <span>
              <WalletIcon />
            </span>
            <div>
              <b>Fund your wallet</b>
              <small>Add money for contributions</small>
            </div>
            <ArrowIcon />
          </Link>
          <Link to="/notifications">
            <span>
              <BellIcon />
            </span>
            <div>
              <b>Check notifications</b>
              <small>Stay on top of every update</small>
            </div>
            <ArrowIcon />
          </Link>
        </Card>
      </div>
    </div>
  );
}
