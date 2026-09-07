import { describe, expect, it } from "vitest";
import { toApiLocalDateTime, toApiLocalTime, validateCreateAjo } from "./ajo-validation";

describe("validateCreateAjo", () => {
  it("accepts complete values with the required first-payout schedule", () => {
    expect(validateCreateAjo({ name: "Weekly Circle", amount: "5000", frequency: "WEEKLY", slots: "5", firstPayoutAt: "2099-09-10T10:00", lateWindowStart: "09:00", lateWindowEnd: "18:00", lateFeeAmount: "100", creatorCommissionPercent: "2" })).toEqual({});
  });

  it("rejects invalid financial values", () => {
    const errors = validateCreateAjo({ name: "", amount: "99", frequency: "YEARLY", slots: "101", firstPayoutAt: "", lateWindowStart: "", lateWindowEnd: "", lateFeeAmount: "-1", creatorCommissionPercent: "101" });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(["name", "amount", "frequency", "slots", "firstPayoutAt", "lateFeeAmount", "creatorCommissionPercent"]));
  });

  it("formats the browser date-time value for the API contract", () => {
    expect(toApiLocalDateTime("2026-09-10T10:00")).toBe("2026-09-10T10:00:00");
  });

  it("formats optional local times for the API contract", () => {
    expect(toApiLocalTime("09:00")).toBe("09:00:00");
    expect(toApiLocalTime("")).toBeNull();
  });
});
