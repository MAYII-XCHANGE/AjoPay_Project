import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { ajoService } from "../services/ajo-service";
import { CheckIcon, UsersIcon } from "../components/icons";
import { Badge, Button, Card, Modal, PageHeader } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { RatingForm } from "../features/ratings/rating-form";
import { getAvailableAjoSlots, isAjoFull, isAjoPreStart, isAjoReadyToStart } from "../utils/ajo-filters";
import { reorderBySlotId } from "../utils/ajo-order";
import { AjoStatus, JoinRequestStatus } from "../enums/statuses";
import { isAjoCreator } from "../utils/ajo-permissions";
export function ManageAjoPage() {
  const { ajoId = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ajo } = useQuery({
    queryKey: ["ajo", ajoId, user?.id],
    queryFn: () => ajoService.detail(ajoId),
  });
  const isCreator = isAjoCreator(ajo, user);
  const { data: requests = [] } = useQuery({
    queryKey: ["ajo-requests", ajoId],
    queryFn: () => ajoService.getJoinRequests(ajoId),
    enabled: isCreator,
  });
  const [confirmStart, setConfirmStart] = useState(false);
  const [startError, setStartError] = useState("");
  const review = useMutation({
    meta: {
      successMessage: (_data, variables) => `The join request was ${variables.decision.toLowerCase()}.`,
    },
    mutationFn: ({ requestId, decision }) =>
      ajoService.reviewJoinRequest(ajoId, requestId, decision),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo-requests", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["join-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });
  const pending = requests.filter((request) => request.status === JoinRequestStatus.PENDING);
  const availableSlots = getAvailableAjoSlots(ajo);
  const groupIsFull = isAjoFull(ajo);
  const preStart = isAjoPreStart(ajo);
  const readyToStart = isAjoReadyToStart(ajo);
  const startAjo = useMutation({
    meta: { successMessage: "The Ajo cycle has started successfully." },
    mutationFn: () => ajoService.start(ajoId, { confirm: true }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
      setConfirmStart(false);
    },
    onError: (error) =>
      setStartError(error.message || "This Ajo could not be started."),
  });
  const endAjo = useMutation({
    meta: { successMessage: "The open Ajo was ended." },
    mutationFn: () => ajoService.end(ajoId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
        queryClient.invalidateQueries({ queryKey: ["ajos"] }),
      ]);
    },
  });
  if (ajo && !isCreator) {
    return <Navigate to={`/ajos/${ajoId}`} replace />;
  }
  return (
    <div className="page">
      <Link to={`/ajos/${ajoId}`} className="back-link">
        ← Back to {ajo?.name ?? "Ajo"}
      </Link>
      <PageHeader
        eyebrow="CREATOR TOOLS"
        title={`Manage ${ajo?.name ?? "your Ajo"}`}
        description="Review requests and get the circle ready to begin."
        action={readyToStart ? (
          <Link
            to={`/ajos/${ajoId}/order`}
            className="button button--secondary"
          >
            Arrange payout order
          </Link>
        ) : null}
      />
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
              ? "Filled — arrange the payout order"
              : preStart
                ? `${availableSlots} slot${availableSlots === 1 ? "" : "s"} remaining`
                : ajo?.status === AjoStatus.ACTIVE
                  ? "Cycle already started"
                  : "This group is no longer accepting members"}
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
                    disabled={review.isPending || groupIsFull}
                    onClick={() => review.mutate({ requestId: request.id, decision: "ACCEPTED" })}
                  >
                    {groupIsFull ? "Group filled" : "Accept"}
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
      {(ajo?.slots || [])
        .filter((slot) => (ajo.status === AjoStatus.CYCLE_COMPLETED || slot.status === "EXITED" || slot.participant?.exitedAt) && (slot.participant || slot.user)?.id !== user?.id)
        .map((slot) => <RatingForm key={slot.id || slot.slotId} ajoId={ajoId} participant={slot.participant || slot.user} />)}
      <div className="creator-footer">
        <div>
          <b>{readyToStart ? "All slots are filled" : preStart ? "Waiting for members" : "Cycle status"}</b>
          <span>{readyToStart ? "Arrange or review the payout order, then start the cycle." : preStart ? `${availableSlots} slot${availableSlots === 1 ? "" : "s"} must still be filled.` : "This Ajo can no longer be started from its setup state."}</span>
        </div>
        {readyToStart && (
          <Link to={`/ajos/${ajoId}/order`} className="button button--secondary">
            Arrange payout order
          </Link>
        )}
        <Button
          onClick={() => {
            setStartError("");
            setConfirmStart(true);
          }}
          disabled={!readyToStart}
        >
          {ajo?.status === AjoStatus.ACTIVE ? "Cycle active" : "Start cycle"}
        </Button>
        {preStart && (
          <Button variant="danger" onClick={() => endAjo.mutate()} disabled={endAjo.isPending}>
            {endAjo.isPending ? "Ending…" : "End Ajo"}
          </Button>
        )}
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
            first contribution and payout eligibility will follow the configured first-payout schedule.
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ajo } = useQuery({ queryKey: ["ajo", ajoId], queryFn: () => ajoService.detail(ajoId) });
  const isCreator = isAjoCreator(ajo, user);
  const canArrangeOrder = isCreator && isAjoReadyToStart(ajo);
  const [memberOrder, setMemberOrder] = useState([]);
  const [draggedSlotId, setDraggedSlotId] = useState(null);
  const [dragOverSlotId, setDragOverSlotId] = useState(null);
  const draggedSlotIdRef = useRef(null);
  const sourceMembers = useMemo(() => (ajo?.slots || [])
      .filter((slot) => slot.participant || slot.user)
      .map((slot) => ({
        slotId: slot.id || slot.slotId,
        name: slot.participant?.name || slot.user?.name || "AjoPay member",
        payoutPosition: slot.payoutPosition,
        slotNumber: slot.slotNumber,
      }))
      .sort((left, right) => (
        (left.payoutPosition || left.slotNumber || Number.MAX_SAFE_INTEGER)
        - (right.payoutPosition || right.slotNumber || Number.MAX_SAFE_INTEGER)
      )), [ajo?.slots]);
  const members = memberOrder.length
    ? memberOrder.map((slotId) => sourceMembers.find((member) => member.slotId === slotId)).filter(Boolean)
    : sourceMembers;
  const saveOrder = useMutation({
    meta: { successMessage: "Payout order saved successfully." },
    mutationFn: () => ajoService.setOrder(ajoId, members.map((member, index) => ({ slotId: member.slotId, position: index + 1 }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }),
  });
  const move = (index, direction) => {
    const next = [...members];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setMemberOrder(next.map((member) => member.slotId));
  };
  const reorder = (sourceSlotId, targetSlotId) => {
    const next = reorderBySlotId(members, sourceSlotId, targetSlotId);
    setMemberOrder(next.map((member) => member.slotId));
  };
  const startDragging = (slotId) => {
    draggedSlotIdRef.current = slotId;
    setDraggedSlotId(slotId);
  };
  const stopDragging = () => {
    draggedSlotIdRef.current = null;
    setDraggedSlotId(null);
    setDragOverSlotId(null);
  };
  const handlePointerMove = (event) => {
    if (!draggedSlotIdRef.current) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-order-slot]");
    const targetSlotId = target?.dataset.orderSlot;
    if (!targetSlotId || targetSlotId === draggedSlotIdRef.current) return;
    reorder(draggedSlotIdRef.current, targetSlotId);
    setDragOverSlotId(targetSlotId);
  };
  const randomize = () => {
    setMemberOrder([...members].sort(() => Math.random() - 0.5).map((member) => member.slotId));
  };
  if (ajo && !canArrangeOrder) {
    return <Navigate to={`/ajos/${ajoId}/manage`} replace />;
  }
  return (
    <div className="page page--narrow">
      <Link to={`/ajos/${ajoId}/manage`} className="back-link">
        ← Back to management
      </Link>
      <PageHeader
        eyebrow="PAYOUT SCHEDULE"
        title="Arrange payout order"
        description="Drag any participant row into position. Every accepted slot must appear exactly once."
        action={
          <Button variant="secondary" onClick={randomize} disabled={!canArrangeOrder}>
            Randomise order
          </Button>
        }
      />
      <Card className="order-card">
        <div className="order-head">
          <span>Position</span>
          <span>Member</span>
          <span>Drag</span>
        </div>
        {members.map((member, index) => (
          <div
            className={`order-row${draggedSlotId === member.slotId ? " order-row--dragging" : ""}${dragOverSlotId === member.slotId ? " order-row--drag-over" : ""}`}
            data-order-slot={member.slotId}
            onPointerDown={(event) => {
              if (!canArrangeOrder || (event.pointerType === "mouse" && event.button !== 0)) return;
              if (!event.target.closest(".order-drag-handle")) event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              startDragging(member.slotId);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              stopDragging();
            }}
            onPointerCancel={stopDragging}
            key={member.slotId}
          >
            <b>{index + 1}</b>
            <span className="avatar">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div>
              <strong>{member.name}</strong>
              <small>
                {index === 0 ? "First payout" : `Payout ${index + 1}`}
              </small>
            </div>
            <button
              type="button"
              className="order-drag-handle"
              aria-label={`${member.name} payout position. Drag the row or use Up and Down arrow keys.`}
              title="Drag anywhere on this row to reorder. Use Up or Down arrow keys when focused."
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  move(index, -1);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  move(index, 1);
                }
              }}
            >
              <span aria-hidden="true">⠿</span>
            </button>
          </div>
        ))}
      </Card>
      {ajo && !members.length && <div className="form-error" role="status">Accepted Ajo slots will appear here before you arrange the payout order.</div>}
      <div className="form-actions">
        <Link to={`/ajos/${ajoId}/manage`} className="button button--secondary">
          Cancel
        </Link>
        <Button onClick={() => saveOrder.mutate()} disabled={saveOrder.isPending || !members.length || !canArrangeOrder}>
          {saveOrder.isPending ? "Saving…" : "Save payout order"}
        </Button>
      </div>
    </div>
  );
}
