import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin-service";
import { ReceiptIcon, UsersIcon, WalletIcon } from "../components/icons";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from "../components/ui";
import { Pagination } from "../components/pagination";
import { useAuth } from "../contexts/auth-context";
import { formatCurrency, formatDate } from "../utils/formatters";
import { validateAdminAccount } from "../utils/admin-validation";
import { DEFAULT_PAGE_SIZE } from "../config/pagination";
import { UserRole } from "../enums/roles";
import { WithdrawalStatus } from "../enums/statuses";

function QueryError({ error }) {
  return <div className="form-error" role="alert">{error?.message || "We couldn’t load this information."}</div>;
}

export function AdminTransactionsPage() {
  const [page, setPage] = useState(0);
  const [type, setType] = useState("");
  const gl = useQuery({ queryKey: ["platform-gl", page, type], queryFn: () => adminService.platformGl({ page, size: DEFAULT_PAGE_SIZE, type }) });
  return <><PageHeader eyebrow="PLATFORM LEDGER" title="General ledger" description="Authoritative platform accounting entries." /><div className="filter-bar filter-bar--simple"><input value={type} onChange={(event) => { setType(event.target.value.toUpperCase()); setPage(0); }} placeholder="Filter by GL type" /></div><Card className="table-card">{gl.isError && <QueryError error={gl.error} />}<div className="data-table"><div className="data-table__head"><span>Entry</span><span>Date</span><span>Reference</span><span>Amount</span></div>{gl.isLoading ? <Skeleton className="skeleton--table" /> : gl.data?.items.length ? gl.data.items.map((row, index) => <div className="data-table__row" key={row.id || `${row.referenceId}-${index}`}><span><span><b>{String(row.type || "Ledger entry").replaceAll("_", " ")}</b><small>{row.description}</small></span></span><span>{formatDate(row.createdAt || row.timestamp)}</span><span>{row.referenceId}</span><strong>{formatCurrency(row.amount)}</strong></div>) : <EmptyState icon={<ReceiptIcon />} title="No ledger entries" text="Try another entry type." />}</div><Pagination {...gl.data} onChange={setPage} busy={gl.isFetching} /></Card></>;
}

export function AdminWithdrawalsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState(WithdrawalStatus.PENDING);
  const [selected, setSelected] = useState(null);
  const [transferCode, setTransferCode] = useState("");
  const [reason, setReason] = useState("");
  const client = useQueryClient();
  const requests = useQuery({ queryKey: ["admin-withdrawals", page, status], queryFn: () => adminService.withdrawals({ page, size: DEFAULT_PAGE_SIZE, status }) });
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

export function AdminsPage() {
	const { user } = useAuth();
	const client = useQueryClient();
	const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "" });
  const [error, setError] = useState("");
	const admins = useQuery({ queryKey: ["admins", page], queryFn: () => adminService.admins({ page, size: DEFAULT_PAGE_SIZE }) });
  const create = useMutation({ mutationFn: adminService.createAdmin, meta: { successMessage: "Administrator created. Their login credentials were sent by email." }, onSuccess: async () => { await client.invalidateQueries({ queryKey: ["admins"] }); setOpen(false); setValues({ firstName: "", lastName: "", email: "" }); }, onError: (requestError) => setError(requestError.message) });
  const revoke = useMutation({ mutationFn: adminService.revokeAdmin, meta: { successMessage: "Administrator access revoked." }, onSuccess: () => client.invalidateQueries({ queryKey: ["admins"] }) });
  if (user?.role !== UserRole.SUPER_ADMIN) return <QueryError error={{ message: "Only a super administrator can manage administrators." }} />;
	const rows = admins.data?.items || [];
  const submit = (event) => {
    event.preventDefault();
    const errors = validateAdminAccount(values);
    if (Object.keys(errors).length) return setError(Object.values(errors)[0]);
    setError("");
    create.mutate(values);
  };
	return <><PageHeader eyebrow="ACCESS CONTROL" title="Administrators" description="Administrator creation and revocation are restricted to super administrators." action={<Button onClick={() => setOpen(true)}>Create administrator</Button>} /><Card>{admins.isLoading ? <Skeleton className="skeleton--table" /> : rows.length ? rows.map((admin) => <div className="data-table__row" key={admin.id}><span><span><b>{admin.name || [admin.firstName, admin.lastName].filter(Boolean).join(" ")}</b><small>{admin.email}</small></span></span><Badge tone="blue">{admin.role}</Badge>{admin.role !== "SUPER_ADMIN" && <Button variant="danger" disabled={revoke.isPending} onClick={() => revoke.mutate(admin.id)}>Revoke</Button>}</div>) : <EmptyState icon={<UsersIcon />} title="No administrators returned" text="Create an administrator to grant operational access." />}{revoke.isError && <QueryError error={revoke.error} />}<Pagination {...admins.data} onChange={setPage} busy={admins.isFetching} /></Card><Modal open={open} onClose={() => !create.isPending && setOpen(false)} title="Create administrator"><form className="modal-form" onSubmit={submit}>{error && <div className="form-error" role="alert">{error}</div>}{[["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"]].map(([key, label, type]) => <label key={key}>{label}<input type={type} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}<p>A temporary password will be generated and sent to the administrator's email.</p><div><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating..." : "Create administrator"}</Button></div></form></Modal></>;
}
