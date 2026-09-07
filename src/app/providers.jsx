import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "../contexts/auth-context";
import { AppToaster } from "../components/app-toaster";
import { notifyError, notifySuccess } from "../utils/notifications";

const resolveMessage = (message, data, variables) => (
  typeof message === "function" ? message(data, variables) : message
);

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.errorToast === false) return;
            notifyError(error);
          },
          onSuccess: (data, variables, _context, mutation) => {
            const message = resolveMessage(mutation.meta?.successMessage, data, variables);
            if (message) notifySuccess(message);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => failureCount < 1 && (!error?.status || error.status >= 500),
            refetchOnWindowFocus: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <AppToaster />
    </QueryClientProvider>
  );
}
