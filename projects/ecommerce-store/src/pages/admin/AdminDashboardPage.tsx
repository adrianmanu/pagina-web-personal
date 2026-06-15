import { useMemo, useState } from 'react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/catalogService';
import { authService } from '../../services/authService';
import { formatPrice } from '../../components/ui/ProductImage';
import { RevenueChart } from '../../components/admin/RevenueChart';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';
import type { RevenuePeriod } from '../../models/types';

const PERIOD_LABELS: Record<RevenuePeriod, string> = {
  week: 'Última semana',
  month: 'Últimos 6 meses',
  year: 'Últimos 4 años',
};

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<RevenuePeriod>('month');
  const [recentPage, setRecentPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const stats = orderService.stats();
  const products = productService.list();
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const customers = authService.listCustomers().length;
  const recentAll = orderService.list();
  const chartData = useMemo(() => orderService.revenueSeries(period), [period]);
  const pagedRecent = useMemo(() => paginate(recentAll, recentPage), [recentAll, recentPage]);
  const pagedLowStock = useMemo(() => paginate(lowStock, lowStockPage), [lowStock, lowStockPage]);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Dashboard</h1>
        <p>Resumen del emprendimiento</p>
      </header>

      <div className="kpi-grid">
        <article className="kpi"><span>Pedidos</span><strong>{stats.total}</strong></article>
        <article className="kpi"><span>Pendientes</span><strong>{stats.pending}</strong></article>
        <article className="kpi"><span>Ingresos</span><strong>{formatPrice(stats.revenue)}</strong></article>
        <article className="kpi"><span>Clientes</span><strong>{customers}</strong></article>
      </div>

      <section className="admin-card">
        <div className="period-tabs">
          {(['week', 'month', 'year'] as RevenuePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? 'active' : ''}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
        <RevenueChart data={chartData} periodLabel={PERIOD_LABELS[period]} />
      </section>

      {lowStock.length > 0 && (
        <section className="admin-card alert">
          <h2>Stock bajo</h2>
          <ul>
            {pagedLowStock.items.map((p) => (
              <li key={p.id}>{p.name} — {p.stock} unidades</li>
            ))}
          </ul>
          <Pagination
            page={pagedLowStock.page}
            totalPages={pagedLowStock.totalPages}
            total={pagedLowStock.total}
            onPageChange={setLowStockPage}
          />
        </section>
      )}

      <section className="admin-card">
        <h2>Pedidos recientes</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {pagedRecent.items.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.customerName}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pagedRecent.page}
          totalPages={pagedRecent.totalPages}
          total={pagedRecent.total}
          onPageChange={setRecentPage}
        />
      </section>
    </div>
  );
}
