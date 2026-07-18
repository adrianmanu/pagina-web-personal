import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/catalogService';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function AdminCategoriesPage() {
  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const categories = categoryService.list();
  const paged = useMemo(() => paginate(categories, page), [categories, page, refresh]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    categoryService.create(name.trim());
    setName('');
    setRefresh((r) => r + 1);
  };

  const remove = (id: string) => {
    const ok = categoryService.remove(id);
    if (!ok) alert('No se puede eliminar: hay productos en esta categoría.');
    else setRefresh((r) => r + 1);
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Categorías</h1>
        <p>Organiza el catálogo</p>
      </header>

      <form className="inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva categoría" />
        <button type="submit" className="btn btn--primary"><Plus size={16} /> Agregar</button>
      </form>

      <div className="category-admin-list">
        {paged.items.map((c) => (
          <div key={c.id} className="admin-row">
            <div>
              <strong>{c.name}</strong>
              <p className="muted">/{c.slug}</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => remove(c.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        onPageChange={setPage}
      />
    </div>
  );
}
