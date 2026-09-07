import { requestData } from "../api/client";
import { normalizePage, pageParams } from "../api/pagination";

const asArray = (value) => Array.isArray(value) ? value : value?.items || [];

export const supportService = {
  async listMine() {
    return asArray(await requestData({ method: "GET", url: "/support/issues" }));
  },
  create(values) {
    return requestData({ method: "POST", url: "/support/issues", data: values });
  },
  async listAll(filters = {}) {
    return normalizePage(await requestData({ method: "GET", url: "/support/issues/admin", params: pageParams(filters) }), filters);
  },
  update(id, values) {
    return requestData({ method: "PATCH", url: `/support/issues/admin/${id}`, data: values });
  },
};
