import { describe, expect, it } from "vitest";
import {
  getContributionOutstanding,
  getRemainingPaymentTime,
  isContributionFullyPaid,
  isContributionPaymentExpired,
  validateContributionPayment,
} from "./contribution-payment";

const contribution = {
  requiredAmount: 100_000,
  paidAmount: 40_000,
  remainingAmount: 60_000,
  paymentDeadline: "2026-10-01T10:00:00Z",
  status: "PARTIAL",
};

describe("partial contribution payments", () => {
  const activeNow = new Date("2026-09-30T10:00:00Z");

  it("uses the backend outstanding amount", () => {
    expect(getContributionOutstanding(contribution)).toBe(60_000);
  });

  it("accepts any positive amount up to the outstanding balance", () => {
    expect(validateContributionPayment("10000", contribution, activeNow)).toBe("");
    expect(validateContributionPayment("60000", contribution, activeNow)).toBe("");
  });

  it("rejects missing, non-positive, and excessive amounts", () => {
    expect(validateContributionPayment("", contribution, activeNow)).toBe("Please enter an amount.");
    expect(validateContributionPayment("0", contribution, activeNow)).toBe("Amount must be greater than ₦0.");
    expect(validateContributionPayment("65000", contribution, activeNow)).toBe("Amount cannot exceed your outstanding balance.");
  });

  it("prevents payment after the backend deadline", () => {
    const expiredNow = new Date("2026-10-01T10:00:01Z");
    expect(isContributionPaymentExpired(contribution, expiredNow)).toBe(true);
    expect(validateContributionPayment("1000", contribution, expiredNow)).toBe("The payment period for this contribution has expired.");
  });

  it("recognizes a fully paid contribution", () => {
    const paid = { ...contribution, paidAmount: 100_000, remainingAmount: 0, status: "COMPLETED" };
    expect(isContributionFullyPaid(paid)).toBe(true);
    expect(validateContributionPayment("1000", paid, activeNow)).toBe("This contribution has already been fully paid.");
  });

  it("returns a readable remaining payment period", () => {
    expect(getRemainingPaymentTime(contribution, activeNow)).toBe("1 day remaining");
  });
});
