import { FormEvent, useEffect, useState } from 'react';
import { api, type Product } from '../api/client';

const emptyForm = { name: '', sku: '', stock: 0, price: 0, category: '' };

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

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

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">CRUD</p>
          <h1>Productos</h1>
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
                    <td>{item.stock}</td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>{item.category}</td>
                    <td className="actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEdit(item)}>Editar</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(item.id)}>Eliminar</button>
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
