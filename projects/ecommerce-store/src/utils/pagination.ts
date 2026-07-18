export const PAGE_SIZE = 10;

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;

  return {
    items: items.slice(start, start + size),
    page: safePage,
    totalPages,
    total,
    size,
  };
}
