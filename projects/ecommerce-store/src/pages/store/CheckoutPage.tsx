import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/catalogService';
import { orderService } from '../../services/orderService';
import { formatPrice } from '../../components/ui/ProductImage';

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'customer') {
    return <Navigate to="/cuenta" replace />;
  }

  if (items.length === 0 && !done) {
    return <Navigate to="/carrito" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const orderItems = items
      .map((item) => {
        const p = productService.getById(item.productId);
        if (!p) return null;
        return {
          productId: p.id,
          productName: p.name,
          quantity: item.quantity,
          unitPrice: p.price,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const order = orderService.create({
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: phone,
      address,
      notes,
      items: orderItems,
    });

    if (!order) {
      setError('No hay stock suficiente para uno o más productos.');
      return;
    }

    clear();
    setDone(true);
    setTimeout(() => navigate('/cuenta'), 2000);
  };

  if (done) {
    return (
      <div className="page empty-page">
        <h1>¡Pedido registrado!</h1>
        <p>Te redirigimos a tu cuenta para ver el historial.</p>
      </div>
    );
  }

  return (
    <div className="page checkout">
      <h1>Finalizar pedido</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre</span>
          <input value={user.name} readOnly />
        </label>
        <label className="field">
          <span>Teléfono</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label className="field">
          <span>Dirección de entrega</span>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} />
        </label>
        <label className="field">
          <span>Notas (opcional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        <div className="checkout-summary">
          <strong>Total: {formatPrice(subtotal)}</strong>
          <p className="muted">Pago por transferencia o efectivo contra entrega.</p>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn--primary">Confirmar pedido</button>
        <Link to="/carrito" className="muted">Volver al carrito</Link>
      </form>
    </div>
  );
}
