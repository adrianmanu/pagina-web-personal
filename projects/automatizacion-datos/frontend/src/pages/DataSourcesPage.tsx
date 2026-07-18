import { FormEvent, useEffect, useState } from 'react';
import { api, type DataSource } from '../api/client';

const emptyForm = { name: '', api_url: 'https://jsonplaceholder.typicode.com', description: '', is_active: true };

export function DataSourcesPage() {
  const [items, setItems] = useState<DataSource[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => api.getDataSources().then(setItems);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updateDataSource(editingId, form);
    } else {
      await api.createDataSource(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const handleEdit = (item: DataSource) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      api_url: item.api_url,
      description: item.description,
      is_active: item.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta fuente?')) return;
    await api.deleteDataSource(id);
    load();
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">CRUD</p>
          <h1>Fuentes de datos</h1>
        </div>
      </header>

      <div className="split">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar fuente' : 'Nueva fuente'}</h2>
          <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>URL API<input value={form.api_url} onChange={(e) => setForm({ ...form, api_url: e.target.value })} required /></label>
          <label>Descripción<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
          <label className="checkbox">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Activa
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">{editingId ? 'Actualizar' : 'Crear'}</button>
            {editingId && <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
          </div>
        </form>

        <section className="panel">
          <h2>Listado</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nombre</th><th>URL</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="truncate">{item.api_url}</td>
                    <td><span className={`badge ${item.is_active ? 'badge--ok' : ''}`}>{item.is_active ? 'Activa' : 'Inactiva'}</span></td>
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
