import { requestData } from "../api/client";

export const mapContribution = (item) => {
  const requiredAmount = Number(item.requiredAmount ?? item.amount ?? 0);
  const paidAmount = Number(item.paidAmount ?? item.amountPaid ?? 0);
  const remainingAmount = Number(
    item.remainingAmount ?? item.outstandingAmount ?? Math.max(requiredAmount - paidAmount, 0),
  );

  return {
    ...item,
    amount: requiredAmount,
    requiredAmount,
    paidAmount,
    remainingAmount,
    dueDate: item.dueDate || item.dueAt,
    paymentDeadline: item.paymentDeadline || item.deadline || item.periodEnd || item.expiresAt || item.dueAt || item.dueDate,
    participant: item.participant || item.user || { id: item.participantId },
  };
};

export const contributionService = {
  async listByCycle(cycleId) {
    const rows = await requestData({ method: "GET", url: `/contributions/cycles/${cycleId}` });
    return (Array.isArray(rows) ? rows : rows?.items || []).map(mapContribution);
  },
  async pay(contributionId, amount, referenceId) {
    return mapContribution(await requestData({
      method: "POST",
      url: `/contributions/${contributionId}/pay`,
      data: { amount, referenceId },
    }));
  },
};
