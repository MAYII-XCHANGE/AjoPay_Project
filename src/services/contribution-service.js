import { requestData } from "../api/client";

const mapContribution = (item) => ({
  ...item,
  amount: Number(item.amount ?? item.requiredAmount ?? 0),
  dueDate: item.dueDate || item.dueAt,
  participant: item.participant || item.user || { id: item.participantId },
});

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
