import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../../utils/exportReports';
import { useDashboardController } from '../../controllers/useDashboardController';
import type { KpiMetric, PeriodFilter } from '../../models/Metric';
import { ExportMenu } from '../components/ExportMenu';
import { KpiCard } from '../components/KpiCard';
import { RevenueChart } from '../components/RevenueChart';
import { StatusBadge } from '../components/StatusBadge';
import { StatusDonut } from '../components/StatusDonut';

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
];

const METRIX_THEME = { accentRgb: [99, 102, 241] as [number, number, number] };

export function DashboardPage() {
  const {
    kpis,
    revenueByMonth,
    statusBreakdown,
    topCustomers,
    recentOrders,
    period,
    setPeriod,
    maxRevenue,
    customersById,
  } = useDashboardController();

  const exportDashboard = (format: 'pdf' | 'excel') => {
    const formatValue = (metric: KpiMetric) => {
      if (metric.format === 'currency') return `$${metric.value.toLocaleString()}`;
      if (metric.format === 'percent') return `${metric.value}%`;
      return metric.value.toLocaleString();
    };
    const columns: ExportColumn<KpiMetric>[] = [
      { header: 'Indicador', value: (kpi) => kpi.label },
      { header: 'Valor', value: (kpi) => formatValue(kpi) },
      {
        header: 'Variación',
        value: (kpi) =>
          kpi.change === null ? '—' : `${kpi.change >= 0 ? '+' : ''}${kpi.change}% vs mes anterior`,
      },
    ];
    const meta = {
      title: 'Resumen ejecutivo — Metrix',
      subtitle: `Periodo: ${PERIODS.find((item) => item.value === period)?.label ?? period}`,
      filenameBase: `dashboard-metrix-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, columns, kpis, METRIX_THEME);
    else downloadExcel(meta, columns, kpis, 'KPIs');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel empresarial</p>
          <h1>Dashboard</h1>
        </div>
        <div className="page-header__actions">
          <ExportMenu onExport={exportDashboard} disabled={!kpis.length} />
          <div className="filters">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`filter ${period === item.value ? 'filter--active' : ''}`}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
          </div>
        </div>
      </header>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} metric={kpi} />
        ))}
      </section>

      <section className="grid-two">
        <div className="panel panel--chart">
          <h2>Ingresos por mes</h2>
          <RevenueChart data={revenueByMonth} maxRevenue={maxRevenue} />
        </div>
        <div className="panel">
          <h2>Pedidos por estado</h2>
          <StatusDonut data={statusBreakdown} />
        </div>
      </section>

      <section className="grid-two grid-two--reverse">
        <div className="panel">
          <div className="panel__head">
            <h2>Pedidos recientes</h2>
            <Link to="/pedidos" className="panel__link">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">{order.number}</td>
                    <td>{customersById.get(order.customerId) ?? '—'}</td>
                    <td>${order.total.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2>Top clientes</h2>
            <Link to="/clientes" className="panel__link">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="top-customers">
            {topCustomers.map((customer, index) => {
              const max = topCustomers[0]?.totalSpent || 1;
              return (
                <li key={customer.id}>
                  <span className="top-customers__rank">{index + 1}</span>
                  <div className="top-customers__info">
                    <strong>{customer.name}</strong>
                    <small>
                      {customer.company} · {customer.orderCount} pedidos
                    </small>
                    <div className="top-customers__bar">
                      <i style={{ width: `${(customer.totalSpent / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="top-customers__total">
                    ${customer.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
