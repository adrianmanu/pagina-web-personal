import { FormEvent, Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, User, Users } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { api, type Invoice, type Product } from '../api/client';

interface Line {
  productId: number | '';
  quantity: number;
}

const emptyLine: Line = { productId: '', quantity: 1 };
const emptyCustomer = { customerName: '', customerTaxId: '', customerEmail: '', customerAddress: '' };

const STOCKFLOW_THEME = { accentRgb: [244, 63, 94] as [number, number, number] };

const INVOICE_COLUMNS: ExportColumn<Invoice>[] = [
  { header: 'Factura', value: (inv) => `#${inv.id}` },
  { header: 'Cliente', value: (inv) => inv.customerName },
  { header: 'Tipo', value: (inv) => (inv.finalConsumer ? 'Consumidor final' : 'Con datos') },
  { header: 'Ítems', value: (inv) => inv.items.length },
  { header: 'Total', value: (inv) => inv.total },
  { header: 'Fecha', value: (inv) => new Date(inv.createdAt).toLocaleString() },
];

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

  const load = () => {
    api.getProducts().then(setProducts);
    api.getInvoices().then(setInvoices);
  };
  useEffect(() => { load(); }, []);

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
      if (!customer.customerName.trim()) {
        setError('Ingresa el nombre del cliente.');
        return;
      }
      if (!customer.customerTaxId.trim()) {
        setError('Ingresa la cédula o RUC del cliente.');
        return;
      }
    }

    setSaving(true);
    try {
      const invoice = await api.createInvoice({
        finalConsumer,
        ...(finalConsumer ? {} : customer),
        items,
      });
      setSuccess(`Factura #${invoice.id} emitida por $${invoice.total.toLocaleString()}`);
      setCustomer(emptyCustomer);
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

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>Nueva factura</h2>
          {error && <div className="alert alert--error" role="alert">{error}</div>}
          {success && <div className="alert alert--success" role="status">{success}</div>}

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
              onClick={() => setFinalConsumer(false)}
            >
              <User size={15} /> Con datos
            </button>
          </div>

          {!finalConsumer && (
            <>
              <label>
                Nombre o razón social
                <input
                  value={customer.customerName}
                  onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                  placeholder="Cliente S.A."
                  required
                />
              </label>
              <label>
                Cédula / RUC
                <input
                  value={customer.customerTaxId}
                  onChange={(e) => setCustomer({ ...customer, customerTaxId: e.target.value })}
                  placeholder="1712345678001"
                  required
                />
              </label>
              <label>
                Correo (opcional)
                <input
                  type="email"
                  value={customer.customerEmail}
                  onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })}
                  placeholder="cliente@correo.com"
                />
              </label>
              <label>
                Dirección (opcional)
                <input
                  value={customer.customerAddress}
                  onChange={(e) => setCustomer({ ...customer, customerAddress: e.target.value })}
                  placeholder="Av. Amazonas y Colón, Quito"
                />
              </label>
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
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <Fragment key={invoice.id}>
                    <tr>
                      <td>{invoice.id}</td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>
                        {invoice.customerName}
                        {invoice.finalConsumer && <span className="badge" style={{ marginLeft: 8 }}>CF</span>}
                      </td>
                      <td>{invoice.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td>${invoice.total.toLocaleString()}</td>
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
                        <td colSpan={6}>
                          {!invoice.finalConsumer && (
                            <p className="invoice-customer-data">
                              <strong>{invoice.customerName}</strong>
                              {invoice.customerTaxId && <> · {invoice.customerTaxId}</>}
                              {invoice.customerEmail && <> · {invoice.customerEmail}</>}
                              {invoice.customerAddress && <> · {invoice.customerAddress}</>}
                            </p>
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!invoices.length && (
                  <tr><td colSpan={6} className="muted">Aún no hay facturas. Emite la primera desde el formulario.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
