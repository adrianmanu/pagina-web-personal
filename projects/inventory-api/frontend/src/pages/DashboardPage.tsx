import { useEffect, useState } from 'react';
import { api, type InventorySummary, type SalesSummary } from '../api/client';

export function DashboardPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [sales, setSales] = useState<SalesSummary | null>(null);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(console.error);
    api.getSalesSummary().then(setSales).catch(console.error);
  }, []);

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Dashboard de inventario</h1>
        </div>
      </header>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Productos registrados</span>
          <strong>{summary?.totalProducts ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Stock total</span>
          <strong>{summary?.totalStock ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Valor del inventario</span>
          <strong>${(summary?.inventoryValue ?? 0).toLocaleString()}</strong>
        </article>
        <article className="kpi-card">
          <span>Facturas emitidas</span>
          <strong>{sales?.totalInvoices ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Unidades vendidas</span>
          <strong>{sales?.itemsSold ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Ingresos por ventas</span>
          <strong>${(sales?.totalRevenue ?? 0).toLocaleString()}</strong>
        </article>
      </div>

      <section className="panel">
        <h2>Resumen por categoría</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Productos</th>
                <th>Stock</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {summary?.byCategory.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.products}</td>
                  <td>{row.stock}</td>
                  <td>${row.value.toLocaleString()}</td>
                </tr>
              ))}
              {!summary?.byCategory.length && (
                <tr>
                  <td colSpan={4} className="muted">Sin productos. Agrega tu primer producto en la sección Productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
