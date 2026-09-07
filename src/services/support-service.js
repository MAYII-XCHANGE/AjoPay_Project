import { requestData } from "../api/client";

const asArray = (value) => Array.isArray(value) ? value : value?.items || [];

export const supportService = {
  async listMine() {
    return asArray(await requestData({ method: "GET", url: "/support/issues" }));
  },
  create(values) {
    return requestData({ method: "POST", url: "/support/issues", data: values });
  },
  async listAll() {
    return asArray(await requestData({ method: "GET", url: "/support/issues/admin" }));
  },
  update(id, values) {
    return requestData({ method: "PATCH", url: `/support/issues/admin/${id}`, data: values });
  },
};
