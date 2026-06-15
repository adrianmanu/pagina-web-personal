import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryService, productService } from '../../services/catalogService';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const categoryId = params.get('categoria') ?? '';
  const categories = categoryService.list();
  const products = productService.list(true);

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categoryId]);

  const paged = useMemo(() => paginate(filtered, page), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Tienda</h1>
        <p>{filtered.length} productos</p>
      </div>

      <div className="catalog-layout">
        <aside className="filters">
          <h2>Categorías</h2>
          <button
            type="button"
            className={`filter-chip ${!categoryId ? 'active' : ''}`}
            onClick={() => setParams({})}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip ${categoryId === cat.id ? 'active' : ''}`}
              onClick={() => setParams({ categoria: cat.id })}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        <div className="catalog-results">
          <div className="product-grid">
            {paged.items.map((product) => {
              const cat = categoryService.getById(product.categoryId);
              return (
                <Link key={product.id} to={`/producto/${product.id}`} className="product-card">
                  <ProductImage product={product} categoryName={cat?.name} />
                  <div className="product-card__body">
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>
                    <span className={product.available ? 'stock-badge stock-badge--ok' : 'stock-out'}>
                      {product.available ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>
                </Link>
              );
            })}
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
