import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  Package,
  RotateCcw,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { resetDemo } from '../../services/seedService';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { to: '/admin/inventario', label: 'Inventario', icon: Boxes },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetDemo();
    setConfirmReset(false);
    navigate('/admin/dashboard');
    window.location.reload();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>TN</span>
          <div>
            Panel Admin
            <small>TiendaNova</small>
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
