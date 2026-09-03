import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { mockApi } from "../../api/mock-service";
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { formatCurrency, formatDate, frequencyLabel, statusLabel } from "../../utils/formatters";
import "./find-ajo.css";

const cycleLabel = (ajo) => {
  const units = { DAILY: "days", WEEKLY: "weeks", MONTHLY: "months" };
  return `${ajo.slotCount} ${units[ajo.frequency] || "payments"}`;
};

const requestForAjo = (requests, ajoId) =>
  requests
    .filter((request) => request.ajoId === ajoId)
    .sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt))[0];

export function JoinRequestStatus({ request, isMember = false }) {
  if (isMember || request?.status === "ACCEPTED")
    return <Badge tone="green"><CheckIcon /> Member</Badge>;
  if (request?.status === "PENDING")
    return <Badge tone="amber">Pending approval</Badge>;
  if (request?.status === "DECLINED")
    return <Badge tone="red">Request declined</Badge>;
  return null;
}

export function JoinRequestButton({ ajo, request, publicView, onClick, className = "" }) {
  if (publicView)
    return (
      <Link className={`button button--primary ${className}`} to="/login" state={{ from: `/ajos/${ajo.id}` }}>
        Sign in to join
      </Link>
    );
  if (ajo.joined || request?.status === "ACCEPTED")
    return <Button className={className} disabled><CheckIcon /> Member</Button>;
  if (request?.status === "PENDING")
    return <Button className={className} variant="secondary" onClick={onClick}>Request sent</Button>;
  return (
    <Button className={className} onClick={onClick} disabled={ajo.slotCount <= ajo.filledSlots}>
      {request?.status === "DECLINED" ? "Request again" : "Join Ajo"}
    </Button>
  );
}

export function AjoGroupCard({ ajo, request, publicView, onOpen }) {
  const available = Math.max(ajo.slotCount - ajo.filledSlots, 0);
  return (
    <article className="discovery-card">
      <div className="discovery-card__head">
        <Badge tone={available <= 2 ? "amber" : "green"}>
          {statusLabel[ajo.status] || ajo.status}
        </Badge>
        <span>{ajo.category}</span>
      </div>
      <div className="discovery-card__title">
        <div>
          <h2>{ajo.name}</h2>
          <p>{ajo.description}</p>
        </div>
        <JoinRequestStatus request={request} isMember={ajo.joined} />
      </div>
      <div className="discovery-card__contribution">
        <small>Contribution</small>
        <strong>{formatCurrency(ajo.contributionAmount)}</strong>
        <span>{frequencyLabel[ajo.frequency]}</span>
      </div>
      <dl className="discovery-card__facts">
        <div><dt><UsersIcon /> Members</dt><dd>{ajo.filledSlots}/{ajo.slotCount}</dd></div>
        <div><dt>Available slots</dt><dd>{available}</dd></div>
        <div><dt><CalendarIcon /> Cycle</dt><dd>{cycleLabel(ajo)}</dd></div>
        <div><dt>Starts</dt><dd>{ajo.startDate ? formatDate(ajo.startDate) : "After approval"}</dd></div>
      </dl>
      <div className="discovery-card__admin">
        <span className="avatar">{ajo.creator.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
        <span><small>GROUP ADMIN</small><b>{ajo.creator}</b></span>
        <ShieldIcon />
      </div>
      <div className="discovery-card__actions">
        <button type="button" onClick={onOpen}>View details</button>
        <JoinRequestButton ajo={ajo} request={request} publicView={publicView} onClick={onOpen} />
      </div>
    </article>
  );
}

export function AjoDiscoveryFilters({ values, categories, onChange, onClear }) {
  const hasFilters = values.search || values.frequency !== "ALL" || values.category !== "ALL" || values.amount !== "ALL";
  return (
    <div className="discovery-filters">
      <label className="discovery-filters__search">
        <SearchIcon />
        <span className="sr-only">Search Ajos</span>
        <input value={values.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Search groups, goals, or admins" />
      </label>
      <label><span>Frequency</span><select value={values.frequency} onChange={(event) => onChange("frequency", event.target.value)}><option value="ALL">All frequencies</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select></label>
      <label><span>Category</span><select value={values.category} onChange={(event) => onChange("category", event.target.value)}><option value="ALL">All categories</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
      <label><span>Contribution</span><select value={values.amount} onChange={(event) => onChange("amount", event.target.value)}><option value="ALL">Any amount</option><option value="UNDER_50">Under ₦50,000</option><option value="50_TO_100">₦50,000 – ₦100,000</option><option value="OVER_100">Above ₦100,000</option></select></label>
      {hasFilters && <button type="button" onClick={onClear}>Clear filters</button>}
    </div>
  );
}

export function AjoGroupDetails({ ajo, request, publicView, busy, cancelBusy, error, onClose, onRequest, onCancel }) {
  const available = Math.max(ajo.slotCount - ajo.filledSlots, 0);
  const [slots, setSlots] = useState(1);
  const [preferredPosition, setPreferredPosition] = useState("ANY");
  return (
    <Modal open onClose={onClose} title={ajo.name}>
      <div className="ajo-details">
        <div className="ajo-details__intro">
          <div><Badge tone="green">{statusLabel[ajo.status] || ajo.status}</Badge><JoinRequestStatus request={request} isMember={ajo.joined} /></div>
          <p>{ajo.description}</p>
          <span>Managed by <b>{ajo.creator}</b></span>
        </div>
        <div className="ajo-details__summary">
          <div><small>CONTRIBUTION</small><b>{formatCurrency(ajo.contributionAmount)}</b><span>{frequencyLabel[ajo.frequency]}</span></div>
          <div><small>AVAILABLE</small><b>{available}</b><span>of {ajo.slotCount} slots</span></div>
          <div><small>FULL CYCLE</small><b>{cycleLabel(ajo)}</b><span>{ajo.startDate ? `Starts ${formatDate(ajo.startDate)}` : "Starts after approval"}</span></div>
        </div>
        {error && <div className="form-error" role="alert"><AlertIcon /> {error}</div>}
        {!publicView && !ajo.joined && request?.status !== "PENDING" && request?.status !== "ACCEPTED" && available > 0 && (
          <form className="ajo-details__form" onSubmit={(event) => { event.preventDefault(); onRequest({ slots, preferredPosition: preferredPosition === "ANY" ? null : preferredPosition }); }}>
            <div><label>Number of slots<select value={slots} onChange={(event) => setSlots(Number(event.target.value))}>{Array.from({ length: available }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1} slot{index ? "s" : ""}</option>)}</select></label><label>Preferred payout turn<select value={preferredPosition} onChange={(event) => setPreferredPosition(event.target.value)}><option value="ANY">Any available position</option>{Array.from({ length: ajo.slotCount }, (_, index) => <option value={index + 1} key={index + 1}>Position {index + 1}</option>)}</select></label></div>
            <p><ShieldIcon /> Sending this request does not make you a member. The group admin must approve it first.</p>
            <Button type="submit" disabled={busy}>{busy ? "Sending request…" : request?.status === "DECLINED" ? "Send another request" : "Send join request"}</Button>
          </form>
        )}
        {(publicView || ajo.joined || request?.status === "PENDING" || request?.status === "ACCEPTED") && (
          <div className="ajo-details__footer">
            <p>{request?.status === "PENDING" ? "The group admin is reviewing your request. You’ll receive a notification after a decision." : ajo.joined || request?.status === "ACCEPTED" ? "You are an official member of this savings circle." : "Sign in to send a join request to the group admin."}</p>
            {request?.status === "PENDING" ? (
              <Button variant="secondary" onClick={onCancel} disabled={cancelBusy}>
                {cancelBusy ? "Cancelling…" : "Cancel request"}
              </Button>
            ) : (
              <JoinRequestButton ajo={ajo} request={request} publicView={publicView} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function FindAjo({ publicView = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" });
  const [selectedAjo, setSelectedAjo] = useState(null);
  const [notice, setNotice] = useState(null);
  const [requestError, setRequestError] = useState("");
  const groups = useQuery({ queryKey: ["ajos", user?.id || "public"], queryFn: () => mockApi.getAjos(user?.id) });
  const requests = useQuery({ queryKey: ["join-requests", "user", user?.id], queryFn: () => mockApi.getJoinRequests({ userId: user.id }), enabled: Boolean(user && !publicView) });
  const categories = useMemo(() => [...new Set((groups.data || []).map((ajo) => ajo.category))].sort(), [groups.data]);
  const availableGroups = useMemo(() => (groups.data || []).filter((ajo) => {
    const term = filters.search.trim().toLowerCase();
    const matchesSearch = !term || [ajo.name, ajo.description, ajo.category, ajo.creator].some((value) => value.toLowerCase().includes(term));
    const matchesFrequency = filters.frequency === "ALL" || ajo.frequency === filters.frequency;
    const matchesCategory = filters.category === "ALL" || ajo.category === filters.category;
    const matchesAmount = filters.amount === "ALL" || (filters.amount === "UNDER_50" && ajo.contributionAmount < 50_000) || (filters.amount === "50_TO_100" && ajo.contributionAmount >= 50_000 && ajo.contributionAmount <= 100_000) || (filters.amount === "OVER_100" && ajo.contributionAmount > 100_000);
    return ajo.status === "OPEN" && ajo.filledSlots < ajo.slotCount && matchesSearch && matchesFrequency && matchesCategory && matchesAmount;
  }), [filters, groups.data]);
  const join = useMutation({
    mutationFn: ({ ajo, values }) => mockApi.requestToJoin({ ajoId: ajo.id, user, ...values }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      setSelectedAjo(null);
      setNotice({ tone: "success", message: `Your request to join ${created.ajo.name} was sent to the group admin.` });
    },
    onError: (error) => setRequestError(error.message || "We couldn’t send your request. Please try again."),
  });
  const cancel = useMutation({
    mutationFn: (request) => mockApi.cancelJoinRequest(request.id, user.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      setSelectedAjo(null);
      setNotice({ tone: "success", message: "Your pending join request was cancelled." });
    },
    onError: (error) => setRequestError(error.message || "We couldn’t cancel your request."),
  });
  const openDetails = (ajo) => { setRequestError(""); setSelectedAjo(ajo); };
  return (
    <div className="find-ajo">
      <PageHeader eyebrow="AJO MARKETPLACE" title="Find an Ajo that fits your life" description="Compare trusted savings circles, choose the right contribution plan, and request a place in the group." action={!publicView && <Link to="/ajos/create" className="button button--primary">Create an Ajo</Link>} />
      {notice && <div className={`find-ajo__notice find-ajo__notice--${notice.tone}`} role="status"><CheckIcon /><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label={t("common.closeDialog")}>×</button></div>}
      <AjoDiscoveryFilters values={filters} categories={categories} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onClear={() => setFilters({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" })} />
      <div className="find-ajo__results"><div><b>{groups.isLoading ? "Finding available groups…" : `${availableGroups.length} Ajo${availableGroups.length === 1 ? "" : "s"} available`}</b><small>Membership begins only after admin approval</small></div><ShieldIcon /></div>
      {groups.isLoading || requests.isLoading ? (
        <div className="discovery-grid">{[1, 2, 3, 4].map((item) => <Skeleton className="skeleton--card discovery-skeleton" key={item} />)}</div>
      ) : availableGroups.length ? (
        <div className="discovery-grid">{availableGroups.map((ajo) => <AjoGroupCard ajo={ajo} request={requestForAjo(requests.data || [], ajo.id)} publicView={publicView} onOpen={() => openDetails(ajo)} key={ajo.id} />)}</div>
      ) : (
        <Card><EmptyState icon={<SearchIcon />} title="No Ajos match those filters" text="Try a different search, contribution range, or frequency." action={<Button variant="secondary" onClick={() => setFilters({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" })}>Clear all filters</Button>} /></Card>
      )}
      {selectedAjo && <AjoGroupDetails key={selectedAjo.id} ajo={selectedAjo} request={requestForAjo(requests.data || [], selectedAjo.id)} publicView={publicView} busy={join.isPending} cancelBusy={cancel.isPending} error={requestError} onClose={() => !join.isPending && !cancel.isPending && setSelectedAjo(null)} onRequest={(values) => join.mutate({ ajo: selectedAjo, values })} onCancel={() => cancel.mutate(requestForAjo(requests.data || [], selectedAjo.id))} />}
    </div>
  );
}
