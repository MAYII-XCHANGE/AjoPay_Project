import { describe, expect, it } from "vitest";
import { reorderBySlotId } from "./ajo-order";

const members = ["a", "b", "c"].map((slotId) => ({ slotId }));

describe("payout ordering", () => {
  it("moves a slot to a later payout position", () => {
    expect(reorderBySlotId(members, "a", "c").map(({ slotId }) => slotId)).toEqual(["b", "c", "a"]);
  });

  it("moves a slot to an earlier payout position", () => {
    expect(reorderBySlotId(members, "c", "a").map(({ slotId }) => slotId)).toEqual(["c", "a", "b"]);
  });
});
