import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { categoryService, productService } from '../../services/catalogService';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(1);

  const categoryId = params.get('categoria') ?? '';
  const categories = categoryService.list();
  const products = productService.list(true);

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    if (onlyAvailable) list = list.filter((p) => p.stock > 0);
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!Number.isNaN(max)) list = list.filter((p) => p.price <= max);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categoryId, onlyAvailable, maxPrice]);

  const paged = useMemo(() => paginate(filtered, page), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, onlyAvailable, maxPrice]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Tienda</h1>
        <p>{filtered.length} productos</p>
      </div>

      <div className="catalog-layout">
        <aside className="filters">
          <h2><SlidersHorizontal size={16} /> Filtros</h2>

          <label className="field">
            <span>Categoría</span>
            <select
              value={categoryId}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                const v = e.target.value;
                if (v) next.set('categoria', v);
                else next.delete('categoria');
                setParams(next);
              }}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Precio máximo (USD)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Ej. 40"
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo disponibles
          </label>
        </aside>

        <div className="catalog-results">
          <div className="product-grid">
            {paged.items.map((product) => {
              const cat = categoryService.getById(product.categoryId);
              return (
                <Link key={product.id} to={`/producto/${product.id}`} className="product-card">
                  <ProductImage product={product} categoryName={cat?.name} />
                  <div className="product-card__body">
                    <span className="muted">{cat?.name}</span>
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>
                    {product.stock < 5 && product.stock > 0 && (
                      <small className="stock-warn">Quedan {product.stock}</small>
                    )}
                    {product.stock === 0 && <small className="stock-out">Agotado</small>}
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && <p className="empty">No hay productos con esos filtros.</p>}
          </div>

          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
