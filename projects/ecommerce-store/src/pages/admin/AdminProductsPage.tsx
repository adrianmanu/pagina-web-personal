import { useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { categoryService, productService } from '../../services/catalogService';
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
  stock: '',
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
  const [page, setPage] = useState(1);

  const products = productService.list();
  const categories = categoryService.list();
  const paged = useMemo(() => paginate(products, page), [products, page, refresh]);

  const openCreate = () => {
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
      stock: String(p.stock),
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

  const removeImage = () => {
    setForm((f) => ({ ...f, imageUrl: undefined }));
    setImageError('');
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      categoryId: form.categoryId,
      stock: parseInt(form.stock, 10),
      imageHue: parseInt(form.imageHue, 10),
      imageUrl: form.imageUrl,
      featured: form.featured,
      active: form.active,
    };
    if (editing) productService.update(editing.id, data);
    else productService.create(data);
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const remove = (id: string) => {
    if (confirm('¿Eliminar producto?')) {
      productService.remove(id);
      setRefresh((r) => r + 1);
    }
  };

  void refresh;

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Productos</h1>
          <p>CRUD de catálogo</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo producto
        </button>
      </header>

      <div className="admin-table-list">
        {paged.items.map((p) => {
          const cat = categoryService.getById(p.categoryId);
          return (
            <div key={p.id} className="admin-row">
              <ProductImage product={p} categoryName={cat?.name} />
              <div>
                <strong>{p.name}</strong>
                <p className="muted">{cat?.name} · {formatPrice(p.price)} · Stock {p.stock}</p>
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
            <h3>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
            <div className="form-grid">
              <label className="field field--full image-upload">
                <span>Foto del producto</span>
                <div className="image-upload__box">
                  {form.imageUrl ? (
                    <div className="image-upload__preview">
                      <img src={form.imageUrl} alt="Vista previa" />
                      <button type="button" className="icon-btn image-upload__remove" onClick={removeImage}>
                        <X size={16} />
                      </button>
                      <label className="image-upload__replace">
                        Cambiar foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="image-upload__placeholder">
                      <ImagePlus size={28} />
                      <span>Subir imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
                <small className="muted">JPG, PNG o WebP · máx. 500 KB. Si no subes foto, se usa color de respaldo.</small>
                {imageError && <p className="error">{imageError}</p>}
              </label>

              <label className="field"><span>Nombre</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label className="field"><span>Precio</span><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
              <label className="field"><span>Stock</span><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label>
              <label className="field">
                <span>Categoría</span>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="field field--full"><span>Descripción</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required /></label>
              <label className="checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destacado</label>
              <label className="checkbox"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo</label>
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
