interface Props {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  if (total <= 0) return null;

  return (
    <div className="pagination">
      <span className="pagination__info">
        Página {page} de {totalPages} · {total} registros
      </span>
      <div className="pagination__actions">
        <button
          type="button"
          className="btn btn--sm btn--ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn btn--sm btn--ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
