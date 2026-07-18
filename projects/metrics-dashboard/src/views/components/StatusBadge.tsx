import type { OrderStatus } from '../../models/Order';
import { ORDER_STATUS_LABELS } from '../../models/Order';

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{ORDER_STATUS_LABELS[status]}</span>;
}
