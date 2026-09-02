import { describe, expect, it } from "vitest";
import { isValidPayoutOrder, validateAjo } from "./validation";
describe("validateAjo", () => {
  it("rejects incomplete or financially invalid values", () => {
    const errors = validateAjo(
      {
        name: "",
        contributionAmount: 0,
        slotCount: 1,
        startDate: "2025-01-01",
      },
      new Date("2026-09-02"),
    );
    expect(Object.keys(errors)).toEqual([
      "name",
      "contributionAmount",
      "slotCount",
      "startDate",
    ]);
  });
  it("accepts valid circle settings", () => {
    expect(
      validateAjo(
        {
          name: "Business Circle",
          contributionAmount: 50000,
          slotCount: 8,
          startDate: "2026-10-01",
        },
        new Date("2026-09-02"),
      ),
    ).toEqual({});
  });
});
describe("isValidPayoutOrder", () => {
  it("requires every accepted slot exactly once", () => {
    expect(isValidPayoutOrder(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
    expect(isValidPayoutOrder(["a", "a", "c"], ["a", "b", "c"])).toBe(false);
    expect(isValidPayoutOrder(["a", "b"], ["a", "b", "c"])).toBe(false);
  });
});
