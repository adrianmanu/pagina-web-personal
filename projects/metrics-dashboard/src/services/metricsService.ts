import type {
  DashboardData,
  KpiMetric,
  MonthlyRevenuePoint,
  PeriodFilter,
  StatusSlice,
  TopCustomer,
} from '../models/Metric';
import type { Order } from '../models/Order';
import { ORDER_STATUSES } from '../models/Order';
import { customerService } from './customerService';
import { orderService } from './orderService';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const PERIOD_MONTHS: Record<PeriodFilter, number> = { '3m': 3, '6m': 6, '12m': 12 };

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Pedidos que cuentan como ingreso (todo lo no cancelado). */
function isBillable(order: Order): boolean {
  return order.status !== 'cancelado';
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildKpis(orders: Order[]): KpiMetric[] {
  const now = new Date();
  const currentKey = monthKey(now);
  const previousKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const ofMonth = (key: string) =>
    orders.filter((order) => monthKey(new Date(order.createdAt)) === key);

  const currentOrders = ofMonth(currentKey);
  const previousOrders = ofMonth(previousKey);

  const revenue = (list: Order[]) =>
    list.filter(isBillable).reduce((sum, order) => sum + order.total, 0);

  const currentRevenue = revenue(currentOrders);
  const previousRevenue = revenue(previousOrders);

  const currentTicket = currentOrders.filter(isBillable).length
    ? currentRevenue / currentOrders.filter(isBillable).length
    : 0;
  const previousTicket = previousOrders.filter(isBillable).length
    ? previousRevenue / previousOrders.filter(isBillable).length
    : 0;

  const activeCustomers = customerService.list().filter((c) => c.status === 'activo').length;

  return [
    {
      id: 'revenue',
      label: 'Ingresos del mes',
      value: Math.round(currentRevenue * 100) / 100,
      format: 'currency',
      change: percentChange(currentRevenue, previousRevenue),
    },
    {
      id: 'orders',
      label: 'Pedidos del mes',
      value: currentOrders.length,
      format: 'number',
      change: percentChange(currentOrders.length, previousOrders.length),
    },
    {
      id: 'ticket',
      label: 'Ticket promedio',
      value: Math.round(currentTicket * 100) / 100,
      format: 'currency',
      change: percentChange(currentTicket, previousTicket),
    },
    {
      id: 'customers',
      label: 'Clientes activos',
      value: activeCustomers,
      format: 'number',
      change: null,
    },
  ];
}

function buildRevenueByMonth(orders: Order[], period: PeriodFilter): MonthlyRevenuePoint[] {
  const months = PERIOD_MONTHS[period];
  const now = new Date();
  const points: MonthlyRevenuePoint[] = [];

  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = monthKey(date);
    const monthOrders = orders.filter((order) => monthKey(new Date(order.createdAt)) === key);
    const revenue = monthOrders.filter(isBillable).reduce((sum, order) => sum + order.total, 0);

    points.push({
      key,
      month: MONTH_LABELS[date.getMonth()],
      revenue: Math.round(revenue * 100) / 100,
      orders: monthOrders.length,
    });
  }

  return points;
}

function buildStatusBreakdown(orders: Order[]): StatusSlice[] {
  return ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  })).filter((slice) => slice.count > 0);
}

function buildTopCustomers(): TopCustomer[] {
  return customerService
    .listWithStats()
    .filter((customer) => customer.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      company: customer.company,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent,
    }));
}

export const metricsService = {
  getDashboardData(period: PeriodFilter): DashboardData {
    const orders = orderService.list();
    return {
      kpis: buildKpis(orders),
      revenueByMonth: buildRevenueByMonth(orders, period),
      statusBreakdown: buildStatusBreakdown(orders),
      topCustomers: buildTopCustomers(),
      recentOrders: orders.slice(0, 6),
    };
  },
};
