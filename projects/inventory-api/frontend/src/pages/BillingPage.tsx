import { FormEvent, Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink, Plus, RefreshCw, RotateCcw, Trash2, Truck, User, Users } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validateEmail,
  validateRequired,
  validateTaxId,
  validatePositiveAmount,
} from '../utils/validation';
import { api, type Customer, type Invoice, type Product, type SriConfig } from '../api';

interface Line {
  productId: number | '';
  quantity: number;
}

const emptyLine: Line = { productId: '', quantity: 1 };
const emptyCustomer = { customerName: '', customerTaxId: '', customerEmail: '', customerAddress: '' };
type CustomerField = keyof typeof emptyCustomer;

const STOCKFLOW_THEME = { accentRgb: [244, 63, 94] as [number, number, number] };

const INVOICE_COLUMNS: ExportColumn<Invoice>[] = [
  { header: 'Factura', value: (inv) => inv.sriDocumentNumber ?? `#${inv.id}` },
  { header: 'Cliente', value: (inv) => inv.customerName },
  { header: 'Tipo', value: (inv) => (inv.finalConsumer ? 'Consumidor final' : 'Con datos') },
  { header: 'SRI', value: (inv) => inv.sriStatus ?? '—' },
  { header: 'Ítems', value: (inv) => inv.items.length },
  { header: 'Total', value: (inv) => inv.total },
  { header: 'Fecha', value: (inv) => new Date(inv.createdAt).toLocaleString() },
];

function canRefreshSri(status?: string | null) {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized !== 'AUTORIZADO' && normalized !== 'DISABLED';
}

function ridePdfUrl(invoice: Invoice) {
  if (invoice.sriRidePdfUrl) return invoice.sriRidePdfUrl;
  if (invoice.datilInvoiceId) return `https://app.datil.co/ver/${invoice.datilInvoiceId}/pdf`;
  return null;
}

function canDownloadRide(invoice: Invoice) {
  return invoice.sriStatus?.toUpperCase() === 'AUTORIZADO' && !!ridePdfUrl(invoice);
}

function printThermalTicket(invoice: Invoice) {
  const win = window.open('', '_blank', 'width=320,height=600');
  if (!win) return;
  const lines = invoice.items.map((item) =>
    `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>$${item.subtotal.toFixed(2)}</td></tr>`,
  ).join('');
  win.document.write(`<!DOCTYPE html><html><head><title>Ticket ${invoice.sriDocumentNumber ?? invoice.id}</title>
    <style>body{font-family:monospace;font-size:12px;width:72mm;margin:0 auto}table{width:100%}td{padding:2px 0}</style></head><body>
    <h3 style="text-align:center">StockFlow</h3>
    <p>${invoice.sriDocumentNumber ?? 'Factura #' + invoice.id}<br/>${invoice.customerName}<br/>Total: $${invoice.total.toFixed(2)}</p>
    <table>${lines}</table>
    <p style="text-align:center;margin-top:12px">¡Gracias!</p>
    <script>window.print();window.close();</script></body></html>`);
  win.document.close();
}

function sriBadgeClass(status?: string | null) {
  if (!status) return 'badge';
  const normalized = status.toUpperCase();
  if (normalized === 'AUTORIZADO') return 'badge badge--success';
  if (normalized === 'ERROR' || normalized === 'NO AUTORIZADO') return 'badge badge--danger';
  if (normalized === 'DISABLED') return 'badge';
  return 'badge badge--warning';
}

export function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [finalConsumer, setFinalConsumer] = useState(true);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sriConfig, setSriConfig] = useState<SriConfig | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [reissuingId, setReissuingId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [creditNoteInvoiceId, setCreditNoteInvoiceId] = useState<number | null>(null);
  const [cnMotivo, setCnMotivo] = useState('Devolución de productos');
  const [cnRestock, setCnRestock] = useState(true);
  const [cnFull, setCnFull] = useState(true);
  const [cnLines, setCnLines] = useState<Record<number, number>>({});
  const [cnSaving, setCnSaving] = useState(false);
  const [debitNoteInvoiceId, setDebitNoteInvoiceId] = useState<number | null>(null);
  const [dnMotivo, setDnMotivo] = useState('Interés por mora');
  const [dnAmount, setDnAmount] = useState(5);
  const [dnSaving, setDnSaving] = useState(false);
  const [customerFieldErrors, setCustomerFieldErrors] = useState<FieldErrors<CustomerField>>({});

  const load = () => {
    api.getProducts().then(setProducts);
    api.getInvoices().then(setInvoices);
    api.getSriConfig().then(setSriConfig).catch(() => setSriConfig(null));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (finalConsumer) {
      setCustomerResults([]);
      setSelectedCustomerId(null);
      return;
    }
    const query = customerSearch.trim();
    if (query.length < 2) {
      setCustomerResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSearchingCustomers(true);
      api.searchCustomers(query)
        .then(setCustomerResults)
        .catch(() => setCustomerResults([]))
        .finally(() => setSearchingCustomers(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [customerSearch, finalConsumer]);

  const selectCustomer = (item: Customer) => {
    setSelectedCustomerId(item.id);
    setCustomer({
      customerName: item.name,
      customerTaxId: item.taxId,
      customerEmail: item.email ?? '',
      customerAddress: item.address ?? '',
    });
    setCustomerSearch(item.name);
    setCustomerResults([]);
    setCustomerFieldErrors({});
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomerId(null);
    setCustomer(emptyCustomer);
    setCustomerSearch('');
    setCustomerResults([]);
    setCustomerFieldErrors({});
  };

  const updateCustomerField = (field: CustomerField, value: string) => {
    setSelectedCustomerId(null);
    setCustomer((prev) => ({ ...prev, [field]: value }));
    setCustomerFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError('');
  };

  const productById = (id: number | '') =>
    typeof id === 'number' ? products.find((p) => p.id === id) : undefined;

  const total = lines.reduce((sum, line) => {
    const product = productById(line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    setLines(lines.length > 1 ? lines.filter((_, i) => i !== index) : [{ ...emptyLine }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const items = lines
      .filter((line) => line.productId !== '')
      .map((line) => ({ productId: line.productId as number, quantity: line.quantity }));

    if (!items.length) {
      setError('Agrega al menos un producto a la factura.');
      return;
    }
    if (!finalConsumer) {
      const errors: FieldErrors<CustomerField> = {
        customerName: validateRequired(customer.customerName, 'El nombre del cliente'),
        customerTaxId: validateTaxId(customer.customerTaxId),
        customerEmail: validateEmail(customer.customerEmail),
      };
      const filtered = Object.fromEntries(
        Object.entries(errors).filter(([, value]) => value),
      ) as FieldErrors<CustomerField>;
      setCustomerFieldErrors(filtered);
      if (hasFieldErrors(filtered)) return;
    } else {
      setCustomerFieldErrors({});
    }

    setSaving(true);
    try {
      const invoice = await api.createInvoice({
        finalConsumer,
        ...(finalConsumer
          ? {}
          : {
              ...customer,
              customerId: selectedCustomerId ?? undefined,
            }),
        items,
      });
      const sriNote = invoice.sriDocumentNumber
        ? ` · SRI ${invoice.sriDocumentNumber}`
        : invoice.sriStatus
          ? ` · SRI: ${invoice.sriStatus}`
          : '';
      setSuccess(`Factura #${invoice.id} emitida por $${invoice.total.toLocaleString()}${sriNote}`);
      clearSelectedCustomer();
      setLines([{ ...emptyLine }]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la factura');
    } finally {
      setSaving(false);
    }
  };

  const exportInvoices = (format: 'pdf' | 'excel') => {
    if (!invoices.length) {
      setError('No hay facturas para exportar.');
      return;
    }
    const meta = {
      title: 'Reporte de facturación — StockFlow',
      subtitle: `${invoices.length} facturas emitidas`,
      filenameBase: `facturas-stockflow-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, INVOICE_COLUMNS, invoices, STOCKFLOW_THEME);
    else downloadExcel(meta, INVOICE_COLUMNS, invoices, 'Facturas');
  };

  const refreshSri = async (invoiceId: number) => {
    setRefreshingId(invoiceId);
    setError('');
    try {
      await api.refreshInvoiceSri(invoiceId);
      load();
      setSuccess(`Estado SRI actualizado para factura #${invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado SRI');
    } finally {
      setRefreshingId(null);
    }
  };

  const reissueSri = async (invoiceId: number) => {
    setReissuingId(invoiceId);
    setError('');
    try {
      await api.reissueInvoiceSri(invoiceId);
      load();
      setSuccess(`Factura #${invoiceId} reenviada al SRI`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reemitir la factura');
    } finally {
      setReissuingId(null);
    }
  };

  const openCreditNoteForm = (invoice: Invoice) => {
    setCreditNoteInvoiceId(invoice.id);
    setDebitNoteInvoiceId(null);
    setCnMotivo('Devolución de productos');
    setCnRestock(true);
    setCnFull(true);
    const lines: Record<number, number> = {};
    invoice.items.forEach((item) => {
      if (item.id) lines[item.id] = item.quantity;
    });
    setCnLines(lines);
  };

  const submitCreditNote = async (invoice: Invoice) => {
    const motivoError = validateRequired(cnMotivo, 'El motivo');
    if (motivoError) {
      setError(motivoError);
      return;
    }
    setCnSaving(true);
    setError('');
    try {
      const note = await api.createCreditNote({
        invoiceId: invoice.id,
        motivo: cnMotivo.trim(),
        restockStock: cnRestock,
        fullCredit: cnFull,
        items: cnFull
          ? undefined
          : invoice.items
              .filter((item) => item.id && (cnLines[item.id] ?? 0) > 0)
              .map((item) => ({ invoiceItemId: item.id!, quantity: cnLines[item.id!] })),
      });
      setSuccess(
        `Nota de crédito #${note.id} emitida${note.sriDocumentNumber ? ` · ${note.sriDocumentNumber}` : ''}${note.sriStatus ? ` · SRI ${note.sriStatus}` : ''}`,
      );
      setCreditNoteInvoiceId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la nota de crédito');
    } finally {
      setCnSaving(false);
    }
  };

  const openDebitNoteForm = (invoice: Invoice) => {
    setDebitNoteInvoiceId(invoice.id);
    setCreditNoteInvoiceId(null);
    setDnMotivo('Interés por mora');
    setDnAmount(5);
  };

  const submitDebitNote = async (invoice: Invoice) => {
    const motivoError = validateRequired(dnMotivo, 'El motivo');
    const amountError = validatePositiveAmount(dnAmount, 'El monto');
    if (motivoError || amountError) {
      setError(motivoError ?? amountError ?? 'Revisa los datos de la nota de débito');
      return;
    }
    setDnSaving(true);
    setError('');
    try {
      const note = await api.createDebitNote({
        invoiceId: invoice.id,
        items: [{ motivo: dnMotivo.trim(), amount: dnAmount }],
      });
      setSuccess(
        `Nota de débito #${note.id} emitida${note.sriDocumentNumber ? ` · ${note.sriDocumentNumber}` : ''}${note.sriStatus ? ` · SRI ${note.sriStatus}` : ''}`,
      );
      setDebitNoteInvoiceId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la nota de débito');
    } finally {
      setDnSaving(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Facturación</h1>
        </div>
        <div className="header-actions">
          <ExportMenu onExport={exportInvoices} disabled={!invoices.length} />
        </div>
      </header>

      {sriConfig?.configured && (
        <div className="alert alert--success" role="status">
          Facturación electrónica SRI activa vía Datil · {sriConfig.razonSocial} · RUC {sriConfig.ruc}
          · Ambiente {sriConfig.ambiente === 1 ? 'pruebas' : 'producción'}
        </div>
      )}

      {sriConfig?.enabled && !sriConfig.configured && (
        <div className="alert alert--warning" role="status">
          SRI habilitado pero faltan credenciales Datil. Configura el archivo `.env` del backend.
        </div>
      )}

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
          <h2>Nueva factura</h2>
          <FormAlerts error={error} success={success} />

          <span className="form-panel__subtitle">Tipo de cliente</span>
          <div className="segmented">
            <button
              type="button"
              className={finalConsumer ? 'active' : ''}
              onClick={() => setFinalConsumer(true)}
            >
              <Users size={15} /> Consumidor final
            </button>
            <button
              type="button"
              className={!finalConsumer ? 'active' : ''}
              onClick={() => {
                setFinalConsumer(false);
                clearSelectedCustomer();
              }}
            >
              <User size={15} /> Con datos
            </button>
          </div>

          {!finalConsumer && (
            <>
              <span className="form-panel__subtitle">Buscar cliente guardado</span>
              <div className="customer-picker">
                <input
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomerId(null);
                  }}
                  placeholder="Nombre, cédula o RUC…"
                />
                {searchingCustomers && <span className="muted customer-picker__hint">Buscando…</span>}
                {!!customerResults.length && (
                  <ul className="customer-picker__results">
                    {customerResults.map((item) => (
                      <li key={item.id}>
                        <button type="button" onClick={() => selectCustomer(item)}>
                          <strong>{item.name}</strong>
                          <span className="mono">{item.taxId}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedCustomerId && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={clearSelectedCustomer}>
                    Quitar selección
                  </button>
                )}
              </div>

              <span className="form-panel__subtitle">Datos del cliente</span>
              <PanelField
                label="Nombre o razón social"
                value={customer.customerName}
                onChange={(e) => updateCustomerField('customerName', e.target.value)}
                placeholder="Cliente S.A."
                error={customerFieldErrors.customerName}
                required
              />
              <TaxIdField
                value={customer.customerTaxId}
                onChange={(e) => updateCustomerField('customerTaxId', e.target.value)}
                error={customerFieldErrors.customerTaxId}
                required
              />
              <PanelField
                label="Correo (opcional)"
                type="email"
                value={customer.customerEmail}
                onChange={(e) => updateCustomerField('customerEmail', e.target.value)}
                placeholder="cliente@correo.com"
                error={customerFieldErrors.customerEmail}
              />
              <PanelField
                label="Dirección (opcional)"
                value={customer.customerAddress}
                onChange={(e) => updateCustomerField('customerAddress', e.target.value)}
                placeholder="Av. Amazonas y Colón, Quito"
              />
            </>
          )}

          <span className="form-panel__subtitle">Productos</span>
          {lines.map((line, index) => {
            const product = productById(line.productId);
            return (
              <div className="invoice-line" key={index}>
                <select
                  value={line.productId}
                  onChange={(e) =>
                    updateLine(index, { productId: e.target.value ? Number(e.target.value) : '' })
                  }
                  required
                >
                  <option value="">Selecciona un producto…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.name} — ${p.price.toLocaleString()} (stock: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={product?.stock ?? undefined}
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })}
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeLine(index)}
                  aria-label="Quitar línea"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setLines([...lines, { ...emptyLine }])}
          >
            <Plus size={15} /> Agregar producto
          </button>

          <div className="invoice-total">
            <span>Total</span>
            <strong>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Emitiendo…' : 'Emitir factura'}
            </button>
          </div>
        </form>

        <section className="panel">
          <h2>Facturas emitidas</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nº SRI</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th>SRI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <Fragment key={invoice.id}>
                    <tr>
                      <td>{invoice.id}</td>
                      <td className="mono">{invoice.sriDocumentNumber ?? '—'}</td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>
                        {invoice.customerName}
                        {invoice.finalConsumer && <span className="badge" style={{ marginLeft: 8 }}>CF</span>}
                      </td>
                      <td>{invoice.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td>${invoice.total.toLocaleString()}</td>
                      <td>
                        <span className={sriBadgeClass(invoice.sriStatus)}>
                          {invoice.sriStatus ?? '—'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                          aria-label="Ver detalle"
                        >
                          {expandedId === invoice.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === invoice.id && (
                      <tr className="invoice-detail-row">
                        <td colSpan={8}>
                          <div className="invoice-detail-header">
                            <div>
                              <p className="invoice-detail-title">
                                Factura #{invoice.id}
                                {invoice.sriDocumentNumber && (
                                  <span className="invoice-detail-sri-number">{invoice.sriDocumentNumber}</span>
                                )}
                              </p>
                              <p className="muted">
                                {new Date(invoice.createdAt).toLocaleString()}
                                {' · '}${invoice.total.toLocaleString()}
                              </p>
                            </div>
                            <div className="invoice-sri-actions">
                              {canRefreshSri(invoice.sriStatus) && (
                                <button
                                  type="button"
                                  className="btn btn--ghost btn--sm"
                                  disabled={refreshingId === invoice.id}
                                  onClick={() => refreshSri(invoice.id)}
                                >
                                  <RefreshCw size={14} />
                                  {refreshingId === invoice.id ? 'Consultando…' : 'Actualizar SRI'}
                                </button>
                              )}
                              {invoice.canReissueSri && (
                                <button
                                  type="button"
                                  className="btn btn--ghost btn--sm"
                                  disabled={reissuingId === invoice.id}
                                  onClick={() => reissueSri(invoice.id)}
                                >
                                  <RotateCcw size={14} />
                                  {reissuingId === invoice.id ? 'Reemitiendo…' : 'Reemitir'}
                                </button>
                              )}
                              {canDownloadRide(invoice) && (
                                <>
                                <a
                                  className="btn btn--ghost btn--sm"
                                  href={ridePdfUrl(invoice)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink size={14} /> Ver RIDE (PDF)
                                </a>
                                <button type="button" className="btn btn--ghost btn--sm" onClick={() => printThermalTicket(invoice)}>
                                  Ticket 80mm
                                </button>
                                </>
                              )}
                              {invoice.sriStatus?.toUpperCase() === 'AUTORIZADO' && !invoice.finalConsumer && (
                                <button
                                  type="button"
                                  className="btn btn--ghost btn--sm"
                                  onClick={() =>
                                    creditNoteInvoiceId === invoice.id
                                      ? setCreditNoteInvoiceId(null)
                                      : openCreditNoteForm(invoice)
                                  }
                                >
                                  Nota de crédito
                                </button>
                              )}
                              {invoice.sriStatus?.toUpperCase() === 'AUTORIZADO' && (
                                <button
                                  type="button"
                                  className="btn btn--ghost btn--sm"
                                  onClick={() =>
                                    debitNoteInvoiceId === invoice.id
                                      ? setDebitNoteInvoiceId(null)
                                      : openDebitNoteForm(invoice)
                                  }
                                >
                                  Nota de débito
                                </button>
                              )}
                              {invoice.sriStatus?.toUpperCase() === 'AUTORIZADO' && (
                                <Link
                                  className="btn btn--ghost btn--sm"
                                  to={`/guias-remision?invoiceId=${invoice.id}`}
                                >
                                  <Truck size={14} /> Guía de remisión
                                </Link>
                              )}
                            </div>
                          </div>

                          {!invoice.finalConsumer && (
                            <p className="invoice-customer-data">
                              <strong>{invoice.customerName}</strong>
                              {invoice.customerTaxId && <> · {invoice.customerTaxId}</>}
                              {invoice.customerEmail && <> · {invoice.customerEmail}</>}
                              {invoice.customerAddress && <> · {invoice.customerAddress}</>}
                            </p>
                          )}
                          {(invoice.sriAccessKey || invoice.sriAuthorizationNumber || invoice.sriErrorMessage || invoice.sriSecuencial) && (
                            <div className="invoice-sri-meta">
                              {invoice.sriSecuencial && <p><strong>Secuencial:</strong> {invoice.sriSecuencial}</p>}
                              {invoice.sriAccessKey && (
                                <p className="invoice-access-key">
                                  <strong>Clave de acceso:</strong> {invoice.sriAccessKey}
                                </p>
                              )}
                              {invoice.sriAuthorizationNumber && (
                                <p><strong>Autorización:</strong> {invoice.sriAuthorizationNumber}</p>
                              )}
                              {invoice.sriXmlUrl && (
                                <p>
                                  <a href={invoice.sriXmlUrl} target="_blank" rel="noopener noreferrer">
                                    Descargar XML
                                  </a>
                                </p>
                              )}
                              {invoice.sriErrorMessage && (
                                <p className="invoice-sri-error"><strong>Error SRI:</strong> {invoice.sriErrorMessage}</p>
                              )}
                            </div>
                          )}
                          <table className="invoice-detail">
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th>Cantidad</th>
                                <th>Precio unit.</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoice.items.map((item, i) => (
                                <tr key={i}>
                                  <td>{item.productName}</td>
                                  <td>{item.sku}</td>
                                  <td>{item.quantity}</td>
                                  <td>${item.unitPrice.toLocaleString()}</td>
                                  <td>${item.subtotal.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {creditNoteInvoiceId === invoice.id && (
                            <div className="credit-note-form panel" style={{ marginTop: 16 }}>
                              <h3>Emitir nota de crédito</h3>
                              <PanelField
                                label="Motivo"
                                value={cnMotivo}
                                onChange={(e) => setCnMotivo(e.target.value)}
                                hint="Ej. Devolución de productos, error en facturación"
                                required
                              />
                              <label className="checkbox-row">
                                <input
                                  type="checkbox"
                                  checked={cnRestock}
                                  onChange={(e) => setCnRestock(e.target.checked)}
                                />
                                Reintegrar stock al inventario
                              </label>
                              <label className="checkbox-row">
                                <input
                                  type="checkbox"
                                  checked={cnFull}
                                  onChange={(e) => setCnFull(e.target.checked)}
                                />
                                Nota de crédito total (todos los ítems)
                              </label>
                              {!cnFull && (
                                <table className="invoice-detail">
                                  <thead>
                                    <tr>
                                      <th>Producto</th>
                                      <th>Máx.</th>
                                      <th>Cantidad NC</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoice.items.map((item) =>
                                      item.id ? (
                                        <tr key={item.id}>
                                          <td>{item.productName}</td>
                                          <td>{item.quantity}</td>
                                          <td>
                                            <input
                                              type="number"
                                              min={0}
                                              max={item.quantity}
                                              value={cnLines[item.id] ?? 0}
                                              onChange={(e) =>
                                                setCnLines({
                                                  ...cnLines,
                                                  [item.id!]: Math.max(
                                                    0,
                                                    Math.min(item.quantity, Number(e.target.value)),
                                                  ),
                                                })
                                              }
                                            />
                                          </td>
                                        </tr>
                                      ) : null,
                                    )}
                                  </tbody>
                                </table>
                              )}
                              <div className="form-actions">
                                <button
                                  type="button"
                                  className="btn btn--primary"
                                  disabled={cnSaving}
                                  onClick={() => submitCreditNote(invoice)}
                                >
                                  {cnSaving ? 'Emitiendo NC…' : 'Emitir nota de crédito'}
                                </button>
                              </div>
                            </div>
                          )}

                          {debitNoteInvoiceId === invoice.id && (
                            <div className="credit-note-form panel" style={{ marginTop: 16 }}>
                              <h3>Emitir nota de débito</h3>
                              <PanelField
                                label="Motivo del cargo"
                                value={dnMotivo}
                                onChange={(e) => setDnMotivo(e.target.value)}
                                hint="Ej. Interés por mora, gastos administrativos"
                                required
                              />
                              <PanelField
                                label="Monto adicional (USD)"
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={dnAmount}
                                onChange={(e) => setDnAmount(Number(e.target.value))}
                                required
                              />
                              <div className="form-actions">
                                <button
                                  type="button"
                                  className="btn btn--primary"
                                  disabled={dnSaving}
                                  onClick={() => submitDebitNote(invoice)}
                                >
                                  {dnSaving ? 'Emitiendo ND…' : 'Emitir nota de débito'}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!invoices.length && (
                  <tr><td colSpan={8} className="muted">Aún no hay facturas. Emite la primera desde el formulario.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
