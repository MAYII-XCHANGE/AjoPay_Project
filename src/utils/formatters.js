export const formatCurrency = (value, compact = false) => new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
}).format(value);
export const formatDate = (value) => new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
}).format(new Date(value));
export const frequencyLabel = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
};
export const statusLabel = {
    OPEN: "Open to join",
    READY: "Ready to start",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CLOSED: "Closed",
};
