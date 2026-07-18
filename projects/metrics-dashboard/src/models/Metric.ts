import type { Order, OrderStatus } from './Order';

export type MetricFormat = 'currency' | 'number' | 'percent';

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  format: MetricFormat;
  /** Variación % respecto al mes anterior; null si no hay base de comparación. */
  change: number | null;
}

export interface MonthlyRevenuePoint {
  key: string;
  month: string;
  revenue: number;
  orders: number;
}

export interface StatusSlice {
  status: OrderStatus;
  count: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  company: string;
  orderCount: number;
  totalSpent: number;
}

export type PeriodFilter = '3m' | '6m' | '12m';

export interface DashboardData {
  kpis: KpiMetric[];
  revenueByMonth: MonthlyRevenuePoint[];
  statusBreakdown: StatusSlice[];
  topCustomers: TopCustomer[];
  recentOrders: Order[];
}
