import toast from "react-hot-toast";

function messageFrom(error, fallback) {
  if (typeof error === "string") return error;
  return error?.message || fallback;
}

export function notifySuccess(message, options) {
  return toast.success(message, options);
}

export function notifyError(error, fallback = "Something went wrong. Please try again.", options) {
  return toast.error(messageFrom(error, fallback), options);
}
