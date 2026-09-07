import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

describe("token store", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("sessionStorage", createStorage());
  });

  afterEach(() => vi.unstubAllGlobals());

  it("restores only the refresh token after a module reload", async () => {
    const firstStore = await import("./token-store");
    firstStore.setTokens({ accessToken: "access-one", refreshToken: "refresh-one" });

    vi.resetModules();
    const restoredStore = await import("./token-store");

    expect(restoredStore.getAccessToken()).toBeNull();
    expect(restoredStore.getRefreshToken()).toBe("refresh-one");
  });

  it("removes the saved refresh token when the session is cleared", async () => {
    const tokenStore = await import("./token-store");
    tokenStore.setTokens({ accessToken: "access-one", refreshToken: "refresh-one" });
    tokenStore.clearTokens();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
