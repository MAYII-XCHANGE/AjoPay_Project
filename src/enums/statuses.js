export const AccountStatus = Object.freeze({
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
});

export const AjoStatus = Object.freeze({
  OPEN: "OPEN",
  FILLING: "FILLING",
  READY: "READY",
  ACTIVE: "ACTIVE",
  CYCLE_COMPLETED: "CYCLE_COMPLETED",
  RENEWAL: "RENEWAL",
  CLOSED: "CLOSED",
  ENDED_PRE_START: "ENDED_PRE_START",
});

export const JoinRequestStatus = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

export const WithdrawalStatus = Object.freeze({
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export const SupportIssueStatus = Object.freeze({
  OPEN: "OPEN",
  IN_REVIEW: "IN_REVIEW",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
});
