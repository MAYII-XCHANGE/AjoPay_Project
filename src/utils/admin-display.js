export function getInitials(name = "") {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "AP";
}
