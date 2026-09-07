export function normalizePage(value, defaults = {}) {
  const page =
    value?.page && Array.isArray(value.page.items) ? value.page : value;
  return {
    items: Array.isArray(page?.items)
      ? page.items
      : Array.isArray(page)
        ? page
        : [],
    page: Number(page?.page ?? defaults.page ?? 0),
    size: Number(page?.size ?? defaults.size ?? 20),
    totalElements: Number(page?.totalElements ?? page?.total ?? 0),
    totalPages: Number(page?.totalPages ?? 0),
    hasNext: Boolean(page?.hasNext),
  };
}

export function pageParams({ page = 0, size = 20, ...filters } = {}) {
  return Object.fromEntries(
    Object.entries({ page, size, ...filters }).filter(
      ([, value]) => value !== "" && value != null,
    ),
  );
}
