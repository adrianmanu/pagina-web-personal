import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, RotateCcw, ShoppingCart, Store } from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { resetDemo } from '../../services/seedService';

const NAV = [
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetDemo();
    setConfirmReset(false);
    navigate('/admin/productos');
    window.location.reload();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>TN</span>
          <div>
            Panel Admin
            <small>Plan Básico</small>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="admin-nav__link">
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink to="/" className="btn btn--ghost btn--sm">
            <Store size={14} /> Ver tienda
          </NavLink>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Restablecer demo
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>

      {confirmReset && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Restablecer demo</h3>
            <p>Se borrarán todos los cambios y volverán los datos de ejemplo.</p>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primary" onClick={handleReset}>
                Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
