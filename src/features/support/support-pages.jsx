import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportService } from "../../services/support-service";
import { AlertIcon, CheckIcon, PlusIcon, ShieldIcon } from "../../components/icons";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { formatDate } from "../../utils/formatters";
import { Pagination } from "../../components/pagination";
import "./support.css";

const toneForStatus = (status) => status === "RESOLVED" ? "green" : status === "OPEN" ? "amber" : "blue";

function IssueCard({ issue, admin, onReview }) {
  const status = issue.status || "OPEN";
  return (
    <article className="support-issue">
      <div className="support-issue__head"><span>{issue.type || "SUPPORT"}</span><Badge tone={toneForStatus(status)}>{status.toLowerCase().replace("_", " ")}</Badge></div>
      <h2>{issue.subject}</h2>
      <p>{issue.description}</p>
      {admin && <div className="support-issue__user"><b>{issue.user?.name || issue.userName || "AjoPay user"}</b><span>{issue.user?.email || issue.userEmail}</span></div>}
      {issue.resolution && <div className="support-issue__resolution"><CheckIcon /><span><b>Resolution update</b>{issue.resolution}</span></div>}
      <footer><span>Opened {formatDate(issue.createdAt)} · {issue.id}</span>{admin && <Button variant="secondary" onClick={() => onReview(issue)}>Review</Button>}</footer>
    </article>
  );
}

export function UserSupportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ type: "SYSTEM", subject: "", description: "" });
  const issues = useQuery({ queryKey: ["support-issues", user?.id], queryFn: supportService.listMine });
  const submit = useMutation({
    meta: { successMessage: "Your support issue was submitted." },
    mutationFn: () => supportService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support-issues"] });
      setValues({ type: "SYSTEM", subject: "", description: "" });
      setOpen(false);
    },
  });
  const invalid = !values.subject.trim() || values.description.trim().length < 15;
  return (
    <div className="page support-page">
      <PageHeader eyebrow="HELP & SUPPORT" title="Support issues" description="Report a dispute or system issue and follow its resolution." action={<Button onClick={() => setOpen(true)}><PlusIcon /> Report an issue</Button>} />
      {issues.isLoading ? <Skeleton className="skeleton--table" /> : issues.data?.length ? <div className="support-grid">{issues.data.map((issue) => <IssueCard issue={issue} key={issue.id} />)}</div> : <Card><EmptyState icon={<ShieldIcon />} title="No support issues" text="Issues and disputes you submit will appear here." /></Card>}
      <Modal open={open} onClose={() => !submit.isPending && setOpen(false)} title="Report an issue">
        <form className="support-form" onSubmit={(event) => { event.preventDefault(); if (!invalid) submit.mutate(); }}>
          {submit.isError && <div className="form-error" role="alert">{submit.error.message || "We couldn’t submit this issue."}</div>}
          <label>Issue type<select value={values.type} onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}><option value="SYSTEM">System issue</option><option value="DISPUTE">Ajo or transaction dispute</option></select></label>
          <label>Subject<input value={values.subject} onChange={(event) => setValues((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly describe the issue" /></label>
          <label>Description<textarea value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} placeholder="Include the relevant Ajo, transaction, dates, and what happened" rows="5" /><small>At least 15 characters</small></label>
          <div><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={submit.isPending}>Cancel</Button><Button type="submit" disabled={invalid || submit.isPending}>{submit.isPending ? "Submitting…" : "Submit issue"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminSupportIssuesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("IN_REVIEW");
  const [resolution, setResolution] = useState("");
  const issues = useQuery({ queryKey: ["support-issues", "admin", page, filter], queryFn: () => supportService.listAll({ page, size: 20, status: filter }) });
  const update = useMutation({
    meta: { successMessage: "The support issue was updated." },
    mutationFn: () => supportService.update(selected.id, { status, resolution }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["support-issues"] }); setSelected(null); },
  });
  const openReview = (issue) => { setSelected(issue); setStatus(issue.status); setResolution(issue.resolution || ""); };
  return (
    <div className="admin-support">
      <PageHeader eyebrow="SUPPORT OPERATIONS" title="System issues" description="Review user disputes and system-support issues, then record a clear resolution." />
      <div className="filter-bar filter-bar--simple"><select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(0); }}><option value="">All statuses</option><option value="OPEN">Open</option><option value="IN_REVIEW">In review</option><option value="RESOLVED">Resolved</option></select></div>
      {issues.isLoading ? <Skeleton className="skeleton--table" /> : issues.data?.items?.length ? <><div className="support-grid">{issues.data.items.map((issue) => <IssueCard issue={issue} admin onReview={openReview} key={issue.id} />)}</div><Pagination {...issues.data} onChange={setPage} busy={issues.isFetching} /></> : <Card><EmptyState icon={<AlertIcon />} title="No open system issues" text="Everything is operating normally." /></Card>}
      <Modal open={Boolean(selected)} onClose={() => !update.isPending && setSelected(null)} title={`Review ${selected?.id || "issue"}`}>
        <form className="support-form" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="OPEN">Open</option><option value="IN_REVIEW">In review</option><option value="RESOLVED">Resolved</option></select></label>
          <label>Resolution<textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows="5" placeholder="Record what was investigated and the outcome" /></label>
          {update.isError && <div className="form-error" role="alert">{update.error.message}</div>}
          <div><Button type="button" variant="secondary" onClick={() => setSelected(null)} disabled={update.isPending}>Cancel</Button><Button type="submit" disabled={update.isPending || (status === "RESOLVED" && !resolution.trim())}>{update.isPending ? "Saving…" : "Save update"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
