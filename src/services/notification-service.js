import { requestData } from "../api/client";
import { normalizePage, pageParams } from "../api/pagination";

const mapNotification = (item) => ({
  ...item,
  message: item.message || item.body,
  date: item.date || item.createdAt,
  kind: String(item.kind || item.type || "system").toLowerCase(),
});

export function mapNotificationResponse(data, filters = {}) {
  const page = normalizePage(data, filters);
  return {
    ...page,
    items: page.items.map(mapNotification),
    unreadCount: Number(data?.unreadCount ?? 0),
  };
}

export const notificationService = {
  async list(filters = {}) {
    const data = await requestData({ method: "GET", url: "/notifications", params: pageParams(filters) });
    return mapNotificationResponse(data, filters);
  },
  markRead(id) {
    return requestData({ method: "POST", url: `/notifications/${id}/read` });
  },
  getPreferences() {
    return requestData({ method: "GET", url: "/notifications/preferences" });
  },
  updatePreferences(groupNotificationsEnabled) {
    return requestData({ method: "PATCH", url: "/notifications/preferences", data: { groupNotificationsEnabled } });
  },
};
