import { describe, expect, it } from "vitest";
import { mockApi } from "./mock-service";

const member = {
  id: "workflow-test-user",
  name: "Workflow Test User",
  email: "workflow@example.com",
  phone: "+234 800 000 0000",
  role: "USER",
  rating: 4.7,
  completedCycles: 3,
};

describe("join request workflow", () => {
  it("does not add a member until an admin accepts the request", async () => {
    const before = await mockApi.getAjo("market-women", member.id);
    const request = await mockApi.requestToJoin({
      ajoId: "market-women",
      user: member,
      slots: 1,
      preferredPosition: 4,
    });

    const pendingGroup = await mockApi.getAjo("market-women", member.id);
    expect(request.status).toBe("PENDING");
    expect(pendingGroup.joined).toBe(false);
    expect(pendingGroup.filledSlots).toBe(before.filledSlots);

    await expect(
      mockApi.requestToJoin({ ajoId: "market-women", user: member, slots: 1 }),
    ).rejects.toThrow("pending request");

    await mockApi.reviewJoinRequest(request.id, "ACCEPTED");
    const acceptedGroup = await mockApi.getAjo("market-women", member.id);
    const notificationPage = await mockApi.notifications(member.id);

    expect(acceptedGroup.joined).toBe(true);
    expect(acceptedGroup.filledSlots).toBe(before.filledSlots + 1);
    expect(notificationPage.items[0].title).toBe("Join request accepted");
  });

  it("allows the requesting user to cancel a pending request", async () => {
    const request = await mockApi.requestToJoin({
      ajoId: "december-flex",
      user: { ...member, id: "workflow-cancel-user" },
      slots: 1,
    });

    await mockApi.cancelJoinRequest(request.id, "workflow-cancel-user");
    const remaining = await mockApi.getJoinRequests({
      userId: "workflow-cancel-user",
    });

    expect(remaining).toHaveLength(0);
  });

  it("keeps a declined requester out of the group", async () => {
    const before = await mockApi.getAjo("school-fees", "u9");

    await mockApi.reviewJoinRequest("req-2", "DECLINED");
    const after = await mockApi.getAjo("school-fees", "u9");
    const requests = await mockApi.getJoinRequests({ userId: "u9" });

    expect(after.joined).toBe(false);
    expect(after.filledSlots).toBe(before.filledSlots);
    expect(requests[0].status).toBe("DECLINED");
  });
});

describe("bank account verification", () => {
  it("resolves a supported bank account before it can be saved", async () => {
    const resolved = await mockApi.resolveBankAccount({
      bankCode: "058",
      accountNumber: "0123456789",
      user: member,
    });

    expect(resolved.verified).toBe(true);
    expect(resolved.accountName).toBe(member.name);
    expect(resolved.recipientCode).toBeTruthy();
  });
});
