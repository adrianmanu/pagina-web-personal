import { useEffect, useState } from 'react';
import { api, type CustomerSummary } from '../api/client';

async function downloadReport(path: string, filename: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DashboardPage() {
  const [summary, setSummary] = useState<{
    total_records: number;
    total_revenue: number;
    by_customer: CustomerSummary[];
  } | null>(null);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Dashboard</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn--secondary" onClick={() => downloadReport('/api/reports/export/csv', 'ventas.csv')}>
            Exportar CSV
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => downloadReport('/api/reports/export/json', 'reporte.json')}>
            Exportar JSON
          </button>
        </div>
      </header>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Registros totales</span>
          <strong>{summary?.total_records ?? 0}</strong>
        </article>
        <article className="kpi-card">
          <span>Ingresos acumulados</span>
          <strong>${(summary?.total_revenue ?? 0).toLocaleString()}</strong>
        </article>
        <article className="kpi-card">
          <span>Clientes activos</span>
          <strong>{summary?.by_customer.length ?? 0}</strong>
        </article>
      </div>

      <section className="panel">
        <h2>Resumen por cliente</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pedidos</th>
                <th>Total ventas</th>
              </tr>
            </thead>
            <tbody>
              {summary?.by_customer.map((row) => (
                <tr key={row.customer}>
                  <td>{row.customer}</td>
                  <td>{row.total_orders}</td>
                  <td>${row.total_sales.toLocaleString()}</td>
                </tr>
              ))}
              {!summary?.by_customer.length && (
                <tr>
                  <td colSpan={3} className="muted">Sin datos. Ejecuta un job ETL para comenzar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
