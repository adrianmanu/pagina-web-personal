import { useEffect, useState } from 'react';
import { api, downloadReport, type CustomerSummary } from '../api/client';

export function DashboardPage() {
  const [summary, setSummary] = useState<{
    total_records: number;
    total_revenue: number;
    by_customer: CustomerSummary[];
  } | null>(null);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    api.getSummary().then(setSummary).catch(console.error);
  }, []);

  const handleExport = async (path: string, filename: string) => {
    setExportError('');
    try {
      await downloadReport(path, filename);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'No se pudo exportar el reporte');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Dashboard</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn--secondary" onClick={() => handleExport('/api/reports/export/csv', 'ventas.csv')}>
            Exportar CSV
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleExport('/api/reports/export/json', 'reporte.json')}>
            Exportar JSON
          </button>
        </div>
      </header>

      {exportError && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 20 }}>
          {exportError}
        </div>
      )}

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
