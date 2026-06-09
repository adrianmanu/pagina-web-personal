import type { ChartDataPoint } from '../../models/Metric';

interface SalesChartProps {
  data: ChartDataPoint[];
  maxValue: number;
}

export function SalesChart({ data, maxValue }: SalesChartProps) {
  return (
    <div className="chart">
      <div className="chart__legend">
        <span><i className="chart__dot chart__dot--sales" /> Ventas</span>
        <span><i className="chart__dot chart__dot--expenses" /> Gastos</span>
      </div>
      <div className="chart__bars">
        {data.map((point) => (
          <div key={point.month} className="chart__group">
            <div className="chart__bar-pair">
              <div
                className="chart__bar chart__bar--sales"
                style={{ height: `${(point.sales / maxValue) * 100}%` }}
                title={`Ventas: $${point.sales.toLocaleString()}`}
              />
              <div
                className="chart__bar chart__bar--expenses"
                style={{ height: `${(point.expenses / maxValue) * 100}%` }}
                title={`Gastos: $${point.expenses.toLocaleString()}`}
              />
            </div>
            <span className="chart__label">{point.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
