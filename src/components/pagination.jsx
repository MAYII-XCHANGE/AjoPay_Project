import { Button } from "./ui";

export function Pagination({ page, totalPages, hasNext, onChange, busy = false }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav className="form-actions" aria-label="Pagination">
      <Button type="button" variant="secondary" disabled={busy || page <= 0} onClick={() => onChange(page - 1)}>Previous</Button>
      <span>Page {page + 1} of {totalPages}</span>
      <Button type="button" variant="secondary" disabled={busy || !hasNext} onClick={() => onChange(page + 1)}>Next</Button>
    </nav>
  );
}
