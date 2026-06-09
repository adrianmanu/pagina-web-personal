import { useMemo, useState } from 'react';
import type { PeriodFilter } from '../models/Metric';
import { MetricsService } from '../services/metricsService';

export function useMetricsController() {
  const [period, setPeriod] = useState<PeriodFilter>('6m');

  const kpis = useMemo(() => MetricsService.getKpis(), []);
  const chartData = useMemo(() => MetricsService.getChartData(period), [period]);

  const maxValue = useMemo(
    () => Math.max(...chartData.flatMap((d) => [d.sales, d.expenses])),
    [chartData],
  );

  return { kpis, chartData, period, setPeriod, maxValue };
}
