import { requestData } from "../api/client";
import { normalizePage, pageParams } from "../api/pagination";
import { mapWithdrawal } from "./wallet-service";

const pagedRequest = async (url, filters) => normalizePage(await requestData({ method: "GET", url, params: pageParams(filters) }), filters);

export const adminService = {
  dashboard() {
    return requestData({ method: "GET", url: "/admin/dashboard" });
  },
  users(filters = {}) {
    return pagedRequest("/admin/users", filters);
  },
  user(id) {
    return requestData({ method: "GET", url: `/admin/users/${id}` });
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
  settings() {
    return requestData({ method: "GET", url: "/admin/settings" });
  },
  saveSetting(key, value) {
    return requestData({ method: "PUT", url: "/admin/settings", data: { key, value: String(value) } });
  },
  admins() {
    return requestData({ method: "GET", url: "/admin/admins" });
  },
  createAdmin(values) {
    return requestData({ method: "POST", url: "/admin/admins", data: values });
  },
  revokeAdmin(id) {
    return requestData({ method: "DELETE", url: `/admin/admins/${id}` });
  },
};
