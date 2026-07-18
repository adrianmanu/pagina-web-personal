import { FormEvent, useEffect, useState } from 'react';
import { api, type SaleRecord } from '../api/client';

const emptyForm = { external_id: 1, product_name: '', quantity: 1, unit_price: 10, customer: '' };

export function RecordsPage() {
  const [items, setItems] = useState<SaleRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => api.getRecords().then(setItems);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updateRecord(editingId, form);
    } else {
      await api.createRecord(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const handleEdit = (item: SaleRecord) => {
    setEditingId(item.id);
    setForm({
      external_id: item.external_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      customer: item.customer,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar registro?')) return;
    await api.deleteRecord(id);
    load();
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">CRUD</p>
          <h1>Registros de ventas</h1>
        </div>
      </header>

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar registro' : 'Nuevo registro'}</h2>
          <label>ID externo<input type="number" value={form.external_id} onChange={(e) => setForm({ ...form, external_id: +e.target.value })} required /></label>
          <label>Producto<input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required /></label>
          <label>Cliente<input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required /></label>
          <label>Cantidad<input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} min={1} required /></label>
          <label>Precio unitario<input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: +e.target.value })} min={0.01} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">{editingId ? 'Actualizar' : 'Crear'}</button>
            {editingId && <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
          </div>
        </form>

        <section className="panel">
          <h2>Listado ({items.length})</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>Cliente</th><th>Cant.</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.customer}</td>
                    <td>{item.quantity}</td>
                    <td>${item.total.toLocaleString()}</td>
                    <td className="actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEdit(item)}>Editar</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(item.id)}>Eliminar</button>
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
