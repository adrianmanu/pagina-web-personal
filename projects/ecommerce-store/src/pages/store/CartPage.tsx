import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { categoryService, productService } from '../../services/catalogService';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';

export function CartPage() {
  const { items, subtotal, updateQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="page empty-page">
        <h1>Tu carrito está vacío</h1>
        <Link to="/tienda" className="btn btn--primary">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Carrito</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const product = productService.getById(item.productId);
            if (!product) return null;
            const cat = categoryService.getById(product.categoryId);
            return (
              <div key={item.productId} className="cart-item">
                <ProductImage product={product} categoryName={cat?.name} />
                <div className="cart-item__info">
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                  <div className="qty-row">
                    <button type="button" className="icon-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" className="icon-btn" onClick={() => updateQty(item.productId, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="cart-item__total">
                  <strong>{formatPrice(product.price * item.quantity)}</strong>
                  <button type="button" className="icon-btn" onClick={() => remove(item.productId)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p className="muted">Envío calculado al confirmar el pedido.</p>
          <Link to="/checkout" className="btn btn--primary btn--block">Continuar al pedido</Link>
        </aside>
      </div>
    </div>
  );
}
