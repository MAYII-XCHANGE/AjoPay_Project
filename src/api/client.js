import axios from "axios";
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15_000,
  withCredentials: true,
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      return Promise.reject({
        code: payload?.code ?? "NETWORK_ERROR",
        message:
          payload?.message ??
          "We couldn’t complete that request. Please try again.",
        fieldErrors: payload?.fieldErrors,
      });
    }
    return Promise.reject({
      code: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again.",
    });
  },
);
