import type { KpiMetric } from '../../models/Metric';

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const isPositive = metric.change >= 0;

  return (
    <article className="kpi-card">
      <span className="kpi-card__label">{metric.label}</span>
      <p className="kpi-card__value">
        {metric.unit === 'USD' && '$'}
        {metric.value.toLocaleString()}
        {metric.unit === '%' && '%'}
      </p>
      <span className={`kpi-card__change ${isPositive ? 'kpi-card__change--up' : ''}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(metric.change)}%
      </span>
    </article>
  );
}
