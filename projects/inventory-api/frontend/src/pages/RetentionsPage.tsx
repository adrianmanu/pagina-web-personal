import { FormEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Plus, RefreshCw, RotateCcw, Scale, Trash2 } from 'lucide-react';
import { api, type ReceivedDocument, type Retention, type RetentionTaxCode, type Supplier } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { SriStatusBadge } from '../components/ui/SriStatusBadge';
import {
  type FieldErrors,
  hasFieldErrors,
  validateDocumentNumber,
  validatePositiveAmount,
  validateRequired,
} from '../utils/validation';

interface Line {
  retentionCodeId: string;
  taxableBase: number;
}

const emptyLine: Line = { retentionCodeId: '', taxableBase: 0 };

type RetentionField = 'supplierId' | 'supportDocumentNumber' | 'supportDocumentDate';

function ridePdfUrl(retention: Retention) {
  if (retention.sriRidePdfUrl) return retention.sriRidePdfUrl;
  if (retention.datilRetentionId) return `https://app.datil.co/ver/${retention.datilRetentionId}/pdf`;
  return null;
}

export function RetentionsPage() {
  const [retentions, setRetentions] = useState<Retention[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<ReceivedDocument[]>([]);
  const [taxCodes, setTaxCodes] = useState<RetentionTaxCode[]>([]);
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [receivedDocumentId, setReceivedDocumentId] = useState<number | ''>('');
  const [supportDocumentNumber, setSupportDocumentNumber] = useState('');
  const [supportDocumentDate, setSupportDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine, retentionCodeId: 'renta-1-servicios', taxableBase: 100 }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [reissuingId, setReissuingId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RetentionField>>({});
  const [lineErrors, setLineErrors] = useState<Record<number, { code?: string; base?: string }>>({});

  const load = () => api.getRetentions().then(setRetentions);

  useEffect(() => {
    load();
    api.getSuppliers().then(setSuppliers);
    api.getReceivedDocuments().then(setReceivedDocuments);
    api.getRetentionTaxCodes().then(setTaxCodes);
  }, []);

  const documentsForSupplier = useMemo(() => {
    if (!supplierId) return receivedDocuments;
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) return receivedDocuments;
    return receivedDocuments.filter((doc) => doc.issuerTaxId === supplier.taxId);
  }, [receivedDocuments, supplierId, suppliers]);

  useEffect(() => {
    if (!receivedDocumentId) return;
    const doc = receivedDocuments.find((item) => item.id === receivedDocumentId);
    if (!doc) return;
    setSupportDocumentNumber(doc.documentNumber);
    setSupportDocumentDate(doc.issueDate);
    if (doc.subtotal && doc.subtotal > 0) {
      setLines((current) =>
        current.map((line, index) => (index === 0 ? { ...line, taxableBase: doc.subtotal ?? line.taxableBase } : line)),
      );
    }
    const matchedSupplier = suppliers.find((item) => item.taxId === doc.issuerTaxId);
    if (matchedSupplier) setSupplierId(matchedSupplier.id);
  }, [receivedDocumentId, receivedDocuments, suppliers]);

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const code = taxCodes.find((item) => item.id === line.retentionCodeId);
        if (!code || line.taxableBase <= 0) return sum;
        return sum + Math.round(line.taxableBase * code.percentage) / 100;
      }, 0),
    [lines, taxCodes],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errors: FieldErrors<RetentionField> = {};
    if (!supplierId) errors.supplierId = 'Selecciona un proveedor (sujeto retenido)';
    if (!receivedDocumentId) {
      errors.supportDocumentNumber = validateDocumentNumber(supportDocumentNumber, 'El número del documento de sustento');
      errors.supportDocumentDate = validateRequired(supportDocumentDate, 'La fecha del documento sustento');
    }

    const nextLineErrors: Record<number, { code?: string; base?: string }> = {};
    lines.forEach((line, index) => {
      if (!line.retentionCodeId) nextLineErrors[index] = { ...nextLineErrors[index], code: 'Selecciona un código' };
      const baseError = validatePositiveAmount(line.taxableBase, 'La base imponible');
      if (baseError) nextLineErrors[index] = { ...nextLineErrors[index], base: baseError };
    });

    const validLines = lines.filter((line) => line.retentionCodeId && line.taxableBase > 0);
    if (!validLines.length && !Object.keys(nextLineErrors).length) {
      setError('Agrega al menos una línea de retención con base imponible.');
      return;
    }

    setFieldErrors(errors);
    setLineErrors(nextLineErrors);
    if (hasFieldErrors(errors) || Object.keys(nextLineErrors).length) return;

    setSaving(true);
    try {
      const result = await api.createRetention({
        supplierId: Number(supplierId),
        ...(receivedDocumentId
          ? { receivedDocumentId: Number(receivedDocumentId) }
          : {
              supportDocumentNumber: supportDocumentNumber.trim(),
              supportDocumentType: '01',
              supportDocumentDate,
            }),
        items: validLines.map((line) => ({
          retentionCodeId: line.retentionCodeId,
          taxableBase: line.taxableBase,
        })),
      });
      setSuccess(
        `Retención #${result.id} emitida${result.sriDocumentNumber ? ` · ${result.sriDocumentNumber}` : ''}${result.sriStatus ? ` · SRI ${result.sriStatus}` : ''}`,
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la retención');
    } finally {
      setSaving(false);
    }
  };

  const refreshSri = async (id: number) => {
    setRefreshingId(id);
    setError('');
    try {
      await api.refreshRetentionSri(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado SRI');
    } finally {
      setRefreshingId(null);
    }
  };

  const reissueSri = async (id: number) => {
    setReissuingId(id);
    setError('');
    try {
      await api.reissueRetentionSri(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reemitir la retención');
    } finally {
      setReissuingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Compras</p>
          <h1>Comprobantes de retención</h1>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      <section className="panel form-panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Nueva retención</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Emite retención en la fuente contra una factura de proveedor (documento de sustento). Solo aplica si el emisor es agente de retención.
        </p>
        {!suppliers.length && (
          <div className="alert alert--warning" role="status">
            Registra proveedores en Compras → Proveedores antes de emitir retenciones.
          </div>
        )}
        <form onSubmit={submit} noValidate>
          <PanelField
            as="select"
            label="Proveedor (sujeto retenido)"
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value ? Number(e.target.value) : '');
              setFieldErrors((prev) => ({ ...prev, supplierId: undefined }));
            }}
            error={fieldErrors.supplierId}
            required
          >
            <option value="">Seleccionar proveedor…</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} ({supplier.taxId})
              </option>
            ))}
          </PanelField>
          <PanelField
            as="select"
            label="Documento recibido (opcional)"
            value={receivedDocumentId}
            onChange={(e) => {
              setReceivedDocumentId(e.target.value ? Number(e.target.value) : '');
              setFieldErrors((prev) => ({
                ...prev,
                supportDocumentNumber: undefined,
                supportDocumentDate: undefined,
              }));
            }}
            hint="Si eliges un documento importado, se autocompletan número y fecha."
          >
            <option value="">Ingresar sustento manualmente…</option>
            {documentsForSupplier.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.documentNumber} · {doc.issuerName} · {doc.issueDate}
              </option>
            ))}
          </PanelField>
          <div className="form-row">
            <PanelField
              label="Nº documento sustento (factura proveedor)"
              value={supportDocumentNumber}
              onChange={(e) => {
                setSupportDocumentNumber(e.target.value);
                setFieldErrors((prev) => ({ ...prev, supportDocumentNumber: undefined }));
              }}
              placeholder="001-001-000000123"
              error={fieldErrors.supportDocumentNumber}
              required={!receivedDocumentId}
              disabled={!!receivedDocumentId}
            />
            <PanelField
              label="Fecha documento sustento"
              type="date"
              value={supportDocumentDate}
              onChange={(e) => {
                setSupportDocumentDate(e.target.value);
                setFieldErrors((prev) => ({ ...prev, supportDocumentDate: undefined }));
              }}
              error={fieldErrors.supportDocumentDate}
              required={!receivedDocumentId}
              disabled={!!receivedDocumentId}
            />
          </div>

          <h3>Impuestos retenidos</h3>
          {lines.map((line, index) => (
            <div key={index} className="form-row" style={{ alignItems: 'end' }}>
              <PanelField
                as="select"
                label="Código retención"
                value={line.retentionCodeId}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], retentionCodeId: e.target.value };
                  setLines(next);
                  setLineErrors((prev) => ({ ...prev, [index]: { ...prev[index], code: undefined } }));
                }}
                error={lineErrors[index]?.code}
                required
              >
                <option value="">Seleccionar…</option>
                {taxCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.label} ({code.percentage}%)
                  </option>
                ))}
              </PanelField>
              <PanelField
                label="Base imponible (USD)"
                type="number"
                min={0.01}
                step={0.01}
                value={line.taxableBase || ''}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], taxableBase: Number(e.target.value) };
                  setLines(next);
                  setLineErrors((prev) => ({ ...prev, [index]: { ...prev[index], base: undefined } }));
                }}
                error={lineErrors[index]?.base}
                required
              />
              {lines.length > 1 && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines(lines.filter((_, i) => i !== index))}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines([...lines, { ...emptyLine, retentionCodeId: 'renta-1-servicios' }])}>
            <Plus size={14} /> Agregar línea
          </button>
          <p className="muted">Total retenido estimado: <strong>${estimatedTotal.toLocaleString()}</strong></p>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving || !suppliers.length}>
              <Scale size={16} /> {saving ? 'Emitiendo…' : 'Emitir comprobante de retención'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nº SRI</th>
                <th>Proveedor</th>
                <th>Doc. sustento</th>
                <th>Total retenido</th>
                <th>SRI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {retentions.map((retention) => (
                <Fragment key={retention.id}>
                  <tr>
                    <td>{retention.id}</td>
                    <td className="mono">{retention.sriDocumentNumber ?? '—'}</td>
                    <td>{retention.supplierName}</td>
                    <td className="mono">{retention.supportDocumentNumber}</td>
                    <td>${retention.totalRetained.toLocaleString()}</td>
                    <td><SriStatusBadge status={retention.sriStatus} /></td>
                    <td className="actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setExpandedId(expandedId === retention.id ? null : retention.id)}>
                        {expandedId === retention.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === retention.id && (
                    <tr className="invoice-detail-row">
                      <td colSpan={7}>
                        <div className="invoice-detail-header">
                          <div>
                            <p className="invoice-detail-title">
                              Retención #{retention.id}
                              {retention.sriDocumentNumber && (
                                <span className="invoice-detail-sri-number">{retention.sriDocumentNumber}</span>
                              )}
                            </p>
                            <p className="muted">
                              Período fiscal {retention.periodoFiscal}
                              {' · '}Sustento {retention.supportDocumentNumber} ({retention.supportDocumentDate})
                            </p>
                          </div>
                          <div className="invoice-sri-actions">
                            {retention.sriStatus && retention.sriStatus !== 'AUTORIZADO' && retention.sriStatus !== 'DISABLED' && (
                              <button type="button" className="btn btn--ghost btn--sm" disabled={refreshingId === retention.id} onClick={() => refreshSri(retention.id)}>
                                <RefreshCw size={14} /> {refreshingId === retention.id ? 'Consultando…' : 'Actualizar SRI'}
                              </button>
                            )}
                            {retention.canReissueSri && (
                              <button type="button" className="btn btn--ghost btn--sm" disabled={reissuingId === retention.id} onClick={() => reissueSri(retention.id)}>
                                <RotateCcw size={14} /> {reissuingId === retention.id ? 'Reemitiendo…' : 'Reemitir'}
                              </button>
                            )}
                            {retention.sriStatus === 'AUTORIZADO' && ridePdfUrl(retention) && (
                              <a className="btn btn--ghost btn--sm" href={ridePdfUrl(retention)!} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} /> Ver RIDE (PDF)
                              </a>
                            )}
                          </div>
                        </div>
                        {retention.sriErrorMessage && (
                          <p className="invoice-sri-error"><strong>Error SRI:</strong> {retention.sriErrorMessage}</p>
                        )}
                        <table className="invoice-detail">
                          <thead>
                            <tr><th>Código</th><th>Descripción</th><th>Base</th><th>%</th><th>Retenido</th></tr>
                          </thead>
                          <tbody>
                            {retention.items.map((item, i) => (
                              <tr key={i}>
                                <td className="mono">{item.retentionCode}</td>
                                <td>{item.retentionLabel}</td>
                                <td>${item.taxableBase.toLocaleString()}</td>
                                <td>{item.percentage}%</td>
                                <td>${item.retainedAmount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!retentions.length && (
                <tr><td colSpan={7} className="muted">Aún no hay comprobantes de retención.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
