export function settingTitle(key = "") {
  return String(key)
    .split(".")
    .slice(1)
    .join(" ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase()) || "Platform setting";
}

export function settingCategoryLabel(category = "other") {
  return String(category).replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function settingInputType(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "false"].includes(normalized)) return "boolean";
  if (normalized !== "" && Number.isFinite(Number(normalized))) return "number";
  if ((normalized.startsWith("{") && normalized.endsWith("}")) || (normalized.startsWith("[") && normalized.endsWith("]"))) return "json";
  return "text";
}

export function validateAdminSetting({ key, value }) {
  const errors = {};
  const normalizedKey = String(key || "").trim();
  if (!normalizedKey) errors.key = "Enter a setting key.";
  else if (!/^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$/.test(normalizedKey)) {
    errors.key = "Use a namespaced key such as ajo.renewal.enabled.";
  }
  if (String(value ?? "").trim() === "") errors.value = "Enter a setting value.";
  return errors;
}
