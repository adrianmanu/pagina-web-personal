import { useMemo, useState } from 'react';
import type { PeriodFilter } from '../models/Metric';
import { customerService } from '../services/customerService';
import { metricsService } from '../services/metricsService';

export function useDashboardController() {
  const [period, setPeriod] = useState<PeriodFilter>('6m');

  const data = useMemo(() => metricsService.getDashboardData(period), [period]);

  const customersById = useMemo(() => {
    const map = new Map<string, string>();
    customerService.list().forEach((customer) => map.set(customer.id, customer.name));
    return map;
  }, []);

  const maxRevenue = useMemo(
    () => Math.max(1, ...data.revenueByMonth.map((point) => point.revenue)),
    [data.revenueByMonth],
  );

  return { ...data, period, setPeriod, maxRevenue, customersById };
}
