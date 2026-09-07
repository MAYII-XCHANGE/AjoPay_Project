import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrentDate, frequencyLabel, statusLabel } from "./formatters";
describe("formatCurrency", () => {
    it("formats Nigerian naira without fractional digits", () => {
        expect(formatCurrency(125000)).toMatch(/₦125,000/);
    });
});
describe("display mappings", () => {
    it("maps server enums to plain-language labels", () => {
        expect(frequencyLabel.WEEKLY).toBe("Weekly");
        expect(statusLabel.OPEN).toBe("Open to join");
    });
});

describe("formatCurrentDate", () => {
    it("uses the current calendar date in the Lagos timezone", () => {
        const nearMidnightUtc = new Date("2026-09-03T23:30:00.000Z");
        expect(formatCurrentDate("en", nearMidnightUtc)).toBe("FRIDAY, 4 SEPTEMBER");
    });
});
