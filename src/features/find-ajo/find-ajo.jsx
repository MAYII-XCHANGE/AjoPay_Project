import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ajoService, mapJoinRequest } from "../../services/ajo-service";
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from "../../components/ui";
import { QueryErrorState } from "../../components/query-state";
import { Pagination } from "../../components/pagination";
import { formatCurrency, formatDate, frequencyLabel, statusLabel } from "../../utils/formatters";
import { filterDiscoverableAjos, getAvailableAjoSlots } from "../../utils/ajo-filters";
import { useAuth } from "../../contexts/auth-context";
import "./find-ajo.css";

const cycleLabel = (ajo) => {
  const units = { DAILY: "days", WEEKLY: "weeks", MONTHLY: "months" };
  return `${ajo.slotCount} ${units[ajo.frequency] || "payments"}`;
};

export function JoinRequestStatus({ request, isMember = false }) {
  if (isMember || request?.status === "ACCEPTED")
    return <Badge tone="green"><CheckIcon /> Member</Badge>;
  if (request?.status === "PENDING")
    return <Badge tone="amber">Pending approval</Badge>;
  if (request?.status === "DECLINED")
    return <Badge tone="red">Request declined</Badge>;
  return null;
}

export function JoinRequestButton({ ajo, request, publicView, isCreator = false, onClick, className = "" }) {
  if (publicView)
    return (
      <Link className={`button button--primary ${className}`} to="/login" state={{ from: `/ajos/${ajo.id}` }}>
        Sign in to join
      </Link>
    );
  if (isCreator)
    return (
      <Link className={`button button--secondary ${className}`} to={`/ajos/${ajo.id}/manage`}>
        Manage Ajo
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

export function AjoGroupCard({ ajo, request, publicView, isCreator, onOpen }) {
  const available = getAvailableAjoSlots(ajo);
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
        <JoinRequestButton ajo={ajo} request={request} publicView={publicView} isCreator={isCreator} onClick={onOpen} />
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

export function AjoGroupDetails({ ajo, request, publicView, isCreator, busy, cancelBusy, error, onClose, onRequest, onCancel }) {
  const available = getAvailableAjoSlots(ajo);
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
        {!publicView && !isCreator && !ajo.joined && request?.status !== "PENDING" && request?.status !== "ACCEPTED" && available > 0 && (
          <form className="ajo-details__form" onSubmit={(event) => { event.preventDefault(); onRequest({ slots, preferredPosition: preferredPosition === "ANY" ? null : preferredPosition }); }}>
            <div><label>Number of slots<select value={slots} onChange={(event) => setSlots(Number(event.target.value))}>{Array.from({ length: available }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1} slot{index ? "s" : ""}</option>)}</select></label><label>Preferred payout turn<select value={preferredPosition} onChange={(event) => setPreferredPosition(event.target.value)}><option value="ANY">Any available position</option>{Array.from({ length: ajo.slotCount }, (_, index) => <option value={index + 1} key={index + 1}>Position {index + 1}</option>)}</select></label></div>
            <p><ShieldIcon /> Sending this request does not make you a member. The group admin must approve it first.</p>
            <Button type="submit" disabled={busy}>{busy ? "Sending request…" : request?.status === "DECLINED" ? "Send another request" : "Send join request"}</Button>
          </form>
        )}
        {(publicView || isCreator || ajo.joined || request?.status === "PENDING" || request?.status === "ACCEPTED") && (
          <div className="ajo-details__footer">
            <p>{isCreator ? "You created this Ajo and can manage its members, requests, and payout order." : request?.status === "PENDING" ? "The group admin is reviewing your request. You’ll receive a notification after a decision." : ajo.joined || request?.status === "ACCEPTED" ? "You are an official member of this savings circle." : "Sign in to send a join request to the group admin."}</p>
            {request?.status === "PENDING" ? (
              <Button variant="secondary" onClick={onCancel} disabled={cancelBusy}>
                {cancelBusy ? "Cancelling…" : "Cancel request"}
              </Button>
            ) : (
              <JoinRequestButton ajo={ajo} request={request} publicView={publicView} isCreator={isCreator} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function FindAjo({ publicView = false }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" });
  const [selectedAjo, setSelectedAjo] = useState(null);
  const [requestError, setRequestError] = useState("");
  const groups = useQuery({
    queryKey: ["ajos", "discovery", page],
    queryFn: () => ajoService.list({ page, size: 20 }),
  });
  const selectedDetails = useQuery({ queryKey: ["ajo", selectedAjo?.id], queryFn: () => ajoService.detail(selectedAjo.id, selectedAjo), enabled: Boolean(selectedAjo) });
  const groupItems = useMemo(() => groups.data?.items || [], [groups.data]);
  const categories = useMemo(() => [...new Set(groupItems.map((ajo) => ajo.category).filter(Boolean))].sort(), [groupItems]);
  const availableGroups = useMemo(
    () => filterDiscoverableAjos(groupItems, filters),
    [filters, groupItems],
  );
  const join = useMutation({
    meta: {
      successMessage: (_data, variables) => `Your request to join ${variables.ajo.name} was sent to the group admin.`,
    },
    mutationFn: ({ ajo, values }) => ajoService.requestToJoin(ajo.id, {
      requestedSlots: values.slots,
      preferredPayoutPositions: values.preferredPosition ? [Number(values.preferredPosition)] : [],
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
        queryClient.invalidateQueries({ queryKey: ["ajo"] }),
      ]);
      setSelectedAjo(null);
    },
    onError: (error) => setRequestError(error.message || "We couldn’t send your request. Please try again."),
  });
  const cancel = useMutation({
    meta: { successMessage: "Your pending join request was cancelled." },
    mutationFn: ({ request, ajo }) => ajoService.cancelJoinRequest(ajo.id, request.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      setSelectedAjo(null);
    },
    onError: (error) => setRequestError(error.message || "We couldn’t cancel your request."),
  });
  const openDetails = (ajo) => { setRequestError(""); setSelectedAjo(ajo); };
  const selectedGroup = selectedDetails.data || selectedAjo;
  const selectedUserIsCreator = Boolean(user && selectedGroup?.creatorId === user.id);
  return (
    <div className="find-ajo">
      <PageHeader eyebrow="AJO MARKETPLACE" title="Find an Ajo that fits your life" description="Compare trusted savings circles, choose the right contribution plan, and request a place in the group." action={!publicView && <Link to="/ajos/create" className="button button--primary">Create an Ajo</Link>} />
      <AjoDiscoveryFilters values={filters} categories={categories} onChange={(key, value) => { setFilters((current) => ({ ...current, [key]: value })); }} onClear={() => setFilters({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" })} />
      <div className="find-ajo__results"><div><b>{groups.isLoading ? "Finding available groups…" : `${availableGroups.length} matching Ajo${availableGroups.length === 1 ? "" : "s"} on this page`}</b><small>Open and filling groups with available slots are shown</small></div><ShieldIcon /></div>
      {groups.isError ? (
        <QueryErrorState error={groups.error} title="Ajos could not be loaded" />
      ) : groups.isLoading ? (
        <div className="discovery-grid">{[1, 2, 3, 4].map((item) => <Skeleton className="skeleton--card discovery-skeleton" key={item} />)}</div>
      ) : availableGroups.length ? (
        <div className="discovery-grid">{availableGroups.map((ajo) => {
          const isCreator = Boolean(user && ajo.creatorId === user.id);
          return <AjoGroupCard ajo={ajo} request={ajo.currentRequest ? mapJoinRequest(ajo.currentRequest, ajo) : null} publicView={publicView} isCreator={isCreator} onOpen={() => openDetails(ajo)} key={ajo.id} />;
        })}</div>
      ) : (
        <Card><EmptyState icon={<SearchIcon />} title="No Ajos match those filters" text="Try a different search, contribution range, or frequency." action={<Button variant="secondary" onClick={() => setFilters({ search: "", frequency: "ALL", category: "ALL", amount: "ALL" })}>Clear all filters</Button>} /></Card>
      )}
      <Pagination {...groups.data} onChange={setPage} busy={groups.isFetching} />
      {selectedAjo && !selectedDetails.isLoading && <AjoGroupDetails key={selectedAjo.id} ajo={selectedGroup} request={selectedGroup.currentRequest ? mapJoinRequest(selectedGroup.currentRequest, selectedGroup) : null} publicView={publicView} isCreator={selectedUserIsCreator} busy={join.isPending} cancelBusy={cancel.isPending} error={requestError} onClose={() => !join.isPending && !cancel.isPending && setSelectedAjo(null)} onRequest={(values) => join.mutate({ ajo: selectedAjo, values })} onCancel={() => { const detail = selectedGroup; cancel.mutate({ request: mapJoinRequest(detail.currentRequest, detail), ajo: detail }); }} />}
    </div>
  );
}
