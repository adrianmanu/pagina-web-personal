import { FormEvent, useEffect, useState } from 'react';
import { Check, PackagePlus, X } from 'lucide-react';
import { downloadExcel, downloadPdf, type ExportColumn } from '../utils/exportReports';
import { ExportMenu } from '../components/ui/ExportMenu';
import { FormAlerts } from '../components/ui/FormAlerts';
import { PanelField } from '../components/ui/PanelField';
import { api, type Product } from '../api';
import {
  type FieldErrors,
  hasFieldErrors,
  validatePositiveAmount,
  validateRequired,
} from '../utils/validation';

const emptyForm = { name: '', sku: '', stock: 0, price: 0, category: '' };
type ProductField = keyof typeof emptyForm;

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
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProductField>>({});
  const [saving, setSaving] = useState(false);
  const [stockId, setStockId] = useState<number | null>(null);
  const [stockQty, setStockQty] = useState(1);

  const load = () => api.getProducts().then(setItems);
  useEffect(() => { load(); }, []);

  const updateField = (field: ProductField, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError('');
  };

  const validateForm = () => {
    const errors: FieldErrors<ProductField> = {
      name: validateRequired(form.name, 'El nombre'),
      sku: validateRequired(form.sku, 'El SKU'),
      category: validateRequired(form.category, 'La categoría'),
      stock: form.stock < 0 ? 'El stock no puede ser negativo' : undefined,
      price: validatePositiveAmount(form.price, 'El precio'),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors<ProductField>;
    setFieldErrors(filtered);
    return !hasFieldErrors(filtered);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.updateProduct(editingId, form);
        setSuccess('Producto actualizado.');
      } else {
        await api.createProduct(form);
        setSuccess('Producto creado.');
      }
      setForm(emptyForm);
      setEditingId(null);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
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
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setError('');
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto');
    }
  };

  const handleAddStock = async (id: number) => {
    const qtyError = validatePositiveAmount(stockQty, 'La cantidad');
    if (qtyError) {
      setError(qtyError);
      return;
    }
    setError('');
    try {
      await api.addStock(id, stockQty);
      setStockId(null);
      setStockQty(1);
      setSuccess('Stock actualizado.');
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
        <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
          <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <FormAlerts error={error} success={success} />

          <PanelField
            label="Nombre"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={fieldErrors.name}
            required
          />
          <PanelField
            label="SKU"
            value={form.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            error={fieldErrors.sku}
            hint="Código único de inventario"
            required
          />
          <PanelField
            label="Stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => updateField('stock', Number(e.target.value))}
            error={fieldErrors.stock}
            required
          />
          <PanelField
            label="Precio"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(e) => updateField('price', Number(e.target.value))}
            error={fieldErrors.price}
            required
          />
          <PanelField
            label="Categoría"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            error={fieldErrors.category}
            placeholder="Ej. Bebidas, Lácteos"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setFieldErrors({});
                  setError('');
                }}
              >
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
                    <td data-label="Producto">{item.name}</td>
                    <td data-label="SKU">{item.sku}</td>
                    <td data-label="Stock">
                      <span className={`badge ${item.stock === 0 ? 'badge--failed' : item.stock < 5 ? 'badge--running' : 'badge--ok'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td data-label="Precio">${item.price.toLocaleString()}</td>
                    <td data-label="Categoría">{item.category}</td>
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
