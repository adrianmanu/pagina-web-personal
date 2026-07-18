import { FormEvent, useEffect, useState } from 'react';
import { FileUp, Inbox, Search, Trash2 } from 'lucide-react';
import { api, type ReceivedDocument, type SustentoCode, type Supplier } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validateAccessKey,
  validateDocumentNumber,
  validateRequired,
  validateTaxId,
  validateXmlContent,
} from '../utils/validation';

const XML_PLACEHOLDER = `Pega aquí el XML autorizado del proveedor (factura, liquidación, etc.)`;

const emptyManual = {
  supplierId: '' as number | '',
  documentType: '01',
  documentNumber: '',
  accessKey: '',
  authorizationNumber: '',
  issueDate: new Date().toISOString().slice(0, 10),
  issuerName: '',
  issuerTaxId: '',
  subtotal: '',
  iva: '',
  total: '',
  sustentoCode: '01',
  notes: '',
};

type ManualField = keyof typeof emptyManual | 'xml';

function categoryBadge(category?: string | null) {
  if (category === 'CREDITO_TRIBUTARIO') return 'badge badge--success';
  if (category === 'COSTO_GASTO') return 'badge badge--warning';
  return 'badge';
}

function categoryLabel(category?: string | null) {
  if (category === 'CREDITO_TRIBUTARIO') return 'Crédito tributario';
  if (category === 'COSTO_GASTO') return 'Costo / gasto';
  return '—';
}

export function ReceivedDocumentsPage() {
  const [documents, setDocuments] = useState<ReceivedDocument[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sustentoCodes, setSustentoCodes] = useState<SustentoCode[]>([]);
  const [mode, setMode] = useState<'manual' | 'xml'>('xml');
  const [manual, setManual] = useState(emptyManual);
  const [xml, setXml] = useState('');
  const [xmlSustentoCode, setXmlSustentoCode] = useState('01');
  const [xmlNotes, setXmlNotes] = useState('');
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [manualErrors, setManualErrors] = useState<FieldErrors<Exclude<ManualField, 'xml'>>>({});
  const [xmlError, setXmlError] = useState<string | undefined>();

  const load = () =>
    api
      .getReceivedDocuments({
        q: query || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        documentType: documentType || undefined,
      })
      .then(setDocuments);

  useEffect(() => {
    load();
    api.getSuppliers().then(setSuppliers);
    api.getSustentoCodes().then(setSustentoCodes);
  }, []);

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    load();
  };

  const validateManual = () => {
    const errors: FieldErrors<Exclude<ManualField, 'xml'>> = {
      documentNumber: validateDocumentNumber(manual.documentNumber),
      issueDate: validateRequired(manual.issueDate, 'La fecha de emisión'),
      issuerName: validateRequired(manual.issuerName, 'El nombre del emisor'),
      issuerTaxId: validateTaxId(manual.issuerTaxId),
      accessKey: validateAccessKey(manual.accessKey),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<Exclude<ManualField, 'xml'>>;
    setManualErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const submitManual = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateManual()) return;

    setSaving(true);
    try {
      const result = await api.createReceivedDocument({
        supplierId: manual.supplierId ? Number(manual.supplierId) : undefined,
        documentType: manual.documentType,
        documentNumber: manual.documentNumber.trim(),
        accessKey: manual.accessKey || undefined,
        authorizationNumber: manual.authorizationNumber || undefined,
        issueDate: manual.issueDate,
        issuerName: manual.issuerName.trim(),
        issuerTaxId: manual.issuerTaxId.trim(),
        subtotal: manual.subtotal ? Number(manual.subtotal) : undefined,
        iva: manual.iva ? Number(manual.iva) : undefined,
        total: manual.total ? Number(manual.total) : undefined,
        sustentoCode: manual.sustentoCode,
        notes: manual.notes || undefined,
      });
      setSuccess(`Documento ${result.documentNumber} registrado.`);
      setManual(emptyManual);
      setManualErrors({});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el documento');
    } finally {
      setSaving(false);
    }
  };

  const submitXml = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const xmlValidation = validateXmlContent(xml);
    setXmlError(xmlValidation);
    if (xmlValidation) return;

    setSaving(true);
    try {
      const result = await api.uploadReceivedDocumentXml({
        xml,
        sustentoCode: xmlSustentoCode,
        notes: xmlNotes || undefined,
      });
      setSuccess(`XML importado: ${result.documentNumber} · ${result.issuerName}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el XML');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este documento recibido?')) return;
    setError('');
    try {
      await api.deleteReceivedDocument(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Compras</p>
          <h1>Documentos recibidos</h1>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      <div className="split">
        <section className="panel form-panel">
          <div className="form-actions" style={{ marginBottom: 16 }}>
            <button type="button" className={mode === 'xml' ? 'btn btn--primary' : 'btn btn--ghost'} onClick={() => setMode('xml')}>
              <FileUp size={16} /> Importar XML
            </button>
            <button type="button" className={mode === 'manual' ? 'btn btn--primary' : 'btn btn--ghost'} onClick={() => setMode('manual')}>
              <Inbox size={16} /> Registro manual
            </button>
          </div>

          {mode === 'xml' ? (
            <form onSubmit={submitXml} noValidate>
              <h2 style={{ marginTop: 0 }}>Importar XML autorizado</h2>
              <p className="muted" style={{ marginBottom: 12 }}>
                Pega el XML de factura, liquidación o comprobante autorizado del proveedor. Se extraen emisor, totales y número.
              </p>
              <PanelField
                as="textarea"
                label="XML"
                rows={14}
                value={xml}
                placeholder={XML_PLACEHOLDER}
                onChange={(e) => {
                  setXml(e.target.value);
                  setXmlError(undefined);
                }}
                error={xmlError}
                required
              />
              <PanelField
                as="select"
                label="Código sustento (clasificación)"
                value={xmlSustentoCode}
                onChange={(e) => setXmlSustentoCode(e.target.value)}
              >
                {sustentoCodes.map((code) => (
                  <option key={code.code} value={code.code}>{code.code} — {code.label}</option>
                ))}
              </PanelField>
              <PanelField
                label="Notas (opcional)"
                value={xmlNotes}
                onChange={(e) => setXmlNotes(e.target.value)}
              />
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Importando…' : 'Importar documento'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitManual} noValidate>
              <h2 style={{ marginTop: 0 }}>Registro manual</h2>
              <PanelField
                as="select"
                label="Proveedor vinculado (opcional)"
                value={manual.supplierId}
                onChange={(e) => setManual({ ...manual, supplierId: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">Sin vincular</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name} ({supplier.taxId})</option>
                ))}
              </PanelField>
              <div className="form-row">
                <PanelField
                  as="select"
                  label="Tipo comprobante"
                  value={manual.documentType}
                  onChange={(e) => setManual({ ...manual, documentType: e.target.value })}
                >
                  <option value="01">01 — Factura</option>
                  <option value="03">03 — Liquidación compra</option>
                  <option value="04">04 — Nota crédito</option>
                </PanelField>
                <PanelField
                  label="Número"
                  value={manual.documentNumber}
                  onChange={(e) => {
                    setManual({ ...manual, documentNumber: e.target.value });
                    setManualErrors((prev) => ({ ...prev, documentNumber: undefined }));
                  }}
                  placeholder="011-007-000000251"
                  error={manualErrors.documentNumber}
                  required
                />
              </div>
              <div className="form-row">
                <PanelField
                  label="Fecha emisión"
                  type="date"
                  value={manual.issueDate}
                  onChange={(e) => {
                    setManual({ ...manual, issueDate: e.target.value });
                    setManualErrors((prev) => ({ ...prev, issueDate: undefined }));
                  }}
                  error={manualErrors.issueDate}
                  required
                />
                <PanelField
                  as="select"
                  label="Código sustento"
                  value={manual.sustentoCode}
                  onChange={(e) => setManual({ ...manual, sustentoCode: e.target.value })}
                >
                  {sustentoCodes.map((code) => (
                    <option key={code.code} value={code.code}>{code.code} — {code.label}</option>
                  ))}
                </PanelField>
              </div>
              <PanelField
                label="Emisor (razón social)"
                value={manual.issuerName}
                onChange={(e) => {
                  setManual({ ...manual, issuerName: e.target.value });
                  setManualErrors((prev) => ({ ...prev, issuerName: undefined }));
                }}
                error={manualErrors.issuerName}
                required
              />
              <TaxIdField
                label="RUC / cédula emisor"
                value={manual.issuerTaxId}
                onChange={(e) => {
                  setManual({ ...manual, issuerTaxId: e.target.value });
                  setManualErrors((prev) => ({ ...prev, issuerTaxId: undefined }));
                }}
                error={manualErrors.issuerTaxId}
                required
              />
              <div className="form-row">
                <PanelField label="Subtotal" type="number" step="0.01" value={manual.subtotal} onChange={(e) => setManual({ ...manual, subtotal: e.target.value })} />
                <PanelField label="IVA" type="number" step="0.01" value={manual.iva} onChange={(e) => setManual({ ...manual, iva: e.target.value })} />
                <PanelField label="Total" type="number" step="0.01" value={manual.total} onChange={(e) => setManual({ ...manual, total: e.target.value })} />
              </div>
              <PanelField
                label="Clave acceso (opcional)"
                value={manual.accessKey}
                onChange={(e) => {
                  setManual({ ...manual, accessKey: e.target.value });
                  setManualErrors((prev) => ({ ...prev, accessKey: undefined }));
                }}
                error={manualErrors.accessKey}
                hint="49 dígitos si la tienes"
              />
              <PanelField label="Notas" value={manual.notes} onChange={(e) => setManual({ ...manual, notes: e.target.value })} />
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Registrar documento'}
              </button>
            </form>
          )}
        </section>

        <section className="panel">
          <form className="form-row form-panel" onSubmit={applyFilters} style={{ marginBottom: 16 }}>
            <PanelField
              label="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Emisor, número o clave"
              style={{ flex: 2, marginBottom: 0 }}
            />
            <PanelField
              label="Desde"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <PanelField
              label="Hasta"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <PanelField
              as="select"
              label="Tipo"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="">Todos</option>
              <option value="01">Factura</option>
              <option value="03">Liquidación</option>
              <option value="04">Nota crédito</option>
            </PanelField>
            <button type="submit" className="btn btn--ghost"><Search size={16} /> Filtrar</button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Emisor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Sustento</th>
                  <th>Origen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={7} className="muted">Sin documentos recibidos.</td></tr>
                ) : documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.documentNumber}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>Tipo {doc.documentType}</div>
                    </td>
                    <td>
                      {doc.issuerName}
                      <div className="muted" style={{ fontSize: 12 }}>{doc.issuerTaxId}</div>
                    </td>
                    <td>{doc.issueDate}</td>
                    <td>{doc.total != null ? `$${doc.total.toFixed(2)}` : '—'}</td>
                    <td>
                      <span className={categoryBadge(doc.sustentoCategory)}>{categoryLabel(doc.sustentoCategory)}</span>
                      <div className="muted" style={{ fontSize: 12 }}>{doc.sustentoLabel}</div>
                    </td>
                    <td>{doc.source === 'XML_UPLOAD' ? 'XML' : 'Manual'}</td>
                    <td>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(doc.id)} aria-label="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
