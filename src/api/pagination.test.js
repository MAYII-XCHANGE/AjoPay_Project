import { describe, expect, it } from "vitest";
import { normalizePage, pageParams } from "./pagination";

describe("pagination helpers", () => {
  it("normalizes API pages", () => {
    expect(normalizePage({ items: [{ id: 1 }], page: 2, size: 10, totalElements: 21, totalPages: 3, hasNext: false })).toEqual({
      items: [{ id: 1 }], page: 2, size: 10, totalElements: 21, totalPages: 3, hasNext: false,
    });
  });

  it("omits empty filters", () => {
    expect(pageParams({ page: 0, size: 20, status: "", type: "FUNDING" })).toEqual({ page: 0, size: 20, type: "FUNDING" });
  });
});
