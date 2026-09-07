export class ApiError extends Error {
  constructor({ code, message, status, data, fieldErrors }) {
    super(message);
    this.name = "ApiError";
    this.code = code || "REQUEST_FAILED";
    this.status = status || 0;
    this.data = data ?? null;
    this.fieldErrors = fieldErrors || data?.fieldErrors || null;
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;
  const payload = error?.response?.data;
  return new ApiError({
    code: payload?.code || (error?.response ? "REQUEST_FAILED" : "NETWORK_ERROR"),
    message:
      payload?.message ||
      (error?.response
        ? "We couldn’t complete that request. Please try again."
        : "Unable to reach AjoPay. Check your connection and try again."),
    status: error?.response?.status,
    data: payload?.data,
    fieldErrors: payload?.fieldErrors,
  });
}
