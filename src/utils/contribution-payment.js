const fullyPaidStatuses = new Set(["PAID", "COMPLETED", "LATE_COMPLETED"]);

export function isContributionFullyPaid(contribution) {
  if (!contribution) return false;
  if (fullyPaidStatuses.has(String(contribution.status || "").toUpperCase())) return true;
  const required = Number(contribution.requiredAmount ?? contribution.amount ?? 0);
  const paid = Number(contribution.paidAmount ?? 0);
  const outstanding = getContributionOutstanding(contribution);
  return outstanding <= 0 && (required > 0 || paid > 0);
}

export function getContributionOutstanding(contribution) {
  const required = Number(contribution?.requiredAmount ?? contribution?.amount ?? 0);
  const paid = Number(contribution?.paidAmount ?? 0);
  const outstanding = Number(contribution?.remainingAmount ?? contribution?.outstandingAmount);
  return Math.max(Number.isFinite(outstanding) ? outstanding : required - paid, 0);
}

export function isContributionPaymentExpired(contribution, now = new Date()) {
  if (!contribution) return false;
  if (contribution.paymentPeriodExpired === true || contribution.periodExpired === true) return true;
  if (contribution.paymentPeriodActive === false || contribution.withinPaymentPeriod === false) return true;

  const deadline = contribution.paymentDeadline || contribution.deadline || contribution.periodEnd || contribution.expiresAt || contribution.dueAt || contribution.dueDate;
  const deadlineTime = new Date(deadline).getTime();
  return Boolean(deadline) && Number.isFinite(deadlineTime) && deadlineTime <= new Date(now).getTime();
}

export function validateContributionPayment(value, contribution, now = new Date()) {
  if (isContributionFullyPaid(contribution)) return "This contribution has already been fully paid.";
  if (isContributionPaymentExpired(contribution, now)) return "The payment period for this contribution has expired.";
  if (String(value ?? "").trim() === "") return "Please enter an amount.";

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Amount must be greater than ₦0.";
  if (amount > getContributionOutstanding(contribution)) return "Amount cannot exceed your outstanding balance.";
  return "";
}

export function getRemainingPaymentTime(contribution, now = new Date()) {
  const deadline = contribution?.paymentDeadline || contribution?.deadline || contribution?.periodEnd || contribution?.expiresAt || contribution?.dueAt || contribution?.dueDate;
  const difference = new Date(deadline).getTime() - new Date(now).getTime();
  if (!deadline || !Number.isFinite(difference)) return "Payment period not provided";
  if (difference <= 0) return "Payment period expired";

  const minutes = Math.ceil(difference / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} remaining`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} remaining`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}
