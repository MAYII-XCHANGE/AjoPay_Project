const searchableValue = (value) => String(value ?? "").toLowerCase();
const joinableStatuses = new Set(["OPEN", "FILLING"]);
const preStartStatuses = new Set(["OPEN", "FILLING", "READY"]);

export function isAjoFull(ajo) {
  const totalSlots = Number(ajo?.slotCount ?? 0);
  return totalSlots > 0 && getAvailableAjoSlots(ajo) === 0;
}

export function isAjoPreStart(ajo) {
  return preStartStatuses.has(String(ajo?.status ?? "").toUpperCase());
}

export function isAjoReadyToStart(ajo) {
  return isAjoPreStart(ajo) && isAjoFull(ajo);
}

export function isAjoJoinable(ajo) {
  return joinableStatuses.has(String(ajo?.status ?? "").toUpperCase())
    && !isAjoFull(ajo);
}

export function getAvailableAjoSlots(ajo) {
  const total = Number(ajo?.slotCount ?? 0);
  const filled = Number(ajo?.filledSlots ?? 0);
  return Math.max(Number(ajo?.availableSlots ?? total - filled), 0);
}

export function filterDiscoverableAjos(ajos = [], filters = {}) {
  const search = searchableValue(filters.search).trim();
  const frequency = filters.frequency || "ALL";
  const category = filters.category || "ALL";
  const amount = filters.amount || "ALL";

  return ajos.filter((ajo) => {
    const contributionAmount = Number(ajo.contributionAmount ?? 0);
    const matchesSearch = !search || [
      ajo.name,
      ajo.description,
      ajo.category,
      ajo.creator,
      ajo.creatorName,
    ].some((value) => searchableValue(value).includes(search));
    const matchesFrequency = frequency === "ALL" || ajo.frequency === frequency;
    const matchesCategory = category === "ALL" || ajo.category === category;
    const matchesAmount = amount === "ALL"
      || (amount === "UNDER_50" && contributionAmount < 50_000)
      || (amount === "50_TO_100" && contributionAmount >= 50_000 && contributionAmount <= 100_000)
      || (amount === "OVER_100" && contributionAmount > 100_000);

    return isAjoJoinable(ajo)
      && matchesSearch
      && matchesFrequency
      && matchesCategory
      && matchesAmount;
  });
}
