import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ajoService } from "../services/ajo-service";
import { adminService } from "../services/admin-service";
import { ReceiptIcon, ShieldIcon, UsersIcon, WalletIcon } from "../components/icons";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from "../components/ui";
import { Pagination } from "../components/pagination";
import { useAuth } from "../contexts/auth-context";
import { formatCurrency, formatDate } from "../utils/formatters";
import { validateAdminAccount } from "../utils/admin-validation";

function Metric({ icon, label, value, note, tone = "green" }) {
  return <Card className="admin-metric"><span className={`admin-metric__icon admin-metric__icon--${tone}`}>{icon}</span><small>{label}</small><strong>{value}</strong><span>{note}</span></Card>;
}

function QueryError({ error }) {
  return <div className="form-error" role="alert">{error?.message || "We couldn’t load this information."}</div>;
}

export function AdminOverviewPage() {
  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.dashboard, refetchInterval: 60_000 });
  const data = dashboard.data || {};
  return <>
    <PageHeader eyebrow="OPERATIONS" title="Platform overview" description="Server-confirmed activity across AjoPay." />
    {dashboard.isError && <QueryError error={dashboard.error} />}
    <div className="admin-metrics">
      <Metric icon={<UsersIcon />} label="Total users" value={String(data.totalUsers ?? data.userCount ?? 0)} note="Registered accounts" />
      <Metric icon={<ShieldIcon />} label="Ajo groups" value={String(data.totalAjos ?? data.groupCount ?? 0)} note="All group statuses" />
      <Metric icon={<WalletIcon />} label="Available balances" value={formatCurrency(data.totalAvailableBalance ?? data.availableBalance ?? 0)} note="Across user wallets" />
      <Metric icon={<ReceiptIcon />} label="Pending withdrawals" value={String(data.pendingWithdrawals ?? data.pendingWithdrawalCount ?? 0)} note="Awaiting operations" tone="amber" />
    </div>
    <div className="admin-grid">
      <Card><h2>Ajo wallet balances</h2><strong>{formatCurrency(data.totalAjoBalance ?? data.ajoBalance ?? 0)}</strong><p>Aggregate funds held for Ajo participation.</p></Card>
      <Card><h2>Withdrawal queue</h2><strong>{String(data.processingWithdrawals ?? data.processingWithdrawalCount ?? 0)}</strong><p>Manual settlements currently in progress.</p></Card>
    </div>
  </>;
}

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const client = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users", page, status], queryFn: () => adminService.users({ page, size: 20, status }) });
  const userDetails = useQuery({ queryKey: ["admin-user", selected?.id], queryFn: () => adminService.user(selected.id), enabled: Boolean(selected) });
  const update = useMutation({
    meta: { successMessage: (_data, variables) => `The user account is now ${variables.nextStatus.toLowerCase()}.` },
    mutationFn: ({ id, nextStatus }) => adminService.updateUserStatus(id, nextStatus),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["admin-users"] }); setSelected(null); },
  });
  return <>
    <PageHeader eyebrow="USER OPERATIONS" title="Users" description="Review safe user profiles and manage account access." />
    <div className="filter-bar filter-bar--simple"><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></div>
    <Card className="table-card">
      {users.isError && <QueryError error={users.error} />}
      <div className="data-table"><div className="data-table__head"><span>User</span><span>Role</span><span>Status</span><span>Joined</span></div>
        {users.isLoading ? <Skeleton className="skeleton--table" /> : users.data?.items.length ? users.data.items.map((row) => <button type="button" className="data-table__row" key={row.id} onClick={() => setSelected(row)}><span><span><b>{row.name || [row.firstName, row.lastName].filter(Boolean).join(" ")}</b><small>{row.email}</small></span></span><span>{row.role}</span><Badge tone={row.status === "ACTIVE" ? "green" : "red"}>{String(row.status || "UNKNOWN").toLowerCase()}</Badge><span>{formatDate(row.createdAt || row.joinedAt)}</span></button>) : <EmptyState icon={<UsersIcon />} title="No users found" text="Try another account status." />}
      </div>
      <Pagination {...users.data} onChange={setPage} busy={users.isFetching} />
    </Card>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Update account status"><div className="confirm-panel">{userDetails.isLoading ? <Skeleton className="skeleton--card" /> : <p>Choose the server-enforced status for <b>{userDetails.data?.name || selected?.name || selected?.email}</b>.</p>}{userDetails.isError && <QueryError error={userDetails.error} />}{update.isError && <QueryError error={update.error} />}<div><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>{selected?.status !== "ACTIVE" && <Button onClick={() => update.mutate({ id: selected.id, nextStatus: "ACTIVE" })} disabled={update.isPending}>Activate</Button>}{selected?.status !== "SUSPENDED" && <Button variant="danger" onClick={() => update.mutate({ id: selected.id, nextStatus: "SUSPENDED" })} disabled={update.isPending}>Suspend</Button>}</div></div></Modal>
  </>;
}

export function AdminAjosPage() {
  const [page, setPage] = useState(0);
  const groups = useQuery({ queryKey: ["admin-ajos", page], queryFn: () => ajoService.list({ page, size: 20 }) });
  return <><PageHeader eyebrow="GROUP OVERSIGHT" title="Ajos" description="Browse group information returned by the Ajo API." /><Card className="table-card">{groups.isError && <QueryError error={groups.error} />}<div className="data-table"><div className="data-table__head"><span>Ajo</span><span>Creator</span><span>Status</span><span>Contribution</span></div>{groups.isLoading ? <Skeleton className="skeleton--table" /> : groups.data?.items.length ? groups.data.items.map((ajo) => <div className="data-table__row" key={ajo.id}><span><span><b>{ajo.name}</b><small>{ajo.publicId || ajo.id}</small></span></span><span>{ajo.creator}</span><Badge tone={ajo.status === "OPEN" ? "green" : "blue"}>{String(ajo.status).toLowerCase()}</Badge><strong>{formatCurrency(ajo.contributionAmount)}</strong></div>) : <EmptyState icon={<ShieldIcon />} title="No Ajos found" text="Groups will appear when creators add them." />}</div><Pagination {...groups.data} onChange={setPage} busy={groups.isFetching} /></Card></>;
}

export function AdminTransactionsPage() {
  const [page, setPage] = useState(0);
  const [type, setType] = useState("");
  const gl = useQuery({ queryKey: ["platform-gl", page, type], queryFn: () => adminService.platformGl({ page, size: 20, type }) });
  return <><PageHeader eyebrow="PLATFORM LEDGER" title="General ledger" description="Authoritative platform accounting entries." /><div className="filter-bar filter-bar--simple"><input value={type} onChange={(event) => { setType(event.target.value.toUpperCase()); setPage(0); }} placeholder="Filter by GL type" /></div><Card className="table-card">{gl.isError && <QueryError error={gl.error} />}<div className="data-table"><div className="data-table__head"><span>Entry</span><span>Date</span><span>Reference</span><span>Amount</span></div>{gl.isLoading ? <Skeleton className="skeleton--table" /> : gl.data?.items.length ? gl.data.items.map((row, index) => <div className="data-table__row" key={row.id || `${row.referenceId}-${index}`}><span><span><b>{String(row.type || "Ledger entry").replaceAll("_", " ")}</b><small>{row.description}</small></span></span><span>{formatDate(row.createdAt || row.timestamp)}</span><span>{row.referenceId}</span><strong>{formatCurrency(row.amount)}</strong></div>) : <EmptyState icon={<ReceiptIcon />} title="No ledger entries" text="Try another entry type." />}</div><Pagination {...gl.data} onChange={setPage} busy={gl.isFetching} /></Card></>;
}

export function AdminWithdrawalsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [transferCode, setTransferCode] = useState("");
  const [reason, setReason] = useState("");
  const client = useQueryClient();
  const requests = useQuery({ queryKey: ["admin-withdrawals", page, status], queryFn: () => adminService.withdrawals({ page, size: 20, status }) });
  const finish = async () => { await client.invalidateQueries({ queryKey: ["admin-withdrawals"] }); await client.invalidateQueries({ queryKey: ["admin-dashboard"] }); setSelected(null); setTransferCode(""); setReason(""); };
  const refreshChangedWithdrawal = (error) => { if (error.code === "INVALID_WITHDRAWAL_STATUS") client.invalidateQueries({ queryKey: ["admin-withdrawals"] }); };
  const initiate = useMutation({ mutationFn: adminService.initiateWithdrawal, meta: { successMessage: "Withdrawal marked as processing." }, onSuccess: finish, onError: refreshChangedWithdrawal });
  const confirm = useMutation({ mutationFn: ({ id, successful }) => adminService.confirmWithdrawal(id, successful ? { successful: true, transferCode } : { successful: false, reason }), meta: { successMessage: (_data, variables) => variables.successful ? "Withdrawal marked as paid." : "Failed withdrawal recorded and funds reversed." }, onSuccess: finish, onError: refreshChangedWithdrawal });
  const decline = useMutation({ mutationFn: (id) => adminService.declineWithdrawal(id, reason), meta: { successMessage: "Withdrawal declined and funds released." }, onSuccess: finish, onError: refreshChangedWithdrawal });
  const busy = initiate.isPending || confirm.isPending || decline.isPending;
  const activeError = initiate.error || confirm.error || decline.error;
  return <><PageHeader eyebrow="OPERATIONS QUEUE" title="Withdrawals" description="Process manual settlements and record their final outcome." /><div className="filter-bar filter-bar--simple"><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>{["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}</select></div><Card className="table-card"><div className="data-table"><div className="data-table__head"><span>Customer</span><span>Destination</span><span>Status</span><span>Amount</span></div>{requests.isLoading ? <Skeleton className="skeleton--table" /> : requests.data?.items.length ? requests.data.items.map((row) => <button type="button" className="data-table__row" key={row.id} onClick={() => setSelected(row)}><span><span><b>{row.user?.name || row.userName || "AjoPay user"}</b><small>{row.reference || row.id}</small></span></span><span>{row.bankAccount?.bankName} • {String(row.bankAccount?.accountNumber || "").slice(-4)}</span><Badge tone={row.status === "PAID" ? "green" : row.status === "FAILED" ? "red" : "amber"}>{row.status.toLowerCase()}</Badge><strong>{formatCurrency(row.amount)}</strong></button>) : <EmptyState icon={<WalletIcon />} title="No withdrawals" text={`There are no ${status.toLowerCase()} requests.`} />}</div><Pagination {...requests.data} onChange={setPage} busy={requests.isFetching} /></Card>
    <Modal open={Boolean(selected)} onClose={() => !busy && setSelected(null)} title="Process withdrawal"><div className="confirm-panel"><p>Only record an outcome after verifying the manual bank transfer outside AjoPay.</p>{activeError && <QueryError error={activeError} />}{selected?.status === "PROCESSING" && <><label>Transfer code<input value={transferCode} onChange={(event) => setTransferCode(event.target.value)} /></label><label>Failure reason<input value={reason} onChange={(event) => setReason(event.target.value)} /></label></>}{selected?.status === "PENDING" && <label>Decline reason<input value={reason} onChange={(event) => setReason(event.target.value)} /></label>}<div><Button variant="secondary" onClick={() => setSelected(null)} disabled={busy}>Close</Button>{selected?.status === "PENDING" && <><Button variant="danger" disabled={busy || !reason.trim()} onClick={() => decline.mutate(selected.id)}>Decline</Button><Button disabled={busy} onClick={() => initiate.mutate(selected.id)}>Mark processing</Button></>}{selected?.status === "PROCESSING" && <><Button variant="danger" disabled={busy || !reason.trim()} onClick={() => confirm.mutate({ id: selected.id, successful: false })}>Record failed</Button><Button disabled={busy || !transferCode.trim()} onClick={() => confirm.mutate({ id: selected.id, successful: true })}>Confirm paid</Button></>}</div></div></Modal>
  </>;
}

export function AdminSettingsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: adminService.settings });
  const rows = useMemo(() => Array.isArray(settings.data) ? settings.data : Object.entries(settings.data || {}).map(([key, value]) => ({ key, value })), [settings.data]);
  const [drafts, setDrafts] = useState({});
  const save = useMutation({ mutationFn: ({ key, value }) => adminService.saveSetting(key, value), meta: { successMessage: "Setting saved." }, onSuccess: () => client.invalidateQueries({ queryKey: ["admin-settings"] }) });
  const canWrite = user?.tokenRole === "SUPER_ADMIN" && user?.role === "SUPER_ADMIN" && user?.permissions?.isAdmin === true;
  return <><PageHeader eyebrow="PLATFORM CONTROLS" title="Settings" description={canWrite ? "Update persisted platform settings." : "View persisted platform settings."} /><Card className="settings-card">{settings.isLoading ? <Skeleton className="skeleton--table" /> : rows.length ? <div className="form-grid">{rows.map((row) => <label key={row.key}>{row.key}<input value={drafts[row.key] ?? row.value ?? ""} readOnly={!canWrite} onChange={(event) => setDrafts((current) => ({ ...current, [row.key]: event.target.value }))} />{canWrite && <Button type="button" disabled={save.isPending} onClick={() => save.mutate({ key: row.key, value: drafts[row.key] ?? row.value })}>Save</Button>}</label>)}</div> : <EmptyState icon={<ShieldIcon />} title="No settings returned" text="Platform settings will appear after backend configuration." />}</Card></>;
}

export function AdminsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const admins = useQuery({ queryKey: ["admins"], queryFn: adminService.admins });
  const create = useMutation({ mutationFn: adminService.createAdmin, meta: { successMessage: "Administrator account created." }, onSuccess: async () => { await client.invalidateQueries({ queryKey: ["admins"] }); setOpen(false); setValues({ firstName: "", lastName: "", email: "", password: "" }); }, onError: (requestError) => setError(requestError.message) });
  const revoke = useMutation({ mutationFn: adminService.revokeAdmin, meta: { successMessage: "Administrator access revoked." }, onSuccess: () => client.invalidateQueries({ queryKey: ["admins"] }) });
  if (user?.role !== "SUPER_ADMIN") return <QueryError error={{ message: "Only a super administrator can manage administrators." }} />;
  const rows = Array.isArray(admins.data) ? admins.data : admins.data?.items || [];
  const submit = (event) => {
    event.preventDefault();
    const errors = validateAdminAccount(values);
    if (Object.keys(errors).length) return setError(Object.values(errors)[0]);
    setError("");
    create.mutate(values);
  };
  return <><PageHeader eyebrow="ACCESS CONTROL" title="Administrators" description="Administrator creation and revocation are restricted to super administrators." action={<Button onClick={() => setOpen(true)}>Create administrator</Button>} /><Card>{admins.isLoading ? <Skeleton className="skeleton--table" /> : rows.length ? rows.map((admin) => <div className="data-table__row" key={admin.id}><span><span><b>{admin.name || [admin.firstName, admin.lastName].filter(Boolean).join(" ")}</b><small>{admin.email}</small></span></span><Badge tone="blue">{admin.role}</Badge>{admin.role !== "SUPER_ADMIN" && <Button variant="danger" disabled={revoke.isPending} onClick={() => revoke.mutate(admin.id)}>Revoke</Button>}</div>) : <EmptyState icon={<UsersIcon />} title="No administrators returned" text="Create an administrator to grant operational access." />}{revoke.isError && <QueryError error={revoke.error} />}</Card><Modal open={open} onClose={() => !create.isPending && setOpen(false)} title="Create administrator"><form className="modal-form" onSubmit={submit}>{error && <div className="form-error" role="alert">{error}</div>}{[["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"], ["password", "Temporary password", "password"]].map(([key, label, type]) => <label key={key}>{label}<input type={type} value={values[key]} autoComplete={type === "password" ? "new-password" : undefined} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}<div><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create administrator"}</Button></div></form></Modal></>;
}
