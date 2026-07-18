import { FormEvent, Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw, RotateCcw, Truck } from 'lucide-react';
import { api, type Invoice, type Product, type Waybill } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { SriStatusBadge } from '../components/ui/SriStatusBadge';
import { TaxIdField } from '../components/ui/TaxIdField';
import {
  type FieldErrors,
  hasFieldErrors,
  validatePositiveAmount,
  validateRequired,
  validateTaxId,
} from '../utils/validation';

type WaybillField =
  | 'direccionPartida'
  | 'motivoTraslado'
  | 'carrierName'
  | 'carrierTaxId'
  | 'carrierPlate'
  | 'recipientName'
  | 'recipientTaxId'
  | 'recipientAddress'
  | 'selectedProductId'
  | 'quantity';

function ridePdfUrl(waybill: Waybill) {
  if (waybill.sriRidePdfUrl) return waybill.sriRidePdfUrl;
  if (waybill.datilWaybillId) return `https://app.datil.co/ver/${waybill.datilWaybillId}/pdf`;
  return null;
}

export function WaybillsPage() {
  const [searchParams] = useSearchParams();
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [reissuingId, setReissuingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [invoiceId, setInvoiceId] = useState<number | ''>('');
  const [direccionPartida, setDireccionPartida] = useState('');
  const [motivoTraslado, setMotivoTraslado] = useState('Entrega de mercadería');
  const [ruta, setRuta] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [carrierTaxId, setCarrierTaxId] = useState('');
  const [carrierPlate, setCarrierPlate] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTaxId, setRecipientTaxId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<WaybillField>>({});

  const load = () => api.getWaybills().then(setWaybills);

  useEffect(() => {
    load();
    api.getProducts().then(setProducts);
    api.getInvoices().then((list) => {
      setInvoices(list.filter((inv) => inv.sriStatus?.toUpperCase() === 'AUTORIZADO'));
    });
  }, []);

  useEffect(() => {
    const param = searchParams.get('invoiceId');
    if (!param) return;
    const id = Number(param);
    if (!Number.isFinite(id)) return;
    setInvoiceId(id);
    const invoice = invoices.find((item) => item.id === id);
    if (invoice) applyInvoice(invoice);
  }, [searchParams, invoices]);

  const applyInvoice = (invoice: Invoice) => {
    if (!invoice.finalConsumer) {
      setRecipientName(invoice.customerName);
      setRecipientTaxId(invoice.customerTaxId ?? '');
      setRecipientAddress(invoice.customerAddress ?? 'Quito');
    }
    if (invoice.items.length && selectedProductId === '') {
      const first = invoice.items[0];
      if (first.productId) {
        setSelectedProductId(first.productId);
        setQuantity(first.quantity);
      }
    }
  };

  const onInvoiceChange = (value: string) => {
    if (!value) {
      setInvoiceId('');
      return;
    }
    const id = Number(value);
    setInvoiceId(id);
    const invoice = invoices.find((item) => item.id === id);
    if (invoice) applyInvoice(invoice);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errors: FieldErrors<WaybillField> = {
      direccionPartida: validateRequired(direccionPartida, 'La dirección de partida'),
      motivoTraslado: validateRequired(motivoTraslado, 'El motivo de traslado'),
      carrierName: validateRequired(carrierName, 'El nombre del transportista'),
      carrierTaxId: validateTaxId(carrierTaxId),
      carrierPlate: validateRequired(carrierPlate, 'La placa'),
      recipientName: validateRequired(recipientName, 'El nombre del destinatario'),
      recipientTaxId: validateTaxId(recipientTaxId),
      recipientAddress: validateRequired(recipientAddress, 'La dirección del destinatario'),
      selectedProductId: selectedProductId ? undefined : 'Selecciona un producto a transportar',
      quantity: validatePositiveAmount(quantity, 'La cantidad'),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<WaybillField>;
    setFieldErrors(filtered);
    if (hasFieldErrors(filtered)) return;

    setSaving(true);
    try {
      const note = await api.createWaybill({
        invoiceId: invoiceId === '' ? undefined : invoiceId,
        direccionPartida: direccionPartida.trim(),
        motivoTraslado: motivoTraslado.trim(),
        ruta: ruta.trim() || undefined,
        carrierName: carrierName.trim(),
        carrierTaxId: carrierTaxId.trim(),
        carrierPlate: carrierPlate.trim(),
        recipientName: recipientName.trim(),
        recipientTaxId: recipientTaxId.trim(),
        recipientAddress: recipientAddress.trim(),
        items: [{ productId: Number(selectedProductId), quantity }],
      });
      setSuccess(
        `Guía #${note.id} emitida${note.sriDocumentNumber ? ` · ${note.sriDocumentNumber}` : ''}${note.sriStatus ? ` · SRI ${note.sriStatus}` : ''}`,
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la guía');
    } finally {
      setSaving(false);
    }
  };

  const refreshSri = async (id: number) => {
    setRefreshingId(id);
    setError('');
    try {
      await api.refreshWaybillSri(id);
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
      await api.reissueWaybillSri(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reemitir la guía');
    } finally {
      setReissuingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Logística</p>
          <h1>Guías de remisión</h1>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      <section className="panel form-panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Nueva guía de remisión</h2>
        <form onSubmit={submit} noValidate>
          <PanelField
            as="select"
            label="Factura vinculada (opcional)"
            value={invoiceId}
            onChange={(e) => onInvoiceChange(e.target.value)}
            hint="Al vincular una factura autorizada se autocompletan datos del destinatario."
          >
            <option value="">Sin factura</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.sriDocumentNumber ?? `#${inv.id}`} — {inv.customerName}
              </option>
            ))}
          </PanelField>
          <PanelField
            label="Dirección de partida"
            value={direccionPartida}
            onChange={(e) => {
              setDireccionPartida(e.target.value);
              setFieldErrors((prev) => ({ ...prev, direccionPartida: undefined }));
            }}
            error={fieldErrors.direccionPartida}
            required
          />
          <PanelField
            label="Motivo de traslado"
            value={motivoTraslado}
            onChange={(e) => {
              setMotivoTraslado(e.target.value);
              setFieldErrors((prev) => ({ ...prev, motivoTraslado: undefined }));
            }}
            error={fieldErrors.motivoTraslado}
            required
          />
          <PanelField
            label="Ruta (opcional)"
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            placeholder="Ej. Quito - Guayaquil"
          />
          <fieldset className="credit-note-form" style={{ marginTop: 12 }}>
            <legend>Transportista</legend>
            <PanelField
              label="Nombre"
              value={carrierName}
              onChange={(e) => {
                setCarrierName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, carrierName: undefined }));
              }}
              error={fieldErrors.carrierName}
              required
            />
            <TaxIdField
              label="Cédula/RUC"
              value={carrierTaxId}
              onChange={(e) => {
                setCarrierTaxId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, carrierTaxId: undefined }));
              }}
              error={fieldErrors.carrierTaxId}
              required
            />
            <PanelField
              label="Placa"
              value={carrierPlate}
              onChange={(e) => {
                setCarrierPlate(e.target.value);
                setFieldErrors((prev) => ({ ...prev, carrierPlate: undefined }));
              }}
              error={fieldErrors.carrierPlate}
              required
            />
          </fieldset>
          <fieldset className="credit-note-form" style={{ marginTop: 12 }}>
            <legend>Destinatario</legend>
            <PanelField
              label="Nombre"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, recipientName: undefined }));
              }}
              error={fieldErrors.recipientName}
              required
            />
            <TaxIdField
              label="Cédula/RUC"
              value={recipientTaxId}
              onChange={(e) => {
                setRecipientTaxId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, recipientTaxId: undefined }));
              }}
              error={fieldErrors.recipientTaxId}
              required
            />
            <PanelField
              label="Dirección"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setFieldErrors((prev) => ({ ...prev, recipientAddress: undefined }));
              }}
              error={fieldErrors.recipientAddress}
              required
            />
          </fieldset>
          <div className="form-row" style={{ marginTop: 12 }}>
            <PanelField
              as="select"
              label="Producto"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value ? Number(e.target.value) : '');
                setFieldErrors((prev) => ({ ...prev, selectedProductId: undefined }));
              }}
              error={fieldErrors.selectedProductId}
              required
            >
              <option value="">Seleccionar…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </PanelField>
            <PanelField
              label="Cantidad"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setFieldErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              error={fieldErrors.quantity}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              <Truck size={16} /> {saving ? 'Emitiendo…' : 'Emitir guía de remisión'}
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
                <th>Factura</th>
                <th>Destinatario</th>
                <th>Motivo</th>
                <th>SRI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {waybills.map((waybill) => (
                <Fragment key={waybill.id}>
                  <tr>
                    <td>{waybill.id}</td>
                    <td className="mono">{waybill.sriDocumentNumber ?? '—'}</td>
                    <td className="mono">{waybill.invoiceDocumentNumber ?? '—'}</td>
                    <td>{waybill.recipientName}</td>
                    <td>{waybill.motivoTraslado}</td>
                    <td><SriStatusBadge status={waybill.sriStatus} /></td>
                    <td className="actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setExpandedId(expandedId === waybill.id ? null : waybill.id)}>
                        {expandedId === waybill.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === waybill.id && (
                    <tr className="invoice-detail-row">
                      <td colSpan={7}>
                        <div className="invoice-detail-header">
                          <div>
                            <p className="invoice-detail-title">
                              Guía #{waybill.id}
                              {waybill.sriDocumentNumber && <span className="invoice-detail-sri-number">{waybill.sriDocumentNumber}</span>}
                            </p>
                            <p className="muted">
                              {waybill.direccionPartida}
                              {waybill.ruta ? ` · ${waybill.ruta}` : ''}
                              {waybill.carrierPlate ? ` · Placa ${waybill.carrierPlate}` : ''}
                            </p>
                          </div>
                          <div className="invoice-sri-actions">
                            {waybill.sriStatus && waybill.sriStatus !== 'AUTORIZADO' && waybill.sriStatus !== 'DISABLED' && (
                              <button type="button" className="btn btn--ghost btn--sm" disabled={refreshingId === waybill.id} onClick={() => refreshSri(waybill.id)}>
                                <RefreshCw size={14} /> {refreshingId === waybill.id ? 'Consultando…' : 'Actualizar SRI'}
                              </button>
                            )}
                            {waybill.canReissueSri && (
                              <button type="button" className="btn btn--ghost btn--sm" disabled={reissuingId === waybill.id} onClick={() => reissueSri(waybill.id)}>
                                <RotateCcw size={14} /> {reissuingId === waybill.id ? 'Reemitiendo…' : 'Reemitir'}
                              </button>
                            )}
                            {waybill.sriStatus === 'AUTORIZADO' && ridePdfUrl(waybill) && (
                              <a className="btn btn--ghost btn--sm" href={ridePdfUrl(waybill)!} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} /> Ver RIDE (PDF)
                              </a>
                            )}
                          </div>
                        </div>
                        {waybill.sriErrorMessage && <p className="invoice-sri-error"><strong>Error SRI:</strong> {waybill.sriErrorMessage}</p>}
                        <table className="invoice-detail">
                          <thead><tr><th>Producto</th><th>SKU</th><th>Cantidad</th></tr></thead>
                          <tbody>
                            {waybill.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.productName}</td>
                                <td>{item.sku ?? '—'}</td>
                                <td>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!waybills.length && <tr><td colSpan={7} className="muted">Aún no hay guías de remisión.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
