import { describe, expect, it } from "vitest";
import { filterDiscoverableAjos, getAvailableAjoSlots, isAjoFull, isAjoReadyToStart } from "./ajo-filters";

const groups = [
  { id: "1", name: "Car Fund", creator: "Ada", status: "OPEN", frequency: "MONTHLY", category: "Savings", contributionAmount: 25_000, slotCount: 10, availableSlots: 4 },
  { id: "2", name: "Shop Fund", creator: "Bola", status: "ACTIVE", frequency: "WEEKLY", category: "Business", contributionAmount: 75_000, slotCount: 5, availableSlots: 2 },
  { id: "3", name: "School Fund", creator: "Chidi", status: "OPEN", frequency: "WEEKLY", category: "Education", contributionAmount: 120_000, slotCount: 4, availableSlots: 0 },
  { id: "4", name: "Rent Fund", creator: "Dayo", status: "OPEN", frequency: "WEEKLY", category: "Home", contributionAmount: 75_000, slotCount: 6, availableSlots: 2 },
  { id: "5", name: "Family Fund", creator: "Eno", status: "FILLING", frequency: "MONTHLY", category: "Savings", contributionAmount: 10_000, slotCount: 10, availableSlots: 9 },
];

describe("Find Ajo filters", () => {
  it("returns open and filling groups with available slots", () => {
    expect(filterDiscoverableAjos(groups).map((ajo) => ajo.id)).toEqual(["1", "4", "5"]);
  });

  it("combines search, frequency, category, and amount filters", () => {
    expect(filterDiscoverableAjos(groups, {
      search: "rent",
      frequency: "WEEKLY",
      category: "Home",
      amount: "50_TO_100",
    }).map((ajo) => ajo.id)).toEqual(["4"]);
  });

  it("derives availability when the API omits availableSlots", () => {
    expect(getAvailableAjoSlots({ slotCount: 8, filledSlots: 3 })).toBe(5);
  });

  it("recognizes a filled pre-start group as ready", () => {
    const ajo = { status: "FILLING", slotCount: 10, availableSlots: 0 };
    expect(isAjoFull(ajo)).toBe(true);
    expect(isAjoReadyToStart(ajo)).toBe(true);
  });
});
