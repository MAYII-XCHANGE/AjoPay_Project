import { requestData } from "../api/client";
import { normalizePage, pageParams } from "../api/pagination";
import { mapWithdrawal } from "./wallet-service";

const pagedRequest = async (url, filters) => normalizePage(await requestData({ method: "GET", url, params: pageParams(filters) }), filters);

export const mapAdminDashboard = (data = {}) => ({
  ...data,
  totalUsers: Number(data.totalUsers ?? data.users ?? data.userCount ?? 0),
  totalAjos: Number(data.totalAjos ?? data.totalAjoGroups ?? data.ajos ?? data.groupCount ?? 0),
  availableBalance: Number(data.totalAvailableBalance ?? data.availableBalance ?? 0),
  ajoBalance: Number(data.totalAjoBalance ?? data.ajoBalance ?? 0),
  pendingWithdrawals: Number(data.pendingWithdrawals ?? data.pendingWithdrawalCount ?? 0),
  processingWithdrawals: Number(data.processingWithdrawals ?? data.processingWithdrawalCount ?? 0),
});

export const mapAdminUser = (user = {}) => ({
  ...user,
  id: user.id || user.userId,
  name: user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "AjoPay user",
  status: String(user.status || user.accountStatus || "UNKNOWN").toUpperCase(),
  role: String(user.role || "USER").toUpperCase(),
  joinedAt: user.joinedAt || user.createdAt,
});

export const mapAdminSetting = (setting, fallbackKey) => {
  const isObject = typeof setting === "object" && setting !== null;
  const key = String((isObject ? setting.key ?? setting.settingKey : fallbackKey) || "");
  return {
    ...(isObject ? setting : {}),
    key,
    value: String((isObject ? setting.value ?? setting.settingValue : setting) ?? ""),
    description: isObject ? setting.description || setting.note || "" : "",
    updatedAt: isObject ? setting.updatedAt || setting.modifiedAt : null,
    category: key.split(".")[0] || "other",
  };
};

export function mapAdminSettings(data) {
  const source = data?.settings ?? data;
  if (Array.isArray(source)) return source.map((setting) => mapAdminSetting(setting));
  if (source?.key || source?.settingKey) return [mapAdminSetting(source)];
  if (source && typeof source === "object") {
    return Object.entries(source).map(([key, value]) => mapAdminSetting(value, key));
  }
  return [];
}

export const adminService = {
  async dashboard() {
    return mapAdminDashboard(await requestData({ method: "GET", url: "/admin/dashboard" }));
  },
  async users(filters = {}) {
    const page = await pagedRequest("/admin/users", filters);
    return { ...page, items: page.items.map(mapAdminUser) };
  },
  async user(id) {
    return mapAdminUser(await requestData({ method: "GET", url: `/admin/users/${id}` }));
  },
  updateUserStatus(id, status) {
    return requestData({ method: "PATCH", url: `/admin/users/${id}/status`, params: { status } });
  },
  async withdrawals(filters = {}) {
    const page = await pagedRequest("/admin/withdrawals", filters);
    return { ...page, items: page.items.map(mapWithdrawal) };
  },
  initiateWithdrawal(id) {
    return requestData({ method: "POST", url: `/admin/withdrawals/${id}/initiate` });
  },
  confirmWithdrawal(id, values) {
    return requestData({ method: "POST", url: `/admin/withdrawals/${id}/confirm`, params: values });
  },
  declineWithdrawal(id, reason) {
    return requestData({ method: "POST", url: `/admin/withdrawals/${id}/decline`, params: { reason } });
  },
  platformGl(filters = {}) {
    return pagedRequest("/admin/platform-gl", filters);
  },
  async settings() {
    return mapAdminSettings(await requestData({ method: "GET", url: "/admin/settings" }));
  },
  saveSetting(key, value) {
    return requestData({ method: "PUT", url: "/admin/settings", data: { key, value: String(value) } });
  },
  admins(filters = {}) {
    return pagedRequest("/admin/admins", filters);
  },
  createAdmin(values) {
    return requestData({ method: "POST", url: "/admin/admins", data: values });
  },
  revokeAdmin(id) {
    return requestData({ method: "DELETE", url: `/admin/admins/${id}` });
  },
};
