export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
}

export interface ChartDataPoint {
  month: string;
  sales: number;
  expenses: number;
}

export type PeriodFilter = '3m' | '6m' | '12m';
