import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mockApi } from "../api/mock-service";
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
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["ajos", user?.id],
    queryFn: () => mockApi.getAjos(user?.id),
  });
  const mine =
    tab === "created"
      ? data.filter((ajo) => ajo.creatorId === "user-1")
      : tab === "available"
        ? data.filter((ajo) => ajo.status === "OPEN")
        : data.filter((ajo) => ajo.joined);
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
            onClick={() => setTab(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ajo-grid">
        {isLoading ? (
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
  const [preferredPosition, setPreferredPosition] = useState("ANY");
  const [success, setSuccess] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [exitOpen, setExitOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: ajo, isLoading } = useQuery({
    queryKey: ["ajo", ajoId, user?.id],
    queryFn: () => mockApi.getAjo(ajoId, user?.id),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["join-requests", "user", user?.id],
    queryFn: () => mockApi.getJoinRequests({ userId: user.id }),
  });
  const creatorFollow = useQuery({
    queryKey: ["followers", ajo?.creatorId, user?.id],
    queryFn: () => mockApi.getFollowerSummary(ajo.creatorId, user.id),
    enabled: Boolean(ajo && user && ajo.creatorId !== user.id),
  });
  const toggleFollow = useMutation({
    mutationFn: () =>
      creatorFollow.data?.isFollowing
        ? mockApi.unfollowUser(ajo.creatorId, user.id)
        : mockApi.followUser(ajo.creatorId, user.id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["followers", ajo?.creatorId, user?.id],
      }),
  });
  const currentRequest = requests
    .filter((request) => request.ajoId === ajoId)
    .sort(
      (left, right) =>
        new Date(right.requestedAt) - new Date(left.requestedAt),
    )[0];
  const join = useMutation({
    mutationFn: () =>
      mockApi.requestToJoin({
        ajoId,
        user,
        slots,
        preferredPosition:
          preferredPosition === "ANY" ? null : preferredPosition,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      setSuccess(true);
    },
    onError: (error) =>
      setJoinError(
        error.message || "We couldn’t send your request. Please try again.",
      ),
  });
  const cancelRequest = useMutation({
    mutationFn: () => mockApi.cancelJoinRequest(currentRequest.id, user.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      setJoinOpen(false);
      setJoinError("");
    },
    onError: (error) =>
      setJoinError(error.message || "We couldn’t cancel your request."),
  });
  const contributionQuery = useQuery({
    queryKey: ["cycle-contributions", ajo?.currentCycleId],
    queryFn: () => mockApi.getCycleContributions(ajo.currentCycleId),
    enabled: Boolean(ajo?.currentCycleId && ajo?.status === "ACTIVE"),
  });
  const currentContribution = contributionQuery.data?.find(
    (contribution) => contribution.participant.id === user.id,
  );
  const payContribution = useMutation({
    mutationFn: () =>
      mockApi.payContribution(currentContribution.id, user.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cycle-contributions"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
    },
  });
  const exitAjo = useMutation({
    mutationFn: () => mockApi.exitAjo(ajoId, user.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
      setExitOpen(false);
    },
  });
  if (isLoading || !ajo)
    return (
      <div className="page">
        <Skeleton className="skeleton--hero" />
      </div>
    );
  const available = ajo.slotCount - ajo.filledSlots;
  const isOwner = ajo.creatorId === user?.id;
  return (
    <div className="page">
      <Link to="/find-ajo" className="back-link">
        ← Back to Ajos
      </Link>
      <section className="detail-hero">
        <div>
          <Badge tone={ajo.status === "ACTIVE" ? "blue" : "green"}>
            {ajo.status === "ACTIVE" ? "Active circle" : "Open to join"}
          </Badge>
          <h1>{ajo.name}</h1>
          <p>{ajo.description}</p>
          <div className="creator-follow">
            <span>
              Created by <b>{ajo.creator}</b> • ★ 4.9
              {creatorFollow.data && ` • ${creatorFollow.data.count} followers`}
            </span>
            {!isOwner && (
              <Button
                variant="secondary"
                onClick={() => toggleFollow.mutate()}
                disabled={toggleFollow.isPending}
              >
                {creatorFollow.data?.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        <Card>
          <small>Contribution</small>
          <strong>{formatCurrency(ajo.contributionAmount)}</strong>
          <span>{frequencyLabel[ajo.frequency]}</span>
          {isOwner ? (
            <Link
              to={`/ajos/${ajo.id}/manage`}
              className="button button--primary"
            >
              Manage this Ajo
            </Link>
          ) : ajo.joined || currentRequest?.status === "ACCEPTED" ? (
            <Button disabled>
              <CheckIcon /> Member
            </Button>
          ) : currentRequest?.status === "PENDING" ? (
            <Button variant="secondary" onClick={() => setJoinOpen(true)}>
              Request sent
            </Button>
          ) : (
            <Button
              onClick={() => {
                setJoinError("");
                setJoinOpen(true);
              }}
              disabled={!available}
            >
              {currentRequest?.status === "DECLINED"
                ? "Request again"
                : "Request to join"}
            </Button>
          )}
          <JoinRequestStatus request={currentRequest} isMember={ajo.joined} />
          <small>
            <ShieldIcon />
            Your money stays protected in your wallet.
          </small>
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
      {ajo.status === "ACTIVE" && currentContribution && (
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
        </Card>
      )}
      {ajo.status === "ACTIVE" && ajo.joined && !isOwner && (
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
            : currentRequest?.status === "PENDING"
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
        ) : currentRequest?.status === "PENDING" ? (
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
                onChange={(event) => setSlots(Number(event.target.value))}
              >
                {Array.from({ length: available }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} slot{index ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preferred payout position
              <select
                value={preferredPosition}
                onChange={(event) =>
                  setPreferredPosition(event.target.value)
                }
              >
                <option value="ANY">Any available position</option>
                {Array.from({ length: ajo.slotCount }, (_, index) => (
                  <option value={index + 1} key={index + 1}>
                    Position {index + 1}
                  </option>
                ))}
              </select>
            </label>
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
            <Button disabled={join.isPending} type="submit">
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
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    name: "",
    amount: "",
    frequency: "MONTHLY",
    slots: "",
    category: "Business",
    description: "",
  });
  const mutation = useMutation({
    mutationFn: () =>
      mockApi.createAjo(
        {
          name: values.name,
          description: values.description || "A trusted savings circle.",
          contributionAmount: Number(values.amount),
          frequency: values.frequency,
          slotCount: Number(values.slots),
          category: values.category,
        },
        user,
      ),
    onSuccess: (ajo) => navigate(`/ajos/${ajo.id}`),
  });
  const submit = (event) => {
    event.preventDefault();
    if (
      !values.name ||
      Number(values.amount) <= 0 ||
      Number(values.slots) < 2
    ) {
      setError("Please complete all required fields with valid values.");
      return;
    }
    mutation.mutate();
  };
  const set = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
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
            <label>
              Goal or category
              <select
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option>Business</option>
                <option>Home</option>
                <option>Education</option>
                <option>Lifestyle</option>
                <option>Emergency</option>
              </select>
            </label>
            <label className="full">
              Short description
              <textarea
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell members what you’re saving towards"
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
                min="1"
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
                max="50"
                placeholder="10"
              />
            </label>
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
