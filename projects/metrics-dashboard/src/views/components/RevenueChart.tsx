import type { MonthlyRevenuePoint } from '../../models/Metric';

interface RevenueChartProps {
  data: MonthlyRevenuePoint[];
  maxRevenue: number;
}

export function RevenueChart({ data, maxRevenue }: RevenueChartProps) {
  return (
    <div className="chart">
      <div className="chart__bars">
        {data.map((point) => (
          <div key={point.key} className="chart__group">
            <span className="chart__value">
              ${point.revenue >= 1000 ? `${Math.round(point.revenue / 100) / 10}k` : point.revenue}
            </span>
            <div className="chart__track">
              <div
                className="chart__bar"
                style={{ height: `${Math.max(3, (point.revenue / maxRevenue) * 100)}%` }}
                title={`${point.month}: $${point.revenue.toLocaleString()} · ${point.orders} pedidos`}
              />
            </div>
            <span className="chart__label">{point.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
