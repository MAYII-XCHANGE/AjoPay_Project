import { describe, expect, it } from "vitest";
import { mapNotificationResponse } from "./notification-service";

describe("notification response mapping", () => {
  it("normalizes the nested page and unread count", () => {
    expect(mapNotificationResponse({
      page: {
        items: [{ id: "n1", type: "GROUP", body: "A member joined", createdAt: "2026-09-04T10:00:00" }],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
      },
      unreadCount: 3,
    })).toMatchObject({
      items: [{ id: "n1", kind: "group", message: "A member joined", date: "2026-09-04T10:00:00" }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      unreadCount: 3,
    });
  });

  it("supports an empty notification response", () => {
    expect(mapNotificationResponse({
      page: { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false },
      unreadCount: 0,
    })).toMatchObject({ items: [], totalElements: 0, unreadCount: 0 });
  });
});
