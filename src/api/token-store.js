const REFRESH_TOKEN_KEY = "ajopay.session.refresh";

let accessToken = null;
let refreshToken = readStoredRefreshToken();

function readStoredRefreshToken() {
  try {
    return globalThis.sessionStorage?.getItem(REFRESH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function storeRefreshToken(token) {
  try {
    if (token) globalThis.sessionStorage?.setItem(REFRESH_TOKEN_KEY, token);
    else globalThis.sessionStorage?.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Memory storage remains available when browser storage is restricted.
  }
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  refreshToken ||= readStoredRefreshToken();
  return refreshToken;
}

export function setTokens(tokens = {}) {
  accessToken = tokens.accessToken || null;
  refreshToken = tokens.refreshToken || null;
  storeRefreshToken(refreshToken);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  storeRefreshToken(null);
}

export function hasSessionTokens() {
  return Boolean(accessToken && refreshToken);
}
