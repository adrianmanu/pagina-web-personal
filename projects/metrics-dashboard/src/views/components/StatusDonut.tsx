import type { StatusSlice } from '../../models/Metric';
import type { OrderStatus } from '../../models/Order';
import { ORDER_STATUS_LABELS } from '../../models/Order';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: '#f59e0b',
  pagado: '#38bdf8',
  enviado: '#a78bfa',
  entregado: '#34d399',
  cancelado: '#f87171',
};

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonut({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  if (!total) return <p className="muted">Sin pedidos registrados.</p>;

  let accumulated = 0;

  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" className="donut__svg" role="img" aria-label="Pedidos por estado">
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {data.map((slice) => {
          const fraction = slice.count / total;
          const dash = fraction * CIRCUMFERENCE;
          const offset = accumulated * CIRCUMFERENCE;
          accumulated += fraction;
          return (
            <circle
              key={slice.status}
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={STATUS_COLORS[slice.status]}
              strokeWidth="16"
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
        })}
        <text x="70" y="66" textAnchor="middle" className="donut__total">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" className="donut__caption">
          pedidos
        </text>
      </svg>
      <ul className="donut__legend">
        {data.map((slice) => (
          <li key={slice.status}>
            <i style={{ background: STATUS_COLORS[slice.status] }} />
            {ORDER_STATUS_LABELS[slice.status]}
            <strong>{slice.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
