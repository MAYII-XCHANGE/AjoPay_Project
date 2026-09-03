const localeMap = { en: "en-NG", yo: "yo-NG", ha: "ha-NG", ig: "ig-NG" };
const resolveLocale = (language = "en") => localeMap[language?.split("-")[0]] || "en-NG";

export const formatCurrency = (value, compact = false, language = "en") => new Intl.NumberFormat(resolveLocale(language), {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
}).format(value);
export const formatDate = (value, language = "en") => new Intl.DateTimeFormat(resolveLocale(language), {
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
