import { requestData } from "../api/client";
import { normalizePage, pageParams } from "../api/pagination";
import { JoinRequestStatus } from "../enums/statuses";

export function mapAjoSlot(raw = {}) {
  const participantObject = typeof raw.participant === "object" && raw.participant !== null
    ? raw.participant
    : typeof raw.user === "object" && raw.user !== null
      ? raw.user
      : null;
  const participantId = participantObject?.id || participantObject?.userId || raw.participantId || raw.userId;
  const participantName = participantObject?.name
    || raw.participantName
    || raw.userName
    || [participantObject?.firstName, participantObject?.lastName].filter(Boolean).join(" ");
  const hasParticipant = Boolean(participantObject || participantId || participantName);

  return {
    ...raw,
    id: raw.id || raw.slotId,
    slotId: raw.slotId || raw.id,
    slotNumber: Number(raw.slotNumber ?? raw.number ?? 0),
    payoutPosition: Number(raw.payoutPosition ?? raw.position ?? 0) || null,
    status: raw.cycleSlotStatus || raw.status || null,
    participant: hasParticipant ? {
      ...participantObject,
      id: participantId,
      name: participantName || "AjoPay member",
    } : null,
  };
}

export function mapAjo(raw = {}) {
  const creatorObject = typeof raw.creator === "object" ? raw.creator : null;
  const createdByObject = typeof raw.createdBy === "object" ? raw.createdBy : null;
  const slots = Array.isArray(raw.slots) ? raw.slots.map(mapAjoSlot) : [];
  const occupiedSlots = slots.filter((slot) => slot.participant || slot.user || slot.status === "FILLED").length;
  const viewer = raw.viewer || raw.viewerDetails || raw.viewerPermissions || {};
  const slotCount = Number(raw.slotCount ?? raw.totalSlots ?? slots.length ?? 0);
  const filledSlots = Number(
    raw.filledSlots ??
    raw.memberCount ??
    (raw.availableSlots != null ? Math.max(slotCount - Number(raw.availableSlots), 0) : occupiedSlots),
  );
  return {
    ...raw,
    id: raw.id || raw.ajoId,
    creatorId:
      raw.creatorId ||
      raw.creatorUserId ||
      raw.createdById ||
      creatorObject?.id ||
      creatorObject?.userId ||
      createdByObject?.id ||
      createdByObject?.userId,
    creator: creatorObject?.name || raw.creatorName || createdByObject?.name || raw.creator || "Ajo creator",
    description: raw.description || "A transparent rotating savings circle on AjoPay.",
    category: raw.category || "Savings",
    contributionAmount: Number(raw.contributionAmount ?? raw.amount ?? 0),
    slots,
    slotCount,
    filledSlots,
    memberCount: filledSlots,
    availableSlots: Math.max(Number(raw.availableSlots ?? slotCount - filledSlots), 0),
    startDate: raw.startDate || raw.firstPayoutAt || raw.startedAt,
    currentCycleId: raw.currentCycleId || raw.cycle?.id,
    joined: Boolean(raw.joined ?? raw.isParticipant ?? raw.isMember ?? viewer.isParticipant ?? viewer.isMember ?? viewer.member),
    canManage: Boolean(raw.canManage ?? raw.isCreator ?? viewer.canManage ?? viewer.isCreator),
    canRequest: Boolean(raw.canRequest ?? viewer.canRequest),
    canStartCycle: Boolean(raw.canStartCycle ?? viewer.canStartCycle),
    currentRequest: raw.currentRequest || raw.joinRequest || viewer.joinRequest || viewer.request || null,
  };
}

const normalizePosition = (value) => {
  const position = typeof value === "object" && value !== null
    ? value.position ?? value.payoutPosition ?? value.value
    : value;
  if (position == null || position === "") return null;
  const numeric = Number(position);
  return Number.isFinite(numeric) ? numeric : String(position);
};

export function normalizePreferredPositions(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map(normalizePosition).filter((position) => position != null);
  if (Array.isArray(value?.items)) return normalizePreferredPositions(value.items);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toUpperCase() === "ANY") return [];
    try {
      return normalizePreferredPositions(JSON.parse(trimmed));
    } catch {
      return trimmed.includes(",")
        ? normalizePreferredPositions(trimmed.split(","))
        : [normalizePosition(trimmed)].filter((position) => position != null);
    }
  }

  return [normalizePosition(value)].filter((position) => position != null);
}

export function mapJoinRequest(raw = {}, ajo) {
  const requester = raw.user || raw.requester || raw.applicant || {};
  return {
    ...raw,
    id: raw.id || raw.requestId,
    ajoId: raw.ajoId || raw.ajo?.id || ajo?.id,
    ajo: raw.ajo || (ajo ? { id: ajo.id, name: ajo.name, creator: ajo.creator, creatorId: ajo.creatorId } : null),
    user: {
      ...requester,
      id: requester.id || raw.userId,
      name: requester.name || raw.userName || [requester.firstName, requester.lastName].filter(Boolean).join(" ") || "AjoPay member",
      email: requester.email || raw.email,
      phone: requester.phone || raw.phone,
    },
    slots: Number(raw.slots ?? raw.requestedSlots ?? 1),
    preferredPositions: normalizePreferredPositions(raw.preferredPositions ?? raw.preferredPayoutPositions),
    requestedAt: raw.requestedAt || raw.createdAt,
    status: String(raw.status || JoinRequestStatus.PENDING).toUpperCase(),
  };
}

export function mergeAjoSummaryWithDetail(summary, detail) {
  if (!detail) return summary;

  return {
    ...summary,
    ...detail,
    creatorId: detail.creatorId || summary?.creatorId,
    creator: detail.creator && detail.creator !== "Ajo creator"
      ? detail.creator
      : summary?.creator || detail.creator,
  };
}

export function toJoinRequestAction(decision) {
  const normalizedDecision = String(decision || "").toUpperCase();
  if (["ACCEPT", "ACCEPTED"].includes(normalizedDecision)) return "accept";
  if (["DECLINE", "DECLINED"].includes(normalizedDecision)) return "decline";
  throw new Error(`Unsupported join-request decision: ${decision}`);
}

export const ajoService = {
  async list(filters = {}) {
    const data = await requestData({ method: "GET", url: "/ajos", params: pageParams(filters) });
    const page = normalizePage(data, filters);
    return { ...page, items: page.items.map(mapAjo) };
  },
  async detail(ajoId, summary) {
    const detail = mapAjo(await requestData({ method: "GET", url: `/ajos/${ajoId}` }));
    if (detail.creatorId) return mergeAjoSummaryWithDetail(summary, detail);

    return mergeAjoSummaryWithDetail(summary, detail);
  },
  async listForViewer(filters = {}) {
    return this.list(filters);
  },
  async create(values) {
    return mapAjo(await requestData({ method: "POST", url: "/ajos", data: values }));
  },
  async requestToJoin(ajoId, values) {
    return mapJoinRequest(await requestData({ method: "POST", url: `/ajos/${ajoId}/requests`, data: values }));
  },
  async getJoinRequests(ajoId) {
    const rows = await requestData({ method: "GET", url: `/ajos/${ajoId}/requests` });
    return (Array.isArray(rows) ? rows : rows?.items || []).map((row) => mapJoinRequest(row));
  },
  async getManagedJoinRequests(userId) {
    const groups = await this.list();
    const managed = groups.items.filter((ajo) => ajo.creatorId === userId);
    const batches = await Promise.all(managed.map(async (ajo) => {
      const requests = await this.getJoinRequests(ajo.id);
      return requests.map((request) => mapJoinRequest(request, ajo));
    }));
    return batches.flat();
  },
  cancelJoinRequest(ajoId, requestId) {
    return requestData({ method: "DELETE", url: `/ajos/${ajoId}/requests/${requestId}` });
  },
  acceptJoinRequest(ajoId, requestId) {
    return requestData({ method: "POST", url: `/ajos/${ajoId}/requests/${requestId}/accept` });
  },
  declineJoinRequest(ajoId, requestId) {
    return requestData({ method: "POST", url: `/ajos/${ajoId}/requests/${requestId}/decline` });
  },
  reviewJoinRequest(ajoId, requestId, decision) {
    const action = toJoinRequestAction(decision);
    return action === "accept"
      ? this.acceptJoinRequest(ajoId, requestId)
      : this.declineJoinRequest(ajoId, requestId);
  },
  setOrder(ajoId, orderedCycleParticipants) {
    return requestData({ method: "POST", url: `/ajos/${ajoId}/order`, data: { orderedCycleParticipants } });
  },
  start(ajoId, { confirm } = {}) {
    return requestData({
      method: "POST",
      url: `/ajos/${ajoId}/start`,
      data: { confirm: confirm === true },
    });
  },
  end(ajoId) {
    return requestData({ method: "POST", url: `/ajos/${ajoId}/end` });
  },
  exit(ajoId) {
    return requestData({ method: "POST", url: `/ajos/${ajoId}/exit` });
  },
};
