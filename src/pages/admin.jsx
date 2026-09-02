import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "../api/mock-service";
import {
  CheckIcon,
  ReceiptIcon,
  ShieldIcon,
  TrendIcon,
  UsersIcon,
  WalletIcon,
} from "../components/icons";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
} from "../components/ui";
import { formatCurrency, formatDate } from "../utils/formatters";
const users = [
  ["Mayowa Adeyemi", "mayowa@example.com", "12", "Verified"],
  ["Amina Yusuf", "amina@example.com", "8", "Verified"],
  ["Chidi Eze", "chidi@example.com", "5", "Review"],
  ["Ngozi Okafor", "ngozi@example.com", "18", "Verified"],
];
export function AdminOverviewPage() {
  const { data: txs = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: mockApi.transactions,
  });
  return (
    <>
      <PageHeader
        eyebrow="OPERATIONS"
        title="Good afternoon, Admin"
        description="Here’s what’s happening across AjoPay today."
      />
      <div className="admin-metrics">
        <Metric
          icon={<UsersIcon />}
          label="Total users"
          value="12,482"
          note="+8.2% this month"
        />
        <Metric
          icon={<ShieldIcon />}
          label="Active Ajos"
          value="1,204"
          note="87 starting soon"
        />
        <Metric
          icon={<WalletIcon />}
          label="Money in Ajos"
          value="₦2.4B"
          note="Server confirmed"
        />
        <Metric
          icon={<ReceiptIcon />}
          label="Pending withdrawals"
          value="23"
          note="₦3.8M to process"
          tone="amber"
        />
      </div>
      <div className="admin-grid">
        <Card>
          <h2>Platform activity</h2>
          <div className="chart">
            <div>
              <span style={{ height: "36%" }} />
              <span style={{ height: "48%" }} />
              <span style={{ height: "43%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "58%" }} />
              <span style={{ height: "82%" }} />
              <span style={{ height: "76%" }} />
            </div>
            <small>Confirmed transaction volume • Last 7 days</small>
          </div>
        </Card>
        <Card>
          <h2>Needs attention</h2>
          <div className="attention-list">
            <span>
              <i className="amber-dot" />
              <span>
                <b>23 withdrawals</b>
                <small>Awaiting processing</small>
              </span>
            </span>
            <span>
              <i className="red-dot" />
              <span>
                <b>2 system issues</b>
                <small>Require investigation</small>
              </span>
            </span>
            <span>
              <i className="green-dot" />
              <span>
                <b>14 user reviews</b>
                <small>Identity checks pending</small>
              </span>
            </span>
          </div>
        </Card>
      </div>
      <Card>
        <h2>Recent transactions</h2>
        <AdminTransactionRows rows={txs.slice(0, 3)} />
      </Card>
    </>
  );
}
function Metric({ icon, label, value, note, tone = "green" }) {
  return (
    <Card className="admin-metric">
      <span className={`metric-icon metric-icon--${tone}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>
          <TrendIcon />
          {note}
        </span>
      </div>
    </Card>
  );
}
export function AdminUsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="PEOPLE"
        title="Users"
        description="Review accounts, trust history, and verification status."
      />
      <Card className="table-card">
        <div className="data-table">
          <div className="data-table__head">
            <span>User</span>
            <span>Completed cycles</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {users.map((user) => (
            <div className="data-table__row" key={user[1]}>
              <span>
                <i className="avatar">
                  {user[0]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </i>
                <span>
                  <b>{user[0]}</b>
                  <small>{user[1]}</small>
                </span>
              </span>
              <span>{user[2]}</span>
              <span>
                <Badge tone={user[3] === "Verified" ? "green" : "amber"}>
                  {user[3]}
                </Badge>
              </span>
              <Button variant="ghost">Review</Button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
export function AdminAjosPage() {
  const { data = [] } = useQuery({
    queryKey: ["ajos"],
    queryFn: mockApi.getAjos,
  });
  return (
    <>
      <PageHeader
        eyebrow="CIRCLES"
        title="Ajos"
        description="Monitor the health and status of every savings circle."
      />
      <Card className="table-card">
        <div className="data-table">
          <div className="data-table__head">
            <span>Ajo</span>
            <span>Members</span>
            <span>Contribution</span>
            <span>Status</span>
          </div>
          {data.map((ajo) => (
            <div className="data-table__row" key={ajo.id}>
              <span>
                <span>
                  <b>{ajo.name}</b>
                  <small>by {ajo.creator}</small>
                </span>
              </span>
              <span>
                {ajo.filledSlots}/{ajo.slotCount}
              </span>
              <span>{formatCurrency(ajo.contributionAmount)}</span>
              <Badge tone={ajo.status === "ACTIVE" ? "blue" : "green"}>
                {ajo.status.toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
function AdminTransactionRows({ rows }) {
  return (
    <div className="data-table">
      <div className="data-table__head">
        <span>Transaction</span>
        <span>Date</span>
        <span>Status</span>
        <span>Amount</span>
      </div>
      {rows.map((tx) => (
        <div className="data-table__row" key={tx.id}>
          <span>
            <span>
              <b>{tx.title}</b>
              <small>{tx.id}</small>
            </span>
          </span>
          <span>{formatDate(tx.date)}</span>
          <Badge tone={tx.status === "SUCCESSFUL" ? "green" : "amber"}>
            {tx.status.toLowerCase()}
          </Badge>
          <strong>{formatCurrency(tx.amount)}</strong>
        </div>
      ))}
    </div>
  );
}
export function AdminTransactionsPage() {
  const { data = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: mockApi.transactions,
  });
  return (
    <>
      <PageHeader
        eyebrow="FINANCIAL OVERSIGHT"
        title="Transactions"
        description="A read-only view of server-confirmed money movement."
      />
      <Card>
        <AdminTransactionRows rows={data} />
      </Card>
    </>
  );
}
export function AdminWithdrawalsPage() {
  const [selected, setSelected] = useState(null);
  const withdrawals = [
    {
      id: "WD-1042",
      name: "Kemi Adeola",
      amount: 450000,
      bank: "Access Bank • 1021",
      age: "12 min",
    },
    {
      id: "WD-1041",
      name: "Ibrahim Musa",
      amount: 180000,
      bank: "GTBank • 6720",
      age: "34 min",
    },
    {
      id: "WD-1039",
      name: "Tolu Akin",
      amount: 320000,
      bank: "UBA • 4408",
      age: "1 hr",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="OPERATIONS QUEUE"
        title="Withdrawals"
        description="Review and process confirmed withdrawal requests."
      />
      <Card className="table-card">
        <div className="data-table">
          <div className="data-table__head">
            <span>Customer</span>
            <span>Destination</span>
            <span>Requested</span>
            <span>Amount</span>
          </div>
          {withdrawals.map((row) => (
            <button
              className="data-table__row"
              key={row.id}
              onClick={() => setSelected(row.id)}
            >
              <span>
                <span>
                  <b>{row.name}</b>
                  <small>{row.id}</small>
                </span>
              </span>
              <span>{row.bank}</span>
              <span>{row.age} ago</span>
              <strong>{formatCurrency(row.amount)}</strong>
            </button>
          ))}
        </div>
      </Card>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Process ${selected ?? "withdrawal"}`}
      >
        <div className="confirm-panel">
          <p>
            Confirm the provider status before updating this request. This
            action is recorded in the operations log.
          </p>
          <div>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Keep pending
            </Button>
            <Button onClick={() => setSelected(null)}>Mark as processed</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
export function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="PLATFORM CONTROLS"
        title="Settings"
        description="Manage operational limits and financial rules."
      />
      <Card className="settings-card">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <label>
            Minimum contribution (₦)
            <input type="number" defaultValue="1000" />
          </label>
          <label>
            Maximum empty Ajos per creator
            <input type="number" defaultValue="3" />
          </label>
          <label>
            Default withdrawal fee (%)
            <input type="number" defaultValue="1" />
          </label>
          <label>
            Maximum creator commission (%)
            <input type="number" defaultValue="5" />
          </label>
          {saved && (
            <div className="success-banner full">
              <CheckIcon />
              Settings saved successfully.
            </div>
          )}
          <Button type="submit">Save settings</Button>
        </form>
      </Card>
    </>
  );
}
export function SystemIssuesPage() {
  return (
    <>
      <PageHeader
        eyebrow="MONITORING"
        title="System issues"
        description="Critical exceptions that may need operational intervention."
      />
      <Card>
        <EmptyState
          icon={<ShieldIcon />}
          title="No open system issues"
          text="Everything is operating normally. New critical issues will appear here."
        />
      </Card>
    </>
  );
}
