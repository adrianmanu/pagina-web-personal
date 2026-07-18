import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, LayoutDashboard, RotateCcw, ShoppingCart, Users } from 'lucide-react';
import { seedService } from '../../services/seedService';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart, end: false },
  { to: '/clientes', label: 'Clientes', icon: Users, end: false },
];

export function Layout() {
  const [confirmReset, setConfirmReset] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleReset = () => {
    seedService.resetDemoData();
    setConfirmReset(false);
    showToast('success', 'Datos demo restablecidos');
    navigate('/');
    // Las vistas leen los servicios al montar; forzamos un remontaje completo.
    window.location.reload();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__icon">
            <BarChart3 size={20} />
          </span>
          <div>
            Metrix
            <small>Business Suite</small>
          </div>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav__link">
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Restablecer demo
          </button>
          <p>Los datos se guardan en tu navegador.</p>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      {confirmReset && (
        <ConfirmDialog
          title="Restablecer datos demo"
          message="Se borrarán todos los cambios y se regenerarán los datos de ejemplo. ¿Continuar?"
          confirmLabel="Restablecer"
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
