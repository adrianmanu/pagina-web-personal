export function sriBadgeClass(status?: string | null) {
  if (!status) return 'badge';
  const normalized = status.toUpperCase();
  if (normalized === 'AUTORIZADO') return 'badge badge--success';
  if (normalized === 'ERROR' || normalized === 'NO AUTORIZADO') return 'badge badge--danger';
  if (normalized === 'DISABLED') return 'badge';
  return 'badge badge--warning';
}

export function SriStatusBadge({ status }: { status?: string | null }) {
  return <span className={sriBadgeClass(status)}>{status ?? '—'}</span>;
}
