import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/catalogService';
import { orderService } from '../../services/orderService';
import { formatPrice } from '../../components/ui/ProductImage';

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

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
      customerName: name.trim(),
      customerPhone: phone.trim(),
      address: address.trim(),
      notes: notes.trim() || undefined,
      items: orderItems,
    });

    if (!order) {
      setError('Uno o más productos ya no están disponibles.');
      return;
    }

    clear();
    setOrderNumber(order.orderNumber);
    setDone(true);
    setTimeout(() => navigate('/'), 4000);
  };

  if (done) {
    return (
      <div className="page empty-page">
        <h1>¡Pedido registrado!</h1>
        <p>Tu número de pedido es <strong>{orderNumber}</strong>.</p>
        <p className="muted">Te contactaremos por WhatsApp para coordinar la entrega.</p>
      </div>
    );
  }

  return (
    <div className="page checkout">
      <h1>Finalizar pedido</h1>
      <p className="muted">Compra como invitado — no necesitas crear una cuenta.</p>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre completo</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          <span>Teléfono / WhatsApp</span>
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
