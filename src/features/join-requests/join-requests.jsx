import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ajoService } from "../../services/ajo-service";
import { AlertIcon, CheckIcon, MailIcon, PhoneIcon, SearchIcon, UsersIcon } from "../../components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../../components/ui";
import { formatDate } from "../../utils/formatters";
import { useAuth } from "../../contexts/auth-context";
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
  const normalizedStatus = String(status || "PENDING").toUpperCase();
  return <Badge tone={statusTone[normalizedStatus] || "blue"}>{normalizedStatus.toLowerCase()}</Badge>;
}

export function JoinRequestCard({ request, busy, onDecision }) {
  const user = request.user || {};
  const userName = String(user.name || "AjoPay member");
  const preferredPositions = Array.isArray(request.preferredPositions) ? request.preferredPositions : [];
  const initials = userName.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("");
  return (
    <article className="join-request-card">
      <div className="join-request-card__person">
        <span className="avatar">{initials}</span>
        <div><h2>{userName}</h2><p>{user.rating != null ? `★ ${user.rating}` : "New member"} · {user.completedCycles ?? 0} completed cycles</p></div>
        <JoinRequestStatus status={request.status} />
      </div>
      <div className="join-request-card__contact">
        <span><MailIcon /> {user.email || "No email provided"}</span>
        <span><PhoneIcon /> {user.phone || "No phone provided"}</span>
      </div>
      <dl>
        <div><dt>Ajo group</dt><dd>{request.ajo?.name || "Unavailable group"}</dd></div>
        <div><dt>Requested</dt><dd>{formatDate(request.requestedAt)}</dd></div>
        <div><dt>Slots</dt><dd>{request.slots}</dd></div>
        <div><dt>Preferred payout</dt><dd>{preferredPositions.length ? preferredPositions.map((position) => `#${position}`).join(", ") : "Any position"}</dd></div>
      </dl>
      <RequestActions request={request} busy={busy} onDecision={onDecision} />
    </article>
  );
}

export function AdminJoinRequestsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const requests = useQuery({
    queryKey: ["join-requests", "managed", user?.id],
    queryFn: () => ajoService.getManagedJoinRequests(user.id),
    enabled: Boolean(user?.id),
    refetchInterval: 30_000,
  });
  const review = useMutation({
    meta: {
      successMessage: (_data, variables) => `${variables.request.user.name}’s request was ${variables.decision.toLowerCase()}.`,
    },
    mutationFn: ({ request, decision }) => ajoService.reviewJoinRequest(request.ajoId, request.id, decision),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["join-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["ajo", variables.request.ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });
  const counts = useMemo(() => ({ PENDING: (requests.data || []).length }), [requests.data]);
  const visible = useMemo(() => (requests.data || []).filter((request) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [request.user?.name, request.user?.email, request.ajo?.name].some((value) => String(value ?? "").toLowerCase().includes(term));
    return matchesSearch;
  }), [requests.data, search]);
  return (
    <div className="admin-join-requests">
      <PageHeader eyebrow="MEMBERSHIP REVIEW" title="Join Requests" description="Review people who want to join an Ajo. A user becomes a member only after acceptance." />
      <div className="join-request-metrics">
        <Card><span className="join-request-metrics__dot join-request-metrics__dot--pending" /><div><small>Awaiting review</small><strong>{counts.PENDING}</strong></div></Card>
      </div>
      <div className="join-requests-toolbar">
        <label><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, email, or Ajo" /></label>
      </div>
      {requests.isLoading ? (
        <div className="join-request-grid">{[1, 2, 3].map((item) => <Skeleton className="skeleton--card" key={item} />)}</div>
      ) : requests.isError ? (
        <Card><EmptyState icon={<AlertIcon />} title="Join requests could not be loaded" text="Please try refreshing this page." /></Card>
      ) : visible.length ? (
        <div className="join-request-grid">{visible.map((request) => <JoinRequestCard request={request} busy={review.isPending && review.variables?.request.id === request.id} onDecision={(decision) => review.mutate({ request, decision })} key={request.id} />)}</div>
      ) : (
        <Card><EmptyState icon={<UsersIcon />} title="No matching join requests" text="There are no membership requests waiting for review." /></Card>
      )}
    </div>
  );
}
