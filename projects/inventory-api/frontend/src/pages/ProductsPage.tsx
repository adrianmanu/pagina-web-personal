import { FormEvent, useEffect, useState } from 'react';
import { Check, PackagePlus, X } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { api, type Product } from '../api';

const emptyForm = { name: '', sku: '', stock: 0, price: 0, category: '' };

const STOCKFLOW_THEME = { accentRgb: [244, 63, 94] as [number, number, number] };

const PRODUCT_COLUMNS: ExportColumn<Product>[] = [
  { header: 'Nombre', value: (item) => item.name },
  { header: 'SKU', value: (item) => item.sku },
  { header: 'Stock', value: (item) => item.stock },
  { header: 'Precio', value: (item) => item.price },
  { header: 'Categoría', value: (item) => item.category },
];

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [stockId, setStockId] = useState<number | null>(null);
  const [stockQty, setStockQty] = useState(1);

  const load = () => api.getProducts().then(setItems);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateProduct(editingId, form);
      } else {
        await api.createProduct(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    }
  };

  const handleEdit = (item: Product) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      stock: item.stock,
      price: item.price,
      category: item.category,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.deleteProduct(id);
    load();
  };

  const handleAddStock = async (id: number) => {
    setError('');
    try {
      await api.addStock(id, stockQty);
      setStockId(null);
      setStockQty(1);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el stock');
    }
  };

  const exportProducts = (format: 'pdf' | 'excel') => {
    if (!items.length) {
      setError('No hay productos para exportar.');
      return;
    }
    const meta = {
      title: 'Inventario de productos — StockFlow',
      subtitle: `${items.length} productos registrados`,
      filenameBase: `inventario-stockflow-${new Date().toISOString().slice(0, 10)}`,
    };
    if (format === 'pdf') downloadPdf(meta, PRODUCT_COLUMNS, items, STOCKFLOW_THEME);
    else downloadExcel(meta, PRODUCT_COLUMNS, items, 'Productos');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">CRUD</p>
          <h1>Productos</h1>
        </div>
        <div className="header-actions">
          <ExportMenu onExport={exportProducts} disabled={!items.length} />
        </div>
      </header>

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
          {error && <div className="alert alert--error" role="alert">{error}</div>}
          <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></label>
          <label>Stock<input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required /></label>
          <label>Precio<input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></label>
          <label>Categoría<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">{editingId ? 'Actualizar' : 'Crear'}</button>
            {editingId && (
              <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(emptyForm); setError(''); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="panel">
          <h2>Inventario</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Stock</th><th>Precio</th><th>Categoría</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>
                      <span className={`badge ${item.stock === 0 ? 'badge--failed' : item.stock < 5 ? 'badge--running' : 'badge--ok'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>{item.category}</td>
                    <td className="actions">
                      {stockId === item.id ? (
                        <span className="stock-inline">
                          <input
                            type="number"
                            min={1}
                            value={stockQty}
                            onChange={(e) => setStockQty(Math.max(1, Number(e.target.value)))}
                            aria-label="Cantidad a agregar"
                            autoFocus
                          />
                          <button type="button" className="btn btn--primary btn--sm" onClick={() => handleAddStock(item.id)} aria-label="Confirmar">
                            <Check size={15} />
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setStockId(null); setStockQty(1); }} aria-label="Cancelar">
                            <X size={15} />
                          </button>
                        </span>
                      ) : (
                        <>
                          <button type="button" className="btn btn--secondary btn--sm" onClick={() => { setStockId(item.id); setStockQty(1); }}>
                            <PackagePlus size={15} /> Stock
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEdit(item)}>Editar</button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(item.id)}>Eliminar</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan={6} className="muted">No hay productos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
