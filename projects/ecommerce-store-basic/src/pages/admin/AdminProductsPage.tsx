import { useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { categoryService, productService } from '../../services/catalogService';
import { MAX_PRODUCTS } from '../../models/types';
import type { Product } from '../../models/types';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

const MAX_IMAGE_BYTES = 500_000;

const emptyForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  available: true,
  imageHue: '200',
  imageUrl: '' as string | undefined,
  featured: false,
  active: true,
};

export function AdminProductsPage() {
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState('');
  const [limitError, setLimitError] = useState('');
  const [page, setPage] = useState(1);

  const products = productService.list();
  const categories = categoryService.list();
  const paged = useMemo(() => paginate(products, page), [products, page, refresh]);
  const atLimit = products.length >= MAX_PRODUCTS;

  const openCreate = () => {
    if (!productService.canCreate()) {
      setLimitError(`Máximo ${MAX_PRODUCTS} productos en el plan básico.`);
      return;
    }
    setLimitError('');
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? '' });
    setImageError('');
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      categoryId: p.categoryId,
      available: p.available,
      imageHue: String(p.imageHue),
      imageUrl: p.imageUrl,
      featured: p.featured,
      active: p.active,
    });
    setImageError('');
    setOpen(true);
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Selecciona un archivo de imagen (JPG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('La imagen debe pesar menos de 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, imageUrl: reader.result as string }));
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      categoryId: form.categoryId,
      available: form.available,
      imageHue: parseInt(form.imageHue, 10),
      imageUrl: form.imageUrl,
      featured: form.featured,
      active: form.active,
    };
    if (editing) {
      productService.update(editing.id, data);
    } else {
      const created = productService.create(data);
      if (!created) {
        setLimitError(`Máximo ${MAX_PRODUCTS} productos en el plan básico.`);
        return;
      }
    }
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const remove = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    productService.remove(id);
    setRefresh((r) => r + 1);
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1>Productos</h1>
        <p>
          {products.length} / {MAX_PRODUCTS} productos · Disponible / agotado manual
        </p>
      </header>

      <div className="list-toolbar">
        <button type="button" className="btn btn--primary" onClick={openCreate} disabled={atLimit}>
          <Plus size={16} /> Nuevo producto
        </button>
        {atLimit && <span className="muted">Límite del plan básico alcanzado</span>}
        {limitError && <p className="error">{limitError}</p>}
      </div>

      <div className="admin-table-list">
        {paged.items.map((p) => {
          const cat = categoryService.getById(p.categoryId);
          return (
            <div key={p.id} className="admin-row">
              <ProductImage product={p} categoryName={cat?.name} />
              <div className="admin-row__info">
                <strong>{p.name}</strong>
                <p className="muted">{formatPrice(p.price)} · {cat?.name}</p>
                <button
                  type="button"
                  className={`stock-badge stock-badge--${p.available ? 'ok' : 'out'}`}
                  onClick={() => {
                    productService.toggleAvailable(p.id);
                    setRefresh((r) => r + 1);
                  }}
                >
                  {p.available ? 'Disponible' : 'Agotado'}
                </button>
              </div>
              <div className="row-actions">
                <button type="button" className="icon-btn" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                <button type="button" className="icon-btn" onClick={() => remove(p.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        onPageChange={setPage}
      />

      {open && (
        <div className="modal-backdrop">
          <form className="modal modal--wide" onSubmit={save}>
            <div className="modal__head">
              <h3>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>

            <label className="field">
              <span>Nombre</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              <span>Descripción</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Precio</span>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </label>
              <label className="field">
                <span>Categoría</span>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>

            <label className="field checkbox">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              <span>Disponible para venta</span>
            </label>

            <div className="image-upload__box">
              <span className="field-label">Foto del producto</span>
              {form.imageUrl ? (
                <div className="image-upload__preview">
                  <img src={form.imageUrl} alt="Vista previa" />
                  <button type="button" className="btn btn--sm image-upload__remove" onClick={() => setForm({ ...form, imageUrl: undefined })}>
                    Quitar
                  </button>
                </div>
              ) : (
                <label className="image-upload__placeholder">
                  <ImagePlus size={24} />
                  <span>Subir imagen (máx. 500 KB)</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                </label>
              )}
              {imageError && <p className="error">{imageError}</p>}
            </div>

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn--primary">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
