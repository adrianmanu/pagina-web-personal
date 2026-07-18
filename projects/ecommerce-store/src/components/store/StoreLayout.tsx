import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { storeService } from '../../services/authService';

export function StoreLayout() {
  const { count } = useCart();
  const { user } = useAuth();
  const store = storeService.get();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { to: '/', label: 'Inicio' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/contacto', label: 'Contacto' },
  ];

  return (
    <div className="store">
      <div className="demo-banner">
        Demo interactiva · Los datos se guardan en tu navegador
        {user?.role === 'admin' && (
          <Link to="/admin/dashboard" className="demo-banner__link">
            Ir al panel admin →
          </Link>
        )}
      </div>

      <header className="store-header">
        <Link to="/" className="store-brand">
          <span className="store-brand__mark">TN</span>
          <div>
            <strong>{store.name}</strong>
            <small>{store.tagline}</small>
          </div>
        </Link>

        <nav className={`store-nav ${menuOpen ? 'open' : ''}`}>
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="store-actions">
          <Link to="/tienda" className="icon-btn" aria-label="Buscar">
            <Search size={18} />
          </Link>
          <Link to="/cuenta" className="icon-btn" aria-label="Cuenta">
            <User size={18} />
          </Link>
          <Link to="/carrito" className="icon-btn cart-btn" aria-label="Carrito">
            <ShoppingBag size={18} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          <button
            type="button"
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main className="store-main">
        <Outlet />
      </main>

      <footer className="store-footer">
        <div>
          <strong>{store.name}</strong>
          <p>{store.tagline}</p>
        </div>
        <div>
          <p>{store.address}</p>
          <p>{store.hours}</p>
        </div>
        <div className="store-footer__links">
          <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <span className="store-footer__sep" aria-hidden="true">·</span>
          <Link to="/contacto">Contacto</Link>
        </div>
      </footer>
    </div>
  );
}
