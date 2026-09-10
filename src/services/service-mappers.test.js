import { describe, expect, it } from "vitest";
import { mapAjo, mapAjoSlot, mapJoinRequest, mergeAjoSummaryWithDetail, normalizePreferredPositions, toJoinRequestAction } from "./ajo-service";
import { mapBankAccount } from "./wallet-service";
import { mapContribution } from "./contribution-service";
import { mapAdminDashboard, mapAdminSettings, mapAdminUser } from "./admin-service";

describe("API response mappers", () => {
  it("normalizes Ajo creator and viewer details", () => {
    const ajo = mapAjo({ id: "a1", creator: { id: "u1", name: "Ada User" }, contributionAmount: 5000, totalSlots: 5, memberCount: 2, viewer: { isMember: true } });
    expect(ajo).toMatchObject({ creatorId: "u1", creator: "Ada User", slotCount: 5, filledSlots: 2, joined: true });
  });

  it("normalizes alternate creator user ID fields", () => {
    expect(mapAjo({ creatorUserId: "u2" }).creatorId).toBe("u2");
    expect(mapAjo({ createdById: "u3" }).creatorId).toBe("u3");
    expect(mapAjo({ creator: { userId: "u4" } }).creatorId).toBe("u4");
  });

  it("keeps Ajo ownership separate from participant membership", () => {
    const ajo = mapAjo({
      id: "a2",
      creator: { id: "u1", name: "Ada User" },
      slotCount: 10,
      availableSlots: 10,
      viewer: { isCreator: true, isMember: false },
    });

    expect(ajo).toMatchObject({
      canManage: true,
      joined: false,
      filledSlots: 0,
      availableSlots: 10,
    });
  });

  it("normalizes flat API slot records for payout ordering", () => {
    expect(mapAjoSlot({
      id: "slot-5",
      slotNumber: 5,
      payoutPosition: 2,
      participantName: "Oyeniran Mayowa",
    })).toMatchObject({
      id: "slot-5",
      slotId: "slot-5",
      slotNumber: 5,
      payoutPosition: 2,
      participant: { name: "Oyeniran Mayowa" },
    });

    expect(mapAjo({
      slotCount: 2,
      slots: [
        { id: "slot-1", slotNumber: 1, participantName: "Ada" },
        { id: "slot-2", slotNumber: 2, participantName: "Bola" },
      ],
    })).toMatchObject({ filledSlots: 2, availableSlots: 0 });
  });

  it("preserves the summary creator ID when group detail omits it", () => {
    const summary = mapAjo({
      id: "a3",
      creatorId: "u1",
      creatorName: "Ada User",
    });
    const detail = mapAjo({
      id: "a3",
      viewer: { isCreator: true, isMember: true },
    });

    expect(mergeAjoSummaryWithDetail(summary, detail)).toMatchObject({
      creatorId: "u1",
      creator: "Ada User",
      joined: true,
    });
  });

  it("normalizes join request fields", () => {
    expect(mapJoinRequest({ requestId: "r1", requestedSlots: 2, preferredPayoutPositions: [3], requester: { id: "u2", firstName: "Bola", lastName: "Ade" } })).toMatchObject({ id: "r1", slots: 2, preferredPositions: [3], status: "PENDING", user: { name: "Bola Ade" } });
  });

  it("normalizes non-array preferred payout positions", () => {
    expect(normalizePreferredPositions(2)).toEqual([2]);
    expect(normalizePreferredPositions("1, 3")).toEqual([1, 3]);
    expect(normalizePreferredPositions("[2,4]")).toEqual([2, 4]);
    expect(normalizePreferredPositions("ANY")).toEqual([]);
    expect(normalizePreferredPositions({ items: [{ position: 5 }] })).toEqual([5]);
  });

  it("maps request statuses to the API action paths", () => {
    expect(toJoinRequestAction("ACCEPTED")).toBe("accept");
    expect(toJoinRequestAction("DECLINED")).toBe("decline");
    expect(() => toJoinRequestAction("PENDING")).toThrow("Unsupported join-request decision");
  });

  it("treats a bank account without verification status as unverified", () => {
    expect(mapBankAccount({ id: "b1", primaryAccount: true })).toMatchObject({ id: "b1", isDefault: true, verified: false });
  });

  it("normalizes contribution balances and its payment deadline", () => {
    expect(mapContribution({
      id: "c1",
      requiredAmount: "100000",
      paidAmount: "40000",
      remainingAmount: "60000",
      dueAt: "2026-10-01T10:00:00",
    })).toMatchObject({
      amount: 100000,
      requiredAmount: 100000,
      paidAmount: 40000,
      remainingAmount: 60000,
      paymentDeadline: "2026-10-01T10:00:00",
    });
  });

  it("normalizes alternate admin dashboard count and balance fields", () => {
    expect(mapAdminDashboard({
      users: 25,
      totalAjoGroups: 7,
      totalAvailableBalance: "150000",
      totalAjoBalance: "80000",
      pendingWithdrawalCount: 3,
    })).toMatchObject({
      totalUsers: 25,
      totalAjos: 7,
      availableBalance: 150000,
      ajoBalance: 80000,
      pendingWithdrawals: 3,
    });
  });

  it("normalizes safe admin user summaries", () => {
    expect(mapAdminUser({
      userId: "u1",
      firstName: "Ada",
      lastName: "Okafor",
      accountStatus: "active",
      createdAt: "2026-09-01T10:00:00",
    })).toMatchObject({
      id: "u1",
      name: "Ada Okafor",
      status: "ACTIVE",
      role: "USER",
      joinedAt: "2026-09-01T10:00:00",
    });
  });

  it("normalizes both map and array settings API responses", () => {
    expect(mapAdminSettings({ "ajo.renewal.enabled": "true" })).toEqual([
      expect.objectContaining({ key: "ajo.renewal.enabled", value: "true", category: "ajo" }),
    ]);
    expect(mapAdminSettings([{ settingKey: "withdrawal.daily-limit", settingValue: 500000 }])).toEqual([
      expect.objectContaining({ key: "withdrawal.daily-limit", value: "500000", category: "withdrawal" }),
    ]);
  });
});
