import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Receipt } from 'lucide-react';
import { api, type Product, type Proforma } from '../api';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';

interface Line { productId: number | ''; quantity: number }

export function ProformasPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [finalConsumer, setFinalConsumer] = useState(true);
  const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [lineError, setLineError] = useState('');

  const load = () => api.getProformas().then(setProformas);

  useEffect(() => {
    load();
    api.getProducts().then(setProducts);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLineError('');
    const valid = lines.filter((l) => l.productId && l.quantity > 0);
    if (!valid.length) {
      setLineError('Agrega al menos un producto con cantidad mayor a cero.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.createProforma({
        finalConsumer,
        items: valid.map((l) => ({ productId: Number(l.productId), quantity: l.quantity })),
      });
      setSuccess('Proforma creada (sin SRI).');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la proforma');
    } finally {
      setSaving(false);
    }
  };

  const convert = async (id: number) => {
    setError('');
    try {
      const result = await api.convertProforma(id);
      setSuccess(`Proforma convertida → factura #${result.convertedInvoiceId}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Proformas</h1>
        </div>
      </header>
      <FormAlerts error={error} success={success} />

      <div className="split">
        <form className="panel form-panel" onSubmit={submit} noValidate>
          <h2>Nueva proforma</h2>
          <p className="muted">Cotización sin validez tributaria. Conviértela en factura cuando el cliente confirme.</p>
          <label className="checkbox">
            <input type="checkbox" checked={finalConsumer} onChange={(e) => setFinalConsumer(e.target.checked)} />
            Consumidor final
          </label>
          {lineError && <div className="alert alert--error" role="alert">{lineError}</div>}
          {lines.map((line, index) => (
            <div className="form-row" key={index}>
              <PanelField
                as="select"
                label="Producto"
                value={line.productId}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...line, productId: e.target.value ? Number(e.target.value) : '' };
                  setLines(next);
                  setLineError('');
                }}
              >
                <option value="">Seleccionar…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </PanelField>
              <PanelField
                label="Cant."
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...line, quantity: Number(e.target.value) };
                  setLines(next);
                  setLineError('');
                }}
              />
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines([...lines, { productId: '', quantity: 1 }])}>+ línea</button>
          <button type="submit" className="btn btn--primary" disabled={saving} style={{ marginTop: 12 }}>
            <FileText size={16} /> Guardar proforma
          </button>
        </form>

        <section className="panel">
          <h2>Listado</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {proformas.length === 0 ? (
                  <tr><td colSpan={5} className="muted">Sin proformas.</td></tr>
                ) : proformas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.customerName}</td>
                    <td>${p.total.toFixed(2)}</td>
                    <td>{p.status}</td>
                    <td>
                      {p.status === 'DRAFT' && (
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => convert(p.id)}>
                          <Receipt size={14} /> Facturar
                        </button>
                      )}
                      {p.convertedInvoiceId && (
                        <Link to="/facturacion">Factura #{p.convertedInvoiceId}</Link>
                      )}
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
