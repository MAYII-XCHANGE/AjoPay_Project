import { requestData } from "../api/client";

function requireUserId(userId) {
  if (!userId) throw new Error("The user ID required for this action is unavailable.");
  return encodeURIComponent(userId);
}

export const socialService = {
  follow(userId) {
    return requestData({ method: "POST", url: `/users/${requireUserId(userId)}/follow` });
  },
  unfollow(userId) {
    return requestData({ method: "DELETE", url: `/users/${requireUserId(userId)}/follow` });
  },
  async followerCount(userId) {
    const data = await requestData({ method: "GET", url: `/users/${requireUserId(userId)}/followers/count` });
    return { count: Number(data?.count ?? data?.followerCount ?? data ?? 0) };
  },
  async followStatus(userId) {
    const data = await requestData({ method: "GET", url: `/users/${requireUserId(userId)}/follow-status` });
    return Boolean(data?.following);
  },
  rateParticipant(ajoId, participantId, score, comment = "") {
    return requestData({ method: "POST", url: `/users/${ajoId}/participants/${participantId}/rating`, data: { score, comment } });
  },
};
