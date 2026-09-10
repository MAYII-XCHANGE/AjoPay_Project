import { AjoStatus } from "../enums/statuses";

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
export const formatDateTime = (value, language = "en") => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat(resolveLocale(language), {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
    }).format(date);
};
export const frequencyLabel = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
};
export const statusLabel = {
    [AjoStatus.OPEN]: "Open to join",
    [AjoStatus.FILLING]: "Filling slots",
    [AjoStatus.READY]: "Ready to start",
    [AjoStatus.ACTIVE]: "Active",
    [AjoStatus.CYCLE_COMPLETED]: "Completed",
    [AjoStatus.CLOSED]: "Closed",
};
