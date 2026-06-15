import type { RevenuePoint } from '../../models/types';
import { formatPrice } from '../ui/ProductImage';

interface Props {
  data: RevenuePoint[];
  periodLabel: string;
}

export function RevenueChart({ data, periodLabel }: Props) {
  const maxRevenue = Math.max(...data.map((p) => p.revenue), 1);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <h2>Ingresos — {periodLabel}</h2>
        <span className="muted">
          Total: {formatPrice(data.reduce((s, p) => s + p.revenue, 0))}
        </span>
      </div>
      <div className="chart">
        <div className="chart__bars">
          {data.map((point) => (
            <div key={point.key} className="chart__group">
              <span className="chart__value">
                {point.revenue >= 1000
                  ? `$${(point.revenue / 1000).toFixed(1)}k`
                  : point.revenue > 0
                    ? `$${Math.round(point.revenue)}`
                    : '—'}
              </span>
              <div className="chart__track">
                <div
                  className="chart__bar"
                  style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 100)}%` }}
                  title={`${point.label}: ${formatPrice(point.revenue)} · ${point.orders} pedidos`}
                />
              </div>
              <span className="chart__label">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
