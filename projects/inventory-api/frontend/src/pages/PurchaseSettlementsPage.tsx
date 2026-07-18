import { FormEvent, Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Plus, RefreshCw, RotateCcw, ShoppingCart, Trash2 } from 'lucide-react';
import { api, type Product, type PurchaseSettlement, type Supplier } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { SriStatusBadge } from '../components/ui/SriStatusBadge';
import { validatePositiveAmount } from '../utils/validation';

interface Line {
  productId: number | '';
  description: string;
  quantity: number;
  unitPrice: number;
}

const emptyLine: Line = { productId: '', description: '', quantity: 1, unitPrice: 0 };

function ridePdfUrl(settlement: PurchaseSettlement) {
  if (settlement.sriRidePdfUrl) return settlement.sriRidePdfUrl;
  if (settlement.datilPurchaseSettlementId) {
    return `https://app.datil.co/ver/${settlement.datilPurchaseSettlementId}/pdf`;
  }
  return null;
}

export function PurchaseSettlementsPage() {
  const [settlements, setSettlements] = useState<PurchaseSettlement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [reissuingId, setReissuingId] = useState<number | null>(null);
  const [supplierError, setSupplierError] = useState<string | undefined>();
  const [lineErrors, setLineErrors] = useState<Record<number, string | undefined>>({});

  const load = () => api.getPurchaseSettlements().then(setSettlements);

  useEffect(() => {
    load();
    api.getSuppliers().then(setSuppliers);
    api.getProducts().then(setProducts);
  }, []);

  const onProductChange = (index: number, productId: string) => {
    const next = [...lines];
    if (!productId) {
      next[index] = { ...next[index], productId: '' };
    } else {
      const product = products.find((p) => p.id === Number(productId));
      next[index] = {
        ...next[index],
        productId: Number(productId),
        description: product?.name ?? next[index].description,
        unitPrice: product?.price ?? next[index].unitPrice,
      };
    }
    setLines(next);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSupplierError(supplierId ? undefined : 'Selecciona un proveedor');

    const nextLineErrors: Record<number, string | undefined> = {};
    lines.forEach((line, index) => {
      const hasProduct = line.productId !== '';
      const hasDescription = !!line.description.trim();
      const qtyError = validatePositiveAmount(line.quantity, 'La cantidad');
      const priceError = validatePositiveAmount(line.unitPrice, 'El precio unitario');
      if (!hasProduct && !hasDescription) {
        nextLineErrors[index] = 'Selecciona producto o ingresa descripción';
      } else if (qtyError || priceError) {
        nextLineErrors[index] = qtyError ?? priceError;
      }
    });
    setLineErrors(nextLineErrors);

    const validLines = lines.filter(
      (line) => line.quantity > 0 && line.unitPrice > 0 && (line.productId !== '' || line.description.trim()),
    );
    if (!supplierId || !validLines.length || Object.keys(nextLineErrors).length) {
      if (!validLines.length && !Object.keys(nextLineErrors).length) {
        setError('Agrega al menos un ítem con cantidad y precio.');
      }
      return;
    }

    setSaving(true);
    try {
      const result = await api.createPurchaseSettlement({
        supplierId: Number(supplierId),
        items: validLines.map((line) => ({
          productId: line.productId === '' ? undefined : line.productId,
          description: line.description.trim() || undefined,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });
      setSuccess(
        `Liquidación #${result.id} emitida${result.sriDocumentNumber ? ` · ${result.sriDocumentNumber}` : ''}${result.sriStatus ? ` · SRI ${result.sriStatus}` : ''}`,
      );
      setLines([{ ...emptyLine }]);
      load();
      api.getSuppliers().then(setSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir la liquidación');
    } finally {
      setSaving(false);
    }
  };

  const refreshSri = async (id: number) => {
    setRefreshingId(id);
    setError('');
    try {
      await api.refreshPurchaseSettlementSri(id);
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
      await api.reissuePurchaseSettlementSri(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reemitir la liquidación');
    } finally {
      setReissuingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Compras</p>
          <h1>Liquidaciones de compra</h1>
        </div>
      </header>

      <FormAlerts error={error} success={success} />

      <section className="panel form-panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Nueva liquidación de compra</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Documenta compras a proveedores sin RUC o régimen simplificado. IVA 0% según normativa SRI.
        </p>
        {!suppliers.length && (
          <div className="alert alert--warning" role="status" style={{ marginBottom: 12 }}>
            Primero crea un proveedor en Compras → Proveedores.
          </div>
        )}
        <form onSubmit={submit} noValidate>
          <PanelField
            as="select"
            label="Proveedor"
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value ? Number(e.target.value) : '');
              setSupplierError(undefined);
            }}
            error={supplierError}
            required
          >
            <option value="">Seleccionar proveedor…</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} ({supplier.taxId})
              </option>
            ))}
          </PanelField>

          <h3>Ítems</h3>
          {lines.map((line, index) => (
            <div key={index}>
              <div className="form-row" style={{ alignItems: 'end' }}>
                <PanelField
                  as="select"
                  label="Producto (opcional)"
                  value={line.productId}
                  onChange={(e) => {
                    onProductChange(index, e.target.value);
                    setLineErrors((prev) => ({ ...prev, [index]: undefined }));
                  }}
                >
                  <option value="">Manual</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </PanelField>
                <PanelField
                  label="Descripción"
                  value={line.description}
                  onChange={(e) => {
                    const next = [...lines];
                    next[index] = { ...next[index], description: e.target.value };
                    setLines(next);
                    setLineErrors((prev) => ({ ...prev, [index]: undefined }));
                  }}
                  placeholder="Ej. Materia prima"
                />
                <PanelField
                  label="Cantidad"
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => {
                    const next = [...lines];
                    next[index] = { ...next[index], quantity: Number(e.target.value) };
                    setLines(next);
                    setLineErrors((prev) => ({ ...prev, [index]: undefined }));
                  }}
                />
                <PanelField
                  label="Precio unit."
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={line.unitPrice}
                  onChange={(e) => {
                    const next = [...lines];
                    next[index] = { ...next[index], unitPrice: Number(e.target.value) };
                    setLines(next);
                    setLineErrors((prev) => ({ ...prev, [index]: undefined }));
                  }}
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setLines(lines.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {lineErrors[index] && (
                <span className="panel-field__error" role="alert">{lineErrors[index]}</span>
              )}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines([...lines, { ...emptyLine }])}>
            <Plus size={14} /> Agregar ítem
          </button>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving || !suppliers.length}>
              <ShoppingCart size={16} /> {saving ? 'Emitiendo…' : 'Emitir liquidación de compra'}
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
                <th>Total</th>
                <th>SRI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement) => (
                <Fragment key={settlement.id}>
                  <tr>
                    <td>{settlement.id}</td>
                    <td className="mono">{settlement.sriDocumentNumber ?? '—'}</td>
                    <td>{settlement.supplierName}</td>
                    <td>${settlement.total.toLocaleString()}</td>
                    <td><SriStatusBadge status={settlement.sriStatus} /></td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setExpandedId(expandedId === settlement.id ? null : settlement.id)}
                      >
                        {expandedId === settlement.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === settlement.id && (
                    <tr className="invoice-detail-row">
                      <td colSpan={6}>
                        <div className="invoice-detail-header">
                          <div>
                            <p className="invoice-detail-title">
                              Liquidación #{settlement.id}
                              {settlement.sriDocumentNumber && (
                                <span className="invoice-detail-sri-number">{settlement.sriDocumentNumber}</span>
                              )}
                            </p>
                            <p className="muted">{settlement.supplierName} · {settlement.supplierTaxId}</p>
                          </div>
                          <div className="invoice-sri-actions">
                            {settlement.sriStatus && settlement.sriStatus !== 'AUTORIZADO' && settlement.sriStatus !== 'DISABLED' && (
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                disabled={refreshingId === settlement.id}
                                onClick={() => refreshSri(settlement.id)}
                              >
                                <RefreshCw size={14} /> {refreshingId === settlement.id ? 'Consultando…' : 'Actualizar SRI'}
                              </button>
                            )}
                            {settlement.canReissueSri && (
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                disabled={reissuingId === settlement.id}
                                onClick={() => reissueSri(settlement.id)}
                              >
                                <RotateCcw size={14} /> {reissuingId === settlement.id ? 'Reemitiendo…' : 'Reemitir'}
                              </button>
                            )}
                            {settlement.sriStatus === 'AUTORIZADO' && ridePdfUrl(settlement) && (
                              <a className="btn btn--ghost btn--sm" href={ridePdfUrl(settlement)!} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} /> Ver RIDE (PDF)
                              </a>
                            )}
                          </div>
                        </div>
                        {settlement.sriErrorMessage && (
                          <p className="invoice-sri-error"><strong>Error SRI:</strong> {settlement.sriErrorMessage}</p>
                        )}
                        <table className="invoice-detail">
                          <thead>
                            <tr><th>Descripción</th><th>SKU</th><th>Cantidad</th><th>P. unit.</th><th>Subtotal</th></tr>
                          </thead>
                          <tbody>
                            {settlement.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.description}</td>
                                <td>{item.sku ?? '—'}</td>
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
              {!settlements.length && (
                <tr><td colSpan={6} className="muted">Aún no hay liquidaciones de compra.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
