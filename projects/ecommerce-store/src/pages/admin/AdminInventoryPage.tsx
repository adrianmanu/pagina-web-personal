import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { productService, categoryService } from '../../services/catalogService';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

type AdjustMode = 'add' | 'remove';

interface PendingAdjust {
  productId: string;
  productName: string;
  mode: AdjustMode;
}

export function AdminInventoryPage() {
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAdjust | null>(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const products = productService.list();
  const paged = useMemo(() => paginate(products, page), [products, page, refresh]);

  const openAdjust = (productId: string, productName: string, mode: AdjustMode) => {
    setPending({ productId, productName, mode });
    setQuantity('');
    setError('');
  };

  const confirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    const amount = parseInt(quantity, 10);
    if (!amount || amount < 1) {
      setError('Ingresa una cantidad válida mayor a 0.');
      return;
    }

    const product = productService.getById(pending.productId);
    if (!product) return;

    if (pending.mode === 'remove' && amount > product.stock) {
      setError(`Solo hay ${product.stock} unidades en stock.`);
      return;
    }

    const delta = pending.mode === 'add' ? amount : -amount;
    productService.adjustStock(pending.productId, delta);
    setPending(null);
    setRefresh((r) => r + 1);
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Inventario</h1>
        <p>Control de stock por producto</p>
      </header>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {paged.items.map((p) => {
              const cat = categoryService.getById(p.categoryId);
              const level = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'ok';
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{cat?.name}</td>
                  <td><span className={`stock-badge stock-badge--${level}`}>{p.stock}</span></td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="btn btn--sm btn--primary"
                      onClick={() => openAdjust(p.id, p.name, 'add')}
                    >
                      <Plus size={14} /> Agregar
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost"
                      onClick={() => openAdjust(p.id, p.name, 'remove')}
                      disabled={p.stock === 0}
                    >
                      <Minus size={14} /> Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        onPageChange={setPage}
      />

      {pending && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={confirmAdjust}>
            <h3>{pending.mode === 'add' ? 'Agregar stock' : 'Quitar stock'}</h3>
            <p className="muted">{pending.productName}</p>
            <label className="field">
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ej. 10"
                autoFocus
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setPending(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                {pending.mode === 'add' ? 'Agregar' : 'Quitar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
