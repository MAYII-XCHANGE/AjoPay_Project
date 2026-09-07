import axios from "axios";
import { ApiError, toApiError } from "./api-error";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./token-store";

const baseURL =  "https://local.clarre.com.ng";

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let refreshPromise = null;
let sessionExpiredHandler = null;
let accessDeniedHandler = null;

export function onSessionExpired(handler) {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
}

export function onAccessDenied(handler) {
  accessDeniedHandler = handler;
  return () => {
    if (accessDeniedHandler === handler) accessDeniedHandler = null;
  };
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function requestSessionRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError({
      code: "SESSION_EXPIRED",
      message: "Your session has expired. Please sign in again.",
      status: 401,
    });
  }
  const response = await refreshClient.post("/auth/refresh", { refreshToken });
  const payload = response.data;
  if (payload?.success === false || !payload?.data?.accessToken) {
    throw new ApiError({
      code: payload?.code || "SESSION_EXPIRED",
      message: payload?.message || "Your session has expired. Please sign in again.",
      status: 401,
      data: payload?.data,
    });
  }
  setTokens(payload.data);
  return payload.data;
}

export function refreshSession() {
  refreshPromise ||= requestSessionRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isRefreshRequest = original?.url?.includes("/auth/refresh");
    const canRefresh = Boolean(getRefreshToken());
    if (error.response?.status === 403) accessDeniedHandler?.(error.response.data);
    if (error.response?.status === 401 && original && !original._retried && !isRefreshRequest && canRefresh) {
      original._retried = true;
      try {
        const session = await refreshSession();
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        clearTokens();
        sessionExpiredHandler?.();
        return Promise.reject(toApiError(refreshError));
      }
    }
    return Promise.reject(toApiError(error));
  },
);

export async function requestData(config) {
  const response = await apiClient.request(config);
  const payload = response.data;
  if (payload?.success === false) {
    throw new ApiError({
      code: payload.code,
      message: payload.message,
      status: response.status,
      data: payload.data,
      fieldErrors: payload.fieldErrors,
    });
  }
  return payload?.success === true ? payload.data : payload;
}
