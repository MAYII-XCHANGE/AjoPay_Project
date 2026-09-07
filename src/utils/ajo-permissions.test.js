import { describe, expect, it } from "vitest";
import { isAjoCreator } from "./ajo-permissions";

describe("Ajo permissions", () => {
  it("matches ownership using creatorId", () => {
    expect(isAjoCreator({ creatorId: "u1" }, { id: "u1" })).toBe(true);
    expect(isAjoCreator({ creatorId: "u2" }, { id: "u1" })).toBe(false);
  });

  it("uses the authenticated viewer permission when detail omits creatorId", () => {
    expect(isAjoCreator({ canManage: true }, { id: "u1" })).toBe(true);
  });
});
