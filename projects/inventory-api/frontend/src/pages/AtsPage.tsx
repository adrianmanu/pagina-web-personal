import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { api, type AtsPreview, type ManualSaleDocument } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validatePositiveAmount,
  validateRequired,
  validateTaxId,
} from '../utils/validation';

const emptyManualSale = {
  documentType: '18',
  documentNumber: '',
  issueDate: new Date().toISOString().slice(0, 10),
  customerName: '',
  customerTaxId: '',
  total: '',
  notes: '',
};

function validationClass(level: string) {
  if (level === 'ERROR') return 'alert alert--error';
  if (level === 'WARNING') return 'alert alert--warning';
  return 'alert';
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function AtsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [preview, setPreview] = useState<AtsPreview | null>(null);
  const [manualSales, setManualSales] = useState<ManualSaleDocument[]>([]);
  const [manualForm, setManualForm] = useState(emptyManualSale);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [manualErrors, setManualErrors] = useState<FieldErrors<keyof typeof emptyManualSale>>({});
  const [savingManual, setSavingManual] = useState(false);

  const periodLabel = useMemo(() => `${String(month).padStart(2, '0')}/${year}`, [month, year]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getAtsPreview(year, month);
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el ATS');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const loadManualSales = () => api.getManualSales().then(setManualSales);

  useEffect(() => {
    loadPreview();
    loadManualSales();
  }, [year, month]);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      await api.exportAts(year, month);
      setSuccess(`ATS ${periodLabel} exportado (${preview?.exportFileName ?? 'AT.zip'}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar el ATS');
    } finally {
      setExporting(false);
    }
  };

  const submitManualSale = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const total = Number(manualForm.total);
    const errors: FieldErrors<keyof typeof emptyManualSale> = {
      documentNumber: validateRequired(manualForm.documentNumber, 'El número de documento'),
      issueDate: validateRequired(manualForm.issueDate, 'La fecha'),
      customerName: validateRequired(manualForm.customerName, 'El nombre del cliente'),
      customerTaxId: validateTaxId(manualForm.customerTaxId),
      total: validatePositiveAmount(total, 'El total'),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<keyof typeof emptyManualSale>;
    setManualErrors(filtered);
    if (hasFieldErrors(filtered)) return;

    setSavingManual(true);
    try {
      await api.createManualSale({
        documentType: manualForm.documentType,
        documentNumber: manualForm.documentNumber.trim(),
        issueDate: manualForm.issueDate,
        customerName: manualForm.customerName.trim(),
        customerTaxId: manualForm.customerTaxId.trim(),
        total,
        notes: manualForm.notes || undefined,
      });
      setManualForm(emptyManualSale);
      setManualErrors({});
      setSuccess('Nota de venta registrada para el ATS.');
      loadManualSales();
      loadPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la nota de venta');
    } finally {
      setSavingManual(false);
    }
  };

  const deleteManualSale = async (id: number) => {
    if (!confirm('¿Eliminar esta nota de venta?')) return;
    try {
      await api.deleteManualSale(id);
      loadManualSales();
      loadPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Contabilidad</p>
          <h1>ATS — Anexo Transaccional</h1>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={handleExport} disabled={exporting || !preview?.readyToExport}>
            <Download size={16} /> {exporting ? 'Exportando…' : 'Exportar XML (ZIP)'}
          </button>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      {preview && !preview.readyToExport && (
        <div className="alert alert--warning" role="status" style={{ marginBottom: 16 }}>
          Corrige las validaciones del período antes de exportar el ZIP al SRI.
        </div>
      )}

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="form-row form-panel">
          <PanelField
            label="Año"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ marginBottom: 0, maxWidth: 140 }}
          />
          <PanelField
            as="select"
            label="Mes"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={{ marginBottom: 0, maxWidth: 140 }}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{String(value).padStart(2, '0')}</option>
            ))}
          </PanelField>
          <button type="button" className="btn btn--ghost" onClick={loadPreview} disabled={loading} style={{ alignSelf: 'end' }}>
            <FileSpreadsheet size={16} /> {loading ? 'Cargando…' : 'Actualizar vista'}
          </button>
        </div>
      </section>

      {preview && (
        <>
          <section className="kpi-grid" style={{ marginBottom: 24 }}>
            <article className="kpi-card">
              <span>Total ventas período</span>
              <strong>{money(preview.totalVentas)}</strong>
            </article>
            <article className="kpi-card">
              <span>Compras</span>
              <strong>{money(preview.purchases.total)}</strong>
              <small>{preview.purchases.documentCount} documentos</small>
            </article>
            <article className="kpi-card">
              <span>Ventas manuales</span>
              <strong>{money(preview.salesManual.total)}</strong>
              <small>{preview.salesManual.documentCount} documentos</small>
            </article>
            <article className="kpi-card">
              <span>Retenciones emitidas</span>
              <strong>{money(preview.retentionsIssued.total)}</strong>
              <small>{preview.retentionsIssued.documentCount} documentos</small>
            </article>
          </section>

          {preview.validations.map((item, index) => (
            <div key={index} className={validationClass(item.level)} style={{ marginBottom: 8 }}>
              {item.level === 'ERROR' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              <span>{item.message}</span>
            </div>
          ))}

          <div className="split">
            <section className="panel">
              <h2>Compras recibidas</h2>
              <AtsTable lines={preview.purchaseLines} emptyLabel="Sin compras en el período." />
            </section>
            <section className="panel">
              <h2>Ventas electrónicas (vista)</h2>
              <p className="muted" style={{ marginBottom: 12 }}>
                Las facturas electrónicas autorizadas no van al bloque ventas del XML; se consolidan en ventas por establecimiento.
              </p>
              <AtsTable lines={preview.saleElectronicLines} emptyLabel="Sin ventas electrónicas en el período." />
            </section>
          </div>

          <div className="split" style={{ marginTop: 24 }}>
            <section className="panel form-panel">
              <h2>Notas de venta / documentos no electrónicos</h2>
              <form onSubmit={submitManualSale} noValidate>
                <div className="form-row">
                  <PanelField
                    as="select"
                    label="Tipo"
                    value={manualForm.documentType}
                    onChange={(e) => setManualForm({ ...manualForm, documentType: e.target.value })}
                  >
                    <option value="18">18 — Documento no electrónico</option>
                    <option value="16">16 — Nota de venta</option>
                  </PanelField>
                  <PanelField
                    label="Número"
                    value={manualForm.documentNumber}
                    onChange={(e) => {
                      setManualForm({ ...manualForm, documentNumber: e.target.value });
                      setManualErrors((prev) => ({ ...prev, documentNumber: undefined }));
                    }}
                    error={manualErrors.documentNumber}
                    required
                  />
                </div>
                <PanelField
                  label="Fecha"
                  type="date"
                  value={manualForm.issueDate}
                  onChange={(e) => {
                    setManualForm({ ...manualForm, issueDate: e.target.value });
                    setManualErrors((prev) => ({ ...prev, issueDate: undefined }));
                  }}
                  error={manualErrors.issueDate}
                  required
                />
                <PanelField
                  label="Cliente"
                  value={manualForm.customerName}
                  onChange={(e) => {
                    setManualForm({ ...manualForm, customerName: e.target.value });
                    setManualErrors((prev) => ({ ...prev, customerName: undefined }));
                  }}
                  error={manualErrors.customerName}
                  required
                />
                <TaxIdField
                  label="Identificación"
                  value={manualForm.customerTaxId}
                  onChange={(e) => {
                    setManualForm({ ...manualForm, customerTaxId: e.target.value });
                    setManualErrors((prev) => ({ ...prev, customerTaxId: undefined }));
                  }}
                  error={manualErrors.customerTaxId}
                  required
                />
                <PanelField
                  label="Total con IVA"
                  type="number"
                  step="0.01"
                  value={manualForm.total}
                  onChange={(e) => {
                    setManualForm({ ...manualForm, total: e.target.value });
                    setManualErrors((prev) => ({ ...prev, total: undefined }));
                  }}
                  error={manualErrors.total}
                  required
                />
                <button type="submit" className="btn btn--primary" disabled={savingManual}>
                  <Plus size={16} /> {savingManual ? 'Guardando…' : 'Registrar nota'}
                </button>
              </form>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr><th>Número</th><th>Cliente</th><th>Total</th><th></th></tr>
                  </thead>
                  <tbody>
                    {manualSales.length === 0 ? (
                      <tr><td colSpan={4} className="muted">Sin notas manuales.</td></tr>
                    ) : manualSales.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.documentNumber}</td>
                        <td>{doc.customerName}</td>
                        <td>{doc.total != null ? money(doc.total) : '—'}</td>
                        <td>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => deleteManualSale(doc.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h2>Retenciones emitidas</h2>
              <AtsTable lines={preview.retentionLines} emptyLabel="Sin retenciones en el período." />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function AtsTable({ lines, emptyLabel }: { lines: AtsPreview['purchaseLines']; emptyLabel: string }) {
  if (!lines.length) {
    return <p className="muted">{emptyLabel}</p>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Contraparte</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.documentNumber}-${index}`}>
              <td>{line.documentNumber}</td>
              <td>{line.partyName}</td>
              <td>{line.issueDate}</td>
              <td>{money(line.total)}</td>
              <td>{line.sriStatus ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
