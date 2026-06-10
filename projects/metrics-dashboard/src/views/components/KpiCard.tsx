import { TrendingDown, TrendingUp } from 'lucide-react';
import type { KpiMetric } from '../../models/Metric';

function formatValue(metric: KpiMetric): string {
  if (metric.format === 'currency') {
    return `$${metric.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (metric.format === 'percent') return `${metric.value}%`;
  return metric.value.toLocaleString();
}

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const isPositive = (metric.change ?? 0) >= 0;

  return (
    <article className="kpi-card">
      <span className="kpi-card__label">{metric.label}</span>
      <p className="kpi-card__value">{formatValue(metric)}</p>
      {metric.change !== null ? (
        <span className={`kpi-card__change ${isPositive ? 'kpi-card__change--up' : 'kpi-card__change--down'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(metric.change)}% vs mes anterior
        </span>
      ) : (
        <span className="kpi-card__change kpi-card__change--neutral">Sin comparativa</span>
      )}
    </article>
  );
}
