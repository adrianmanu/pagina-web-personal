import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { api, type InventorySummary, type SalesSummary } from '../api';

const STOCKFLOW_THEME = { accentRgb: [244, 63, 94] as [number, number, number] };

export function DashboardPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSummary(), api.getSalesSummary()])
      .then(([inventory, salesData]) => {
        setSummary(inventory);
        setSales(salesData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el panel');
      })
      .finally(() => setLoading(false));
  }, []);

  const exportReport = (format: 'pdf' | 'excel') => {
    type Row = { metric: string; value: string };
    const rows: Row[] = [
      { metric: 'Productos registrados', value: String(summary?.totalProducts ?? 0) },
      { metric: 'Stock total', value: String(summary?.totalStock ?? 0) },
      { metric: 'Valor del inventario', value: `$${(summary?.inventoryValue ?? 0).toLocaleString()}` },
      { metric: 'Facturas emitidas', value: String(sales?.totalInvoices ?? 0) },
      { metric: 'Unidades vendidas', value: String(sales?.itemsSold ?? 0) },
      { metric: 'Ingresos por ventas', value: `$${(sales?.totalRevenue ?? 0).toLocaleString()}` },
    ];
    const columns: ExportColumn<Row>[] = [
      { header: 'Indicador', value: (row) => row.metric },
      { header: 'Valor', value: (row) => row.value },
    ];
    const meta = {
      title: 'Resumen de inventario — StockFlow',
      subtitle: 'KPIs del panel principal',
      filenameBase: `resumen-inventario-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, columns, rows, STOCKFLOW_THEME);
    else downloadExcel(meta, columns, rows, 'Resumen');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Dashboard de inventario</h1>
        </div>
        <div className="header-actions">
          <ExportMenu onExport={exportReport} />
        </div>
      </header>

      {error && <div className="alert alert--error" role="alert">{error}</div>}
      {loading && <p className="muted">Cargando indicadores…</p>}

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
        {!loading && !summary?.byCategory.length && (
          <p className="muted" style={{ marginBottom: 12 }}>
            Sin productos aún. <Link to="/productos">Agrega tu primer producto →</Link>
          </p>
        )}
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
