import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_LABELS } from '../../models/types';
import { formatPrice } from '../../components/ui/ProductImage';
import { Pagination } from '../../components/ui/Pagination';
import { paginate } from '../../utils/pagination';

export function AccountPage() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [ordersPage, setOrdersPage] = useState(1);

  const orders = user?.role === 'customer' ? orderService.byUser(user.id) : [];
  const pagedOrders = useMemo(() => paginate(orders, ordersPage), [orders, ordersPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const ok = login(form.email, form.password);
      if (!ok) setError('Credenciales incorrectas.');
      return;
    }
    const ok = register(form.name, form.email, form.password, form.phone);
    if (!ok) setError('Ese correo ya está registrado.');
  };

  const fillDemo = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setForm({ name: '', email: 'admin@tianova.demo', password: 'admin123', phone: '' });
    } else {
      setForm({ name: '', email: 'cliente@demo.com', password: 'demo123', phone: '' });
    }
    setMode('login');
  };

  if (user) {
    return (
      <div className="page account">
        <h1>Hola, {user.name}</h1>
        <p className="muted">{user.email} · {user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>

        {user.role === 'admin' && (
          <Link to="/admin/dashboard" className="btn btn--primary">Ir al panel administrador</Link>
        )}

        {user.role === 'customer' && (
          <section className="section">
            <h2>Mis pedidos</h2>
            {orders.length === 0 ? (
              <p className="muted">Aún no tienes pedidos.</p>
            ) : (
              <>
                <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.items.map((o) => (
                      <tr key={o.id}>
                        <td>{o.orderNumber}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString('es-EC')}</td>
                        <td>{formatPrice(o.total)}</td>
                        <td><span className="status-pill">{ORDER_STATUS_LABELS[o.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={pagedOrders.page}
                totalPages={pagedOrders.totalPages}
                total={pagedOrders.total}
                onPageChange={setOrdersPage}
              />
              </>
            )}
          </section>
        )}

        <button type="button" className="btn btn--ghost" onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div className="page account-auth">
      <h1>Mi cuenta</h1>
      <div className="auth-tabs">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          <LogIn size={16} /> Iniciar sesión
        </button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          <UserPlus size={16} /> Registrarse
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <label className="field">
              <span>Nombre</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          </>
        )}
        <label className="field">
          <span>Correo</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--primary btn--block">
          {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <div className="demo-creds">
        <p>Acceso demo:</p>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => fillDemo('customer')}>
          Cliente · cliente@demo.com / demo123
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => fillDemo('admin')}>
          Admin · admin@tianova.demo / admin123
        </button>
      </div>
    </div>
  );
}
