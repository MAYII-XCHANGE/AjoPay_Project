import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "../../api/mock-service";
import { AlertIcon, CheckIcon, MailIcon, PhoneIcon, SearchIcon, UsersIcon } from "../../components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../../components/ui";
import { formatDate } from "../../utils/formatters";
import "./join-requests.css";

const statusTone = { PENDING: "amber", ACCEPTED: "green", DECLINED: "red" };

export function RequestActions({ request, busy, onDecision }) {
  if (request.status !== "PENDING")
    return <JoinRequestStatus status={request.status} />;
  return (
    <div className="join-request-card__actions">
      <Button variant="secondary" disabled={busy} onClick={() => onDecision("DECLINED")}>
        {busy ? "Updating…" : "Decline"}
      </Button>
      <Button disabled={busy} onClick={() => onDecision("ACCEPTED")}>
        <CheckIcon /> Accept
      </Button>
    </div>
  );
}

export function JoinRequestStatus({ status }) {
  return <Badge tone={statusTone[status] || "blue"}>{status.toLowerCase()}</Badge>;
}

export function JoinRequestCard({ request, busy, onDecision }) {
  const initials = request.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <article className="join-request-card">
      <div className="join-request-card__person">
        <span className="avatar">{initials}</span>
        <div><h2>{request.user.name}</h2><p>★ {request.user.rating} · {request.user.completedCycles} completed cycles</p></div>
        <JoinRequestStatus status={request.status} />
      </div>
      <div className="join-request-card__contact">
        <span><MailIcon /> {request.user.email}</span>
        <span><PhoneIcon /> {request.user.phone}</span>
      </div>
      <dl>
        <div><dt>Ajo group</dt><dd>{request.ajo?.name || "Unavailable group"}</dd></div>
        <div><dt>Requested</dt><dd>{formatDate(request.requestedAt)}</dd></div>
        <div><dt>Slots</dt><dd>{request.slots}</dd></div>
        <div><dt>Preferred payout</dt><dd>{request.preferredPositions.length ? request.preferredPositions.map((position) => `#${position}`).join(", ") : "Any position"}</dd></div>
      </dl>
      <RequestActions request={request} busy={busy} onDecision={onDecision} />
    </article>
  );
}

export function AdminJoinRequestsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const requests = useQuery({ queryKey: ["join-requests", "admin"], queryFn: () => mockApi.getJoinRequests() });
  const review = useMutation({
    mutationFn: ({ id, decision }) => mockApi.reviewJoinRequest(id, decision),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["join-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      setNotice({ tone: "success", message: `${updated.user.name}’s request was ${updated.status.toLowerCase()}.` });
    },
    onError: (error) => setNotice({ tone: "error", message: error.message || "The request could not be updated." }),
  });
  const counts = useMemo(() => ({
    PENDING: (requests.data || []).filter((request) => request.status === "PENDING").length,
    ACCEPTED: (requests.data || []).filter((request) => request.status === "ACCEPTED").length,
    DECLINED: (requests.data || []).filter((request) => request.status === "DECLINED").length,
  }), [requests.data]);
  const visible = useMemo(() => (requests.data || []).filter((request) => {
    const term = search.trim().toLowerCase();
    const matchesStatus = status === "ALL" || request.status === status;
    const matchesSearch = !term || [request.user.name, request.user.email, request.ajo?.name || ""].some((value) => value.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }), [requests.data, search, status]);
  return (
    <div className="admin-join-requests">
      <PageHeader eyebrow="MEMBERSHIP REVIEW" title="Join Requests" description="Review people who want to join an Ajo. A user becomes a member only after acceptance." />
      {notice && <div className={`join-requests-notice join-requests-notice--${notice.tone}`} role="status">{notice.tone === "success" ? <CheckIcon /> : <AlertIcon />}<span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}
      <div className="join-request-metrics">
        {[['PENDING', 'Awaiting review'], ['ACCEPTED', 'Accepted'], ['DECLINED', 'Declined']].map(([key, label]) => <Card key={key}><span className={`join-request-metrics__dot join-request-metrics__dot--${key.toLowerCase()}`} /><div><small>{label}</small><strong>{counts[key]}</strong></div></Card>)}
      </div>
      <div className="join-requests-toolbar">
        <label><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, email, or Ajo" /></label>
        <div className="tabs">{["PENDING", "ACCEPTED", "DECLINED", "ALL"].map((item) => <button type="button" className={status === item ? "active" : ""} onClick={() => setStatus(item)} key={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</button>)}</div>
      </div>
      {requests.isLoading ? (
        <div className="join-request-grid">{[1, 2, 3].map((item) => <Skeleton className="skeleton--card" key={item} />)}</div>
      ) : requests.isError ? (
        <Card><EmptyState icon={<AlertIcon />} title="Join requests could not be loaded" text="Please try refreshing this page." /></Card>
      ) : visible.length ? (
        <div className="join-request-grid">{visible.map((request) => <JoinRequestCard request={request} busy={review.isPending && review.variables?.id === request.id} onDecision={(decision) => review.mutate({ id: request.id, decision })} key={request.id} />)}</div>
      ) : (
        <Card><EmptyState icon={<UsersIcon />} title="No matching join requests" text={status === "PENDING" ? "There are no membership requests waiting for review." : "Try another status or search term."} /></Card>
      )}
    </div>
  );
}
