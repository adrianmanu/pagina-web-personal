import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { categoryService, productService } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const product = id ? productService.getById(id) : undefined;
  if (!product || !product.active) {
    return (
      <div className="page">
        <p>Producto no encontrado.</p>
        <Link to="/tienda">Volver a la tienda</Link>
      </div>
    );
  }

  const cat = categoryService.getById(product.categoryId);
  const maxQty = product.stock;

  const handleAdd = () => {
    add(product.id, qty);
    navigate('/carrito');
  };

  return (
    <div className="page product-detail">
      <ProductImage product={product} categoryName={cat?.name} />
      <div className="product-detail__info">
        <span className="pill">{cat?.name}</span>
        <h1>{product.name}</h1>
        <p className="price-lg">{formatPrice(product.price)}</p>
        <p className="muted">{product.description}</p>
        <p>Stock disponible: <strong>{product.stock}</strong></p>

        {maxQty > 0 ? (
          <>
            <div className="qty-row">
              <button type="button" className="icon-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button type="button" className="icon-btn" onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>
                <Plus size={16} />
              </button>
            </div>
            <button type="button" className="btn btn--primary" onClick={handleAdd}>
              <ShoppingCart size={16} /> Agregar al carrito
            </button>
          </>
        ) : (
          <p className="stock-out">Producto agotado</p>
        )}
      </div>
    </div>
  );
}
