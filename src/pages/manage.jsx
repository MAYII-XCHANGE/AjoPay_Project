import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { mockApi } from "../api/mock-service";
import { CheckIcon, UsersIcon } from "../components/icons";
import { Badge, Button, Card, Modal, PageHeader } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
export function ManageAjoPage() {
  const { ajoId = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ajo } = useQuery({
    queryKey: ["ajo", ajoId, user?.id],
    queryFn: () => mockApi.getAjo(ajoId, user?.id),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["ajo-requests", ajoId],
    queryFn: () => mockApi.getJoinRequests({ ajoId, status: "PENDING" }),
  });
  const [confirmStart, setConfirmStart] = useState(false);
  const [notice, setNotice] = useState("");
  const [startError, setStartError] = useState("");
  const review = useMutation({
    mutationFn: ({ requestId, decision }) =>
      mockApi.reviewJoinRequest(requestId, decision),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo-requests", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["join-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      setNotice(
        `${updated.user.name} was ${updated.status.toLowerCase()}.`,
      );
    },
  });
  const pending = requests;
  const readyToStart =
    ajo?.status === "OPEN" && ajo?.filledSlots === ajo?.slotCount;
  const startAjo = useMutation({
    mutationFn: () => mockApi.startAjo(ajoId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
      setConfirmStart(false);
      setNotice("The Ajo cycle has started successfully.");
    },
    onError: (error) =>
      setStartError(error.message || "This Ajo could not be started."),
  });
  return (
    <div className="page">
      <Link to={`/ajos/${ajoId}`} className="back-link">
        ← Back to {ajo?.name ?? "Ajo"}
      </Link>
      <PageHeader
        eyebrow="CREATOR TOOLS"
        title={`Manage ${ajo?.name ?? "your Ajo"}`}
        description="Review requests and get the circle ready to begin."
        action={
          <Link
            to={`/ajos/${ajoId}/order`}
            className="button button--secondary"
          >
            Arrange payout order
          </Link>
        }
      />
      {notice && (
        <div className="success-banner" role="status">
          <CheckIcon /> {notice}
        </div>
      )}
      <section className="stats-grid stats-grid--manage">
        <Card>
          <small>Confirmed slots</small>
          <strong>
            {ajo?.filledSlots ?? 0}/{ajo?.slotCount ?? 0}
          </strong>
          <Badge tone="green">On track</Badge>
        </Card>
        <Card>
          <small>Join requests</small>
          <strong>{pending.length}</strong>
          <span>Waiting for review</span>
        </Card>
        <Card>
          <small>Circle status</small>
          <strong>{ajo?.status || "Loading"}</strong>
          <span>
            {readyToStart
              ? "Ready to start"
              : ajo?.status === "OPEN"
                ? "Waiting for all slots to fill"
                : "Cycle already started"}
          </span>
        </Card>
      </section>
      <Card>
        <div className="section-title section-title--compact">
          <div>
            <h2>Join requests</h2>
            <p>Review reputation before accepting a new member.</p>
          </div>
        </div>
        <div className="request-list">
          {pending.length ? (
            pending.map((request) => (
              <article key={request.id}>
                <span className="avatar">
                  {request.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <h3>{request.user.name}</h3>
                  <p>
                    ★ {request.user.rating} rating •{" "}
                    {request.user.completedCycles} completed cycles
                  </p>
                  <small>
                    {request.slots} slot{request.slots > 1 ? "s" : ""} • Prefers
                    position {request.preferredPositions.join(", ")}
                  </small>
                </div>
                <div>
                  <Button
                    variant="secondary"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ requestId: request.id, decision: "DECLINED" })}
                  >
                    Decline
                  </Button>
                  <Button
                    disabled={review.isPending}
                    onClick={() => review.mutate({ requestId: request.id, decision: "ACCEPTED" })}
                  >
                    Accept
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-inline">
              <UsersIcon />
              <div>
                <b>All caught up</b>
                <span>There are no pending join requests.</span>
              </div>
            </div>
          )}
        </div>
      </Card>
      <div className="creator-footer">
        <div>
          <b>Ready to begin?</b>
          <span>Finalise the payout order before starting the cycle.</span>
        </div>
        <Button
          onClick={() => {
            setStartError("");
            setConfirmStart(true);
          }}
          disabled={!readyToStart}
        >
          {ajo?.status === "ACTIVE" ? "Cycle active" : "Start cycle"}
        </Button>
      </div>
      <Modal
        open={confirmStart}
        onClose={() => setConfirmStart(false)}
        title="Start this savings cycle?"
      >
        <div className="confirm-panel">
          <span className="warning-icon">!</span>
          <p>
            Once started, members and the payout order cannot be changed. The
            first contribution will become due immediately.
          </p>
          <ul>
            <li>
              <CheckIcon />
              All members have accepted their slots
            </li>
            <li>
              <CheckIcon />
              The payout order has been reviewed
            </li>
          </ul>
          {startError && (
            <div className="form-error" role="alert">
              {startError}
            </div>
          )}
          <div>
            <Button variant="secondary" onClick={() => setConfirmStart(false)}>
              Go back
            </Button>
            <Button
              onClick={() => startAjo.mutate()}
              disabled={startAjo.isPending}
            >
              {startAjo.isPending ? "Starting…" : "Yes, start cycle"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export function OrderPage() {
  const { ajoId = "" } = useParams();
  const queryClient = useQueryClient();
  const initial = [
    "Mayowa Adeyemi",
    "Amina Yusuf",
    "Chidi Eze",
    "Ngozi Okafor",
    "Tunde Bello",
    "Sade Williams",
  ];
  const [members, setMembers] = useState(initial);
  const [saved, setSaved] = useState(false);
  const saveOrder = useMutation({
    mutationFn: () => mockApi.setAjoOrder(ajoId, members),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] });
      setSaved(true);
    },
  });
  const move = (index, direction) => {
    const next = [...members];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setMembers(next);
    setSaved(false);
  };
  const randomize = () => {
    setMembers([...members].sort(() => Math.random() - 0.5));
    setSaved(false);
  };
  return (
    <div className="page page--narrow">
      <Link to={`/ajos/${ajoId}/manage`} className="back-link">
        ← Back to management
      </Link>
      <PageHeader
        eyebrow="PAYOUT SCHEDULE"
        title="Arrange payout order"
        description="Every accepted slot must appear exactly once. Review carefully before saving."
        action={
          <Button variant="secondary" onClick={randomize}>
            Randomise order
          </Button>
        }
      />
      <Card className="order-card">
        <div className="order-head">
          <span>Position</span>
          <span>Member</span>
          <span>Move</span>
        </div>
        {members.map((member, index) => (
          <div className="order-row" key={member}>
            <b>{index + 1}</b>
            <span className="avatar">
              {member
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div>
              <strong>{member}</strong>
              <small>
                {index === 0 ? "First payout" : `Payout ${index + 1}`}
              </small>
            </div>
            <div>
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${member} up`}
              >
                ↑
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === members.length - 1}
                aria-label={`Move ${member} down`}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </Card>
      {saved && (
        <div className="success-banner">
          <CheckIcon />
          Payout order saved successfully.
        </div>
      )}
      <div className="form-actions">
        <Link to={`/ajos/${ajoId}/manage`} className="button button--secondary">
          Cancel
        </Link>
        <Button onClick={() => saveOrder.mutate()} disabled={saveOrder.isPending}>
          {saveOrder.isPending ? "Saving…" : "Save payout order"}
        </Button>
      </div>
    </div>
  );
}
export function RenewPage() {
  const { ajoId = "" } = useParams();
  const [saved, setSaved] = useState(false);
  return (
    <div className="page page--narrow">
      <Link to={`/ajos/${ajoId}`} className="back-link">
        ← Back to Ajo
      </Link>
      <PageHeader
        eyebrow="NEXT CYCLE"
        title="Renew this Ajo"
        description="Carry the group forward and update the next cycle’s terms."
      />
      <Card>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <label>
            Contribution amount (₦)
            <input type="number" defaultValue="100000" />
          </label>
          <label>
            Frequency
            <select defaultValue="MONTHLY">
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </label>
          <label>
            Next start date
            <input type="date" defaultValue="2027-01-05" />
          </label>
          <label>
            Late-payment grace (days)
            <input type="number" defaultValue="2" />
          </label>
          <label className="full check-label">
            <input type="checkbox" defaultChecked />
            Invite all current members to the new cycle
          </label>
          {saved && (
            <div className="success-banner full">
              <CheckIcon />
              Renewal invitations have been prepared.
            </div>
          )}
          <Button type="submit">Save renewal</Button>
        </form>
      </Card>
    </div>
  );
}
