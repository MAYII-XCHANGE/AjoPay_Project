import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerClassName="ajopay-toaster"
      toastOptions={{
        duration: 4_000,
        className: "ajopay-toast",
        success: {
          className: "ajopay-toast ajopay-toast--success",
          iconTheme: { primary: "#257158", secondary: "#ffffff" },
        },
        error: {
          duration: 5_000,
          className: "ajopay-toast ajopay-toast--error",
          iconTheme: { primary: "#b44343", secondary: "#ffffff" },
        },
      }}
    />
  );
}
