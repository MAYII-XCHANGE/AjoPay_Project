import { describe, expect, it } from "vitest";
import { formatCurrency, frequencyLabel, statusLabel } from "./formatters";
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
