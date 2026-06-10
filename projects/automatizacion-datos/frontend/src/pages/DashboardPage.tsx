import { useEffect, useState } from 'react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { api, type CustomerSummary, type SaleRecord } from '../api/client';

const SALE_COLUMNS: ExportColumn<SaleRecord>[] = [
  { header: 'ID', value: (row) => row.id },
  { header: 'Ref. externa', value: (row) => row.external_id },
  { header: 'Producto', value: (row) => row.product_name },
  { header: 'Cantidad', value: (row) => row.quantity },
  { header: 'Precio unit.', value: (row) => row.unit_price },
  { header: 'Cliente', value: (row) => row.customer },
  { header: 'Total', value: (row) => row.total },
  { header: 'Extraído', value: (row) => new Date(row.extracted_at).toLocaleString() },
];

const DATAFLOW_THEME = { accentRgb: [16, 185, 129] as [number, number, number] };

export function DashboardPage() {
  const [summary, setSummary] = useState<{
    total_records: number;
    total_revenue: number;
    by_customer: CustomerSummary[];
  } | null>(null);
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    api.getSummary().then(setSummary).catch(console.error);
    api.getRecords().then(setRecords).catch(console.error);
  }, []);

  const exportSales = (format: 'pdf' | 'excel') => {
    setExportError('');
    if (!records.length) {
      setExportError('No hay registros para exportar. Ejecuta un job ETL primero.');
      return;
    }
    const meta = {
      title: 'Reporte de ventas — DataFlow',
      subtitle: `${records.length} registros · $${(summary?.total_revenue ?? 0).toLocaleString()} en ingresos`,
      filenameBase: `ventas-dataflow-${new Date().toISOString().slice(0, 10)}`,
    };
    try {
      if (format === 'pdf') downloadPdf(meta, SALE_COLUMNS, records, DATAFLOW_THEME);
      else downloadExcel(meta, SALE_COLUMNS, records, 'Ventas');
    } catch {
      setExportError('No se pudo generar el reporte.');
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
          <ExportMenu onExport={exportSales} disabled={!records.length} />
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
