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
import { useTranslation } from "react-i18next";
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: mockApi.wallet });
  const ajos = useQuery({
    queryKey: ["ajos", user?.id],
    queryFn: () => mockApi.getAjos(user?.id),
  });
  const transactions = useQuery({
    queryKey: ["transactions", "ALL"],
    queryFn: () => mockApi.transactions("ALL"),
  });
  const active = ajos.data?.filter((ajo) => ajo.joined) ?? [];
  return (
    <div className="page dashboard">
      <header className="welcome">
        <div>
          <span className="eyebrow">{t("dashboard.date")}</span>
          <h1>
            {t("dashboard.greeting", { name: user?.name.split(" ")[0] })} <span>👋🏾</span>
          </h1>
          <p>{t("dashboard.summary")}</p>
        </div>
        <Link to="/ajos/create" className="button button--primary">
          <PlusIcon />
          {t("dashboard.createAjo")}
        </Link>
      </header>
      <section className="stats-grid">
        <Card className="balance-card balance-card--main">
          <span>
            <WalletIcon />
            {t("dashboard.availableBalance")}
          </span>
          {wallet.isLoading ? (
            <Skeleton className="skeleton--amount" />
          ) : (
            <strong>{formatCurrency(wallet.data?.available ?? 0)}</strong>
          )}
          <div>
            <small>{t("dashboard.readyWithdraw")}</small>
            <Link to="/wallet">
              {t("dashboard.viewWallet")} <ArrowIcon />
            </Link>
          </div>
        </Card>
        <Card className="balance-card">
          <span>
            <UsersIcon />
            {t("dashboard.ajoBalance")}
          </span>
          {wallet.isLoading ? (
            <Skeleton className="skeleton--amount" />
          ) : (
            <strong>{formatCurrency(wallet.data?.ajoBalance ?? 0)}</strong>
          )}
          <div>
            <small>{t("dashboard.acrossAjos", { count: active.length || 1 })}</small>
            <i className="positive">
              <TrendIcon />
              +12.5%
            </i>
          </div>
        </Card>
        <Card className="balance-card">
          <span>
            <ReceiptIcon />
            {t("dashboard.nextContribution")}
          </span>
          <strong>{formatCurrency(100_000)}</strong>
          <div>
            <small>New Home Fund • 3 days</small>
            <Badge tone="amber">{t("dashboard.dueSoon")}</Badge>
          </div>
        </Card>
      </section>
      <div className="section-title">
        <div>
          <h2>{t("dashboard.activeAjos")}</h2>
          <p>{t("dashboard.activeAjosText")}</p>
        </div>
        <Link to="/my-ajos">
          {t("dashboard.viewAll")} <ArrowIcon />
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
              <h2>{t("dashboard.recentActivity")}</h2>
              <p>{t("dashboard.recentActivityText")}</p>
            </div>
            <Link to="/transactions">
              {t("dashboard.seeAll")} <ArrowIcon />
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
          <h2>{t("dashboard.quickActions")}</h2>
          <Link to="/find-ajo">
            <span>
              <SearchIcon />
            </span>
            <div>
              <b>{t("dashboard.findAjo")}</b>
              <small>{t("dashboard.findAjoText")}</small>
            </div>
            <ArrowIcon />
          </Link>
          <Link to="/wallet">
            <span>
              <WalletIcon />
            </span>
            <div>
              <b>{t("dashboard.fundWallet")}</b>
              <small>{t("dashboard.fundWalletText")}</small>
            </div>
            <ArrowIcon />
          </Link>
          <Link to="/notifications">
            <span>
              <BellIcon />
            </span>
            <div>
              <b>{t("dashboard.checkNotifications")}</b>
              <small>{t("dashboard.checkNotificationsText")}</small>
            </div>
            <ArrowIcon />
          </Link>
        </Card>
      </div>
    </div>
  );
}
