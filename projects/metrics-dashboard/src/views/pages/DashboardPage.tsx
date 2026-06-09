import { useMetricsController } from '../../controllers/useMetricsController';
import type { PeriodFilter } from '../../models/Metric';
import { KpiCard } from '../components/KpiCard';
import { SalesChart } from '../components/SalesChart';

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
];

export function DashboardPage() {
  const { kpis, chartData, period, setPeriod, maxValue } = useMetricsController();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Panel empresarial</p>
          <h1>Dashboard de Métricas</h1>
        </div>
        <div className="dashboard__filters">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              className={`dashboard__filter ${period === item.value ? 'dashboard__filter--active' : ''}`}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="dashboard__kpis">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} metric={kpi} />
        ))}
      </section>

      <section className="dashboard__chart-section">
        <h2>Ventas vs Gastos</h2>
        <SalesChart data={chartData} maxValue={maxValue} />
      </section>
    </div>
  );
}
