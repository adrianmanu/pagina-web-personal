import type { ChartDataPoint, KpiMetric, PeriodFilter } from '../models/Metric';

const ALL_CHART_DATA: ChartDataPoint[] = [
  { month: 'Ene', sales: 42000, expenses: 28000 },
  { month: 'Feb', sales: 38500, expenses: 26500 },
  { month: 'Mar', sales: 51200, expenses: 31000 },
  { month: 'Abr', sales: 47800, expenses: 29500 },
  { month: 'May', sales: 55300, expenses: 32000 },
  { month: 'Jun', sales: 60100, expenses: 33500 },
  { month: 'Jul', sales: 58900, expenses: 32800 },
  { month: 'Ago', sales: 62400, expenses: 34200 },
  { month: 'Sep', sales: 59800, expenses: 33100 },
  { month: 'Oct', sales: 67200, expenses: 35800 },
  { month: 'Nov', sales: 71500, expenses: 37200 },
  { month: 'Dic', sales: 78000, expenses: 39500 },
];

const KPI_DATA: KpiMetric[] = [
  { id: 'revenue', label: 'Ingresos', value: 78000, unit: 'USD', change: 12.4 },
  { id: 'orders', label: 'Pedidos', value: 1248, unit: '', change: 8.2 },
  { id: 'customers', label: 'Clientes activos', value: 342, unit: '', change: 5.1 },
  { id: 'margin', label: 'Margen neto', value: 49.4, unit: '%', change: 2.3 },
];

export class MetricsService {
  static getKpis(): KpiMetric[] {
    return KPI_DATA;
  }

  static getChartData(period: PeriodFilter): ChartDataPoint[] {
    const monthsMap: Record<PeriodFilter, number> = {
      '3m': 3,
      '6m': 6,
      '12m': 12,
    };
    return ALL_CHART_DATA.slice(-monthsMap[period]);
  }
}
