import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ajoService, mapJoinRequest } from "../services/ajo-service";
import { contributionService } from "../services/contribution-service";
import { socialService } from "../services/social-service";
import {
  CheckIcon,
  PlusIcon,
  ShieldIcon,
} from "../components/icons";
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  Skeleton,
} from "../components/ui";
import { AjoCard } from "../features/ajo/ajo-card";
import { FindAjo, JoinRequestStatus } from "../features/find-ajo/find-ajo";
import { useAuth } from "../contexts/auth-context";
import {
  formatCurrency,
  formatDate,
  frequencyLabel,
} from "../utils/formatters";
import { toApiLocalDateTime, toApiLocalTime, toDateTimeInputValue, validateCreateAjo } from "../utils/ajo-validation";
import { DEFAULT_PAGE_SIZE } from "../config/pagination";
import { AjoStatus, JoinRequestStatus as JoinRequestState } from "../enums/statuses";
import { isAjoCreator } from "../utils/ajo-permissions";
import { QueryErrorState } from "../components/query-state";
import { Pagination } from "../components/pagination";
import { getAvailableAjoSlots, isAjoFull, isAjoJoinable } from "../utils/ajo-filters";
export function FindAjoPage({ publicView = false }) {
  const content = <FindAjo publicView={publicView} />;
  if (publicView)
    return (
      <div className="public-list">
        <header>
          <Link to="/" className="text-link">
            ← AjoPay home
          </Link>
          <div>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="button button--primary">
              Create account
            </Link>
          </div>
        </header>
        <main className="page">{content}</main>
      </div>
    );
  return <div className="page">{content}</div>;
}
export function MyAjosPage() {
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ajos", user?.id, page],
    queryFn: () => ajoService.listForViewer({ page, size: DEFAULT_PAGE_SIZE }),
  });
  const groups = data?.items || [];
  const mine =
    tab === "created"
      ? groups.filter((ajo) => isAjoCreator(ajo, user))
      : tab === "available"
        ? groups.filter(isAjoJoinable)
        : groups.filter((ajo) => ajo.joined);
  return (
    <div className="page">
      <PageHeader
        eyebrow="YOUR CIRCLES"
        title="My Ajos"
        description="Everything you’re saving towards, all in one place."
        action={
          <Link to="/ajos/create" className="button button--primary">
            <PlusIcon />
            Create an Ajo
          </Link>
        }
      />
      <div className="tabs">
        {[
          ["active", "Active"],
          ["created", "Created by me"],
          ["available", "Explore"],
        ].map(([value, label]) => (
          <button
            className={tab === value ? "active" : ""}
            onClick={() => { setTab(value); setPage(0); }}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      <Pagination {...data} onChange={setPage} busy={isLoading} />
      <div className="ajo-grid">
        {isError ? (
          <QueryErrorState error={error} title="Your Ajos could not be loaded" />
        ) : isLoading ? (
          <Skeleton className="skeleton--card" />
        ) : (
          mine.map((ajo) => <AjoCard key={ajo.id} ajo={ajo} />)
        )}
      </div>
    </div>
  );
}
export function AjoDetailPage() {
  const { ajoId = "" } = useParams();
  const [joinOpen, setJoinOpen] = useState(false);
  const [slots, setSlots] = useState(1);
  const [preferredPositions, setPreferredPositions] = useState([""]);
  const [success, setSuccess] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [exitOpen, setExitOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: ajo, isLoading } = useQuery({
    queryKey: ["ajo", ajoId, user?.id],
    queryFn: () => ajoService.detail(ajoId),
  });
  const currentRequest = ajo?.currentRequest ? mapJoinRequest(ajo.currentRequest, ajo) : null;
  const creatorFollow = useQuery({
    queryKey: ["followers", ajo?.creatorId],
    queryFn: () => socialService.followerCount(ajo.creatorId),
    enabled: Boolean(ajo?.creatorId),
  });
  const followStatus = useQuery({
    queryKey: ["follow-status", ajo?.creatorId],
    queryFn: () => socialService.followStatus(ajo.creatorId),
    enabled: Boolean(ajo?.creatorId && user?.id && ajo.creatorId !== user.id),
  });
  const isFollowing = followStatus.data === true;
  const toggleFollow = useMutation({
    meta: { successMessage: () => isFollowing ? "You unfollowed this Ajo creator." : "You are now following this Ajo creator." },
    mutationFn: () =>
      isFollowing
        ? socialService.unfollow(ajo.creatorId)
        : socialService.follow(ajo.creatorId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["followers", ajo?.creatorId] }),
        queryClient.invalidateQueries({ queryKey: ["follow-status", ajo?.creatorId] }),
      ]);
    },
  });
  const join = useMutation({
    meta: {
      successMessage: () => isAjoCreator(ajo, user)
        ? "You joined your Ajo successfully."
        : "Your join request was sent to the group admin.",
    },
    mutationFn: () =>
      ajoService.requestToJoin(ajoId, {
        requestedSlots: slots,
        preferredPayoutPositions: preferredPositions.map(Number),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
      setSuccess(true);
    },
    onError: (error) =>
      setJoinError(
        error.message || "We couldn’t send your request. Please try again.",
      ),
  });
  const cancelRequest = useMutation({
    meta: { successMessage: "Your pending join request was cancelled." },
    mutationFn: () => ajoService.cancelJoinRequest(ajoId, currentRequest.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] });
      setJoinOpen(false);
      setJoinError("");
    },
    onError: (error) =>
      setJoinError(error.message || "We couldn’t cancel your request."),
  });
  const contributionQuery = useQuery({
    queryKey: ["cycle-contributions", ajo?.currentCycleId],
    queryFn: () => contributionService.listByCycle(ajo.currentCycleId),
    enabled: Boolean(ajo?.currentCycleId && ajo?.status === AjoStatus.ACTIVE),
    refetchInterval: 60_000,
  });
  const currentContribution = contributionQuery.data?.find(
    (contribution) => contribution.participant.id === user.id,
  );
  const payContribution = useMutation({
    meta: { successMessage: "Your contribution payment was successful." },
    mutationFn: () =>
      contributionService.pay(
        currentContribution.id,
        Number(currentContribution.remainingAmount ?? currentContribution.amount),
        crypto.randomUUID(),
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cycle-contributions"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
    },
    onError: (error) => {
      if (error.code === "INSUFFICIENT_AJO_BALANCE") {
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      }
    },
  });
  const exitAjo = useMutation({
    meta: { successMessage: "You have exited the active Ajo cycle." },
    mutationFn: () => ajoService.exit(ajoId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
      setExitOpen(false);
    },
  });
  if (isLoading)
    return (
      <div className="page">
        <Skeleton className="skeleton--hero" />
      </div>
    );
  if (!ajo) return <div className="page"><QueryErrorState title="This Ajo could not be loaded" /></div>;
  const available = getAvailableAjoSlots(ajo);
  const groupIsFull = isAjoFull(ajo);
  const isCreator = isAjoCreator(ajo, user);
  const canFollowCreator = Boolean(ajo.creatorId && !isCreator);
  return (
    <div className="page">
      <Link to="/find-ajo" className="back-link">
        ← Back to Ajos
      </Link>
      <section className="detail-hero">
        <div>
          <Badge tone={ajo.status === AjoStatus.ACTIVE ? "blue" : groupIsFull ? "amber" : "green"}>
            {ajo.status === AjoStatus.ACTIVE ? "Active circle" : groupIsFull ? "Filled — ready to start" : "Open to join"}
          </Badge>
          <h1>{ajo.name}</h1>
          <p>{ajo.description}</p>
          <div className="creator-follow">
            <span>
              Created by <b>{ajo.creator}</b> • ★ 4.9
              {creatorFollow.data && ` • ${creatorFollow.data.count} followers`}
            </span>
            {canFollowCreator && (
              <Button
                variant="secondary"
                onClick={() => toggleFollow.mutate()}
                disabled={toggleFollow.isPending}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        <Card>
          <small>Contribution</small>
          <strong>{formatCurrency(ajo.contributionAmount)}</strong>
          <span>{frequencyLabel[ajo.frequency]}</span>
          {isCreator ? (
            <div className="detail-hero__creator-actions">
              <Link
                to={`/ajos/${ajo.id}/manage`}
                className="button button--primary"
              >
                Manage this Ajo
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  setJoinError("");
                  setJoinOpen(true);
                }}
                disabled={groupIsFull}
              >
                {groupIsFull ? "Group filled" : "Join this Ajo"}
              </Button>
            </div>
          ) : ajo.joined || currentRequest?.status === "ACCEPTED" ? (
            <Button disabled>
              <CheckIcon /> Member
            </Button>
          ) : currentRequest?.status === JoinRequestState.PENDING ? (
            <Button variant="secondary" onClick={() => setJoinOpen(true)}>
              Request sent
            </Button>
          ) : (
            <Button
              onClick={() => {
                setJoinError("");
                setJoinOpen(true);
              }}
              disabled={groupIsFull}
            >
              {groupIsFull
                ? "Group filled"
                : currentRequest?.status === "DECLINED"
                ? "Request again"
                : "Request to join"}
            </Button>
          )}
          <JoinRequestStatus request={currentRequest} isMember={ajo.joined} />
        </Card>
      </section>
      <div className="detail-grid">
        <Card>
          <h2>Circle details</h2>
          <dl>
            <div>
              <dt>Members</dt>
              <dd>
                {ajo.filledSlots} of {ajo.slotCount}
              </dd>
            </div>
            <div>
              <dt>Available slots</dt>
              <dd>{available}</dd>
            </div>
            <div>
              <dt>Starts</dt>
              <dd>
                {ajo.startDate
                  ? formatDate(ajo.startDate)
                  : "Set when the cycle starts"}
              </dd>
            </div>
            <div>
              <dt>Frequency</dt>
              <dd>{frequencyLabel[ajo.frequency]}</dd>
            </div>
            <div>
              <dt>Total payout</dt>
              <dd>{formatCurrency(ajo.contributionAmount * ajo.slotCount)}</dd>
            </div>
            <div>
              <dt>Late-payment grace</dt>
              <dd>2 days</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2>How your cycle works</h2>
          <ol className="timeline">
            <li>
              <i>1</i>
              <span>
                <b>Join the circle</b>
                <small>Request your slot and preferred payout turn.</small>
              </span>
            </li>
            <li>
              <i>2</i>
              <span>
                <b>Contribute on schedule</b>
                <small>
                  Pay {formatCurrency(ajo.contributionAmount)}{" "}
                  {frequencyLabel[ajo.frequency].toLowerCase()}.
                </small>
              </span>
            </li>
            <li>
              <i>3</i>
              <span>
                <b>Receive your payout</b>
                <small>
                  Get {formatCurrency(ajo.contributionAmount * ajo.slotCount)}{" "}
                  when it’s your turn.
                </small>
              </span>
            </li>
          </ol>
        </Card>
      </div>
      {ajo.status === AjoStatus.ACTIVE && currentContribution && (
        <Card className="ajo-contribution-card">
          <span className="ajo-contribution-card__icon">
            {currentContribution.status === "PAID" ? <CheckIcon /> : "₦"}
          </span>
          <div>
            <small>CURRENT CYCLE CONTRIBUTION</small>
            <h2>{formatCurrency(currentContribution.amount)}</h2>
            <p>
              Due {formatDate(currentContribution.dueDate)} · Paid from your
              Ajo wallet
            </p>
          </div>
          <Badge tone={currentContribution.status === "PAID" ? "green" : "amber"}>
            {currentContribution.status.toLowerCase()}
          </Badge>
          {currentContribution.status === "DUE" && (
            <Button
              onClick={() => payContribution.mutate()}
              disabled={payContribution.isPending}
            >
              {payContribution.isPending ? "Paying…" : "Pay contribution"}
            </Button>
          )}
          {payContribution.isError && <div className="form-error" role="alert">{payContribution.error.message}</div>}
        </Card>
      )}
      {ajo.status === AjoStatus.ACTIVE && ajo.joined && (
        <div className="ajo-member-actions">
          <div><b>Need to leave this cycle?</b><span>Exiting stops future contribution periods and cannot be undone here.</span></div>
          <Button variant="danger" onClick={() => setExitOpen(true)}>Exit Ajo</Button>
        </div>
      )}
      <Modal
        open={joinOpen}
        onClose={() => {
          setJoinOpen(false);
          setSuccess(false);
          setJoinError("");
        }}
        title={
          success
            ? "Request sent"
            : currentRequest?.status === JoinRequestState.PENDING
              ? "Pending join request"
              : `Join ${ajo.name}`
        }
      >
        {success ? (
          <div className="success-panel">
            <span>
              <CheckIcon />
            </span>
            <h3>You’re one step closer</h3>
            <p>
              {ajo.creator} will review your request. We’ll let you know as soon
              as there’s an update.
            </p>
            <Button onClick={() => setJoinOpen(false)}>Done</Button>
          </div>
        ) : currentRequest?.status === JoinRequestState.PENDING ? (
          <div className="confirm-panel">
            <p>
              {ajo.creator} is reviewing your request. You are not a member
              until the request is accepted.
            </p>
            {joinError && (
              <div className="form-error" role="alert">
                {joinError}
              </div>
            )}
            <div>
              <Button variant="secondary" onClick={() => setJoinOpen(false)}>
                Keep request
              </Button>
              <Button
                variant="danger"
                onClick={() => cancelRequest.mutate()}
                disabled={cancelRequest.isPending}
              >
                {cancelRequest.isPending ? "Cancelling…" : "Cancel request"}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault();
              join.mutate();
            }}
          >
            <p>
              Choose the number of slots you want. You won’t be charged until
              the circle starts.
            </p>
            {joinError && (
              <div className="form-error" role="alert">
                {joinError}
              </div>
            )}
            <label>
              Number of slots
              <select
                value={slots}
                onChange={(event) => {
                  const count = Number(event.target.value);
                  setSlots(count);
                  setPreferredPositions((current) => Array.from({ length: count }, (_, index) => current[index] || ""));
                }}
              >
                {Array.from({ length: available }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} slot{index ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            {preferredPositions.map((position, index) => (
              <label key={index}>
                Preferred payout position for slot {index + 1}
                <select value={position} onChange={(event) => setPreferredPositions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} required>
                  <option value="">Select position</option>
                  {Array.from({ length: ajo.slotCount }, (_, optionIndex) => optionIndex + 1)
                    .filter((option) => String(option) === position || !preferredPositions.includes(String(option)))
                    .map((option) => <option value={option} key={option}>Position {option}</option>)}
                </select>
              </label>
            ))}
            <div className="summary-box">
              <span>Contribution</span>
              <b>
                {formatCurrency(ajo.contributionAmount * slots)}{" "}
                {frequencyLabel[ajo.frequency].toLowerCase()}
              </b>
            </div>
            <p className="secure-note">
              <ShieldIcon /> Your request must be accepted by the group admin
              before you become a member.
            </p>
            <Button disabled={join.isPending || preferredPositions.some((position) => !position)} type="submit">
              {join.isPending ? "Sending request…" : "Send request"}
            </Button>
          </form>
        )}
      </Modal>
      <Modal open={exitOpen} onClose={() => !exitAjo.isPending && setExitOpen(false)} title={`Exit ${ajo.name}?`}>
        <div className="confirm-panel">
          <p>You will be removed from future contribution periods for this active cycle. Confirm only if you understand the effect on your payout.</p>
          {exitAjo.isError && <div className="form-error" role="alert">{exitAjo.error.message}</div>}
          <div><Button variant="secondary" onClick={() => setExitOpen(false)} disabled={exitAjo.isPending}>Stay in Ajo</Button><Button variant="danger" onClick={() => exitAjo.mutate()} disabled={exitAjo.isPending}>{exitAjo.isPending ? "Exiting…" : "Confirm exit"}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
export function CreateAjoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [minimumFirstPayoutAt] = useState(() =>
    toDateTimeInputValue(new Date(Date.now() + 60 * 1000)),
  );
  const [values, setValues] = useState({
    name: "",
    amount: "",
    frequency: "MONTHLY",
    slots: "",
    firstPayoutAt: "",
    lateWindowStart: "09:00",
    lateWindowEnd: "18:00",
    lateFeeAmount: "0",
    creatorCommissionPercent: "0",
  });
  const mutation = useMutation({
    meta: { successMessage: "Your Ajo was created successfully." },
    mutationFn: () =>
      ajoService.create({
        name: values.name.trim(),
        contributionAmount: Number(values.amount),
        frequency: values.frequency,
        slotCount: Number(values.slots),
        firstPayoutAt: toApiLocalDateTime(values.firstPayoutAt),
        lateWindowStart: toApiLocalTime(values.lateWindowStart),
        lateWindowEnd: toApiLocalTime(values.lateWindowEnd),
        lateFeeAmount: Number(values.lateFeeAmount),
        creatorCommissionPercent: Number(values.creatorCommissionPercent),
      }),
    onSuccess: async (ajo) => {
      await queryClient.invalidateQueries({ queryKey: ["ajos"] });
      navigate(`/ajos/${ajo.id}`);
    },
  });
  const submit = (event) => {
    event.preventDefault();
    const errors = validateCreateAjo(values);
    if (Object.keys(errors).length) return setError(Object.values(errors)[0]);
    mutation.mutate();
  };
  const set = (key, value) => {
    setError("");
    setValues((current) => ({ ...current, [key]: value }));
  };
  return (
    <div className="page page--narrow">
      <Link to="/my-ajos" className="back-link">
        ← Back to My Ajos
      </Link>
      <PageHeader
        eyebrow="NEW SAVINGS CIRCLE"
        title="Create an Ajo"
        description="Set the rules clearly so everyone knows exactly what to expect."
      />
      <form className="create-form" onSubmit={submit}>
        <Card>
          <h2>About this Ajo</h2>
          <div className="form-grid">
            <label>
              Ajo name *
              <input
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. New Car Fund"
              />
            </label>
          </div>
        </Card>
        <Card>
          <h2>Contribution details</h2>
          <div className="form-grid">
            <label>
              Contribution amount (₦) *
              <input
                type="number"
                value={values.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="50,000"
                min="100"
                step="0.01"
              />
            </label>
            <label>
              Frequency *
              <select
                value={values.frequency}
                onChange={(e) => set("frequency", e.target.value)}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </label>
            <label>
              Number of slots *
              <input
                type="number"
                value={values.slots}
                onChange={(e) => set("slots", e.target.value)}
                min="2"
                max="100"
                placeholder="10"
              />
            </label>
            <label>
              First contribution and payout date/time *
              <input
                type="datetime-local"
                value={values.firstPayoutAt}
                onChange={(e) => set("firstPayoutAt", e.target.value)}
                min={minimumFirstPayoutAt}
                required
              />
              <small>The first contribution period is due at this time, and the first participant becomes eligible for payout. Later periods repeat {frequencyLabel[values.frequency]?.toLowerCase()}.</small>
            </label>
            <label>Late window starts (optional)<input type="time" value={values.lateWindowStart} onChange={(e) => set("lateWindowStart", e.target.value)} /></label>
            <label>Late window ends (optional)<input type="time" value={values.lateWindowEnd} onChange={(e) => set("lateWindowEnd", e.target.value)} /></label>
            <label>Late fee (₦) *<input type="number" min="0" step="0.01" value={values.lateFeeAmount} onChange={(e) => set("lateFeeAmount", e.target.value)} required /></label>
            <label>Creator commission (%) *<input type="number" min="0" max="100" step="0.01" value={values.creatorCommissionPercent} onChange={(e) => set("creatorCommissionPercent", e.target.value)} required /></label>
          </div>
          {values.amount && values.slots && (
            <div className="payout-preview">
              <span>Estimated payout each turn</span>
              <strong>
                {formatCurrency(Number(values.amount) * Number(values.slots))}
              </strong>
            </div>
          )}
        </Card>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {mutation.isError && <div className="form-error" role="alert">{mutation.error.message}</div>}
        <div className="form-actions">
          <Link to="/my-ajos" className="button button--secondary">
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create Ajo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
