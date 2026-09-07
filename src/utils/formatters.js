const localeMap = { en: "en-NG", yo: "yo-NG", ha: "ha-NG", ig: "ig-NG" };
const resolveLocale = (language = "en") => localeMap[language?.split("-")[0]] || "en-NG";

export const formatCurrentDate = (language = "en", value = new Date()) => new Intl.DateTimeFormat(resolveLocale(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Lagos",
}).format(value).toLocaleUpperCase(resolveLocale(language));

export const formatCurrency = (value, compact = false, language = "en") => new Intl.NumberFormat(resolveLocale(language), {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
}).format(Number(value) || 0);
export const formatDate = (value, language = "en") => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat(resolveLocale(language), {
    day: "numeric",
    month: "short",
    year: "numeric",
    }).format(date);
};
export const frequencyLabel = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
};
export const statusLabel = {
    OPEN: "Open to join",
    FILLING: "Filling slots",
    READY: "Ready to start",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CLOSED: "Closed",
};
