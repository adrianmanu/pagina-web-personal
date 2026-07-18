import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Database, FlaskConical, LogOut, Play, RotateCcw, Table2 } from 'lucide-react';
import { resetDemoData } from '../api/client';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/fuentes', label: 'Fuentes de datos', icon: Database },
  { to: '/registros', label: 'Registros', icon: Table2 },
  { to: '/jobs', label: 'Jobs ETL', icon: Play },
];

export function Layout() {
  const { user, logout } = useAuth();

  const handleReset = () => {
    if (!window.confirm('¿Restablecer la demo? Se borrarán los datos creados en este navegador.')) return;
    resetDemoData();
    window.location.reload();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__icon">
            <Database size={20} />
          </span>
          DataFlow
        </div>
        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__user">
          <p>{user?.full_name}</p>
          <small>{user?.email}</small>
          <button type="button" onClick={logout} className="btn btn--ghost btn--sm btn--full">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="demo-banner">
          <FlaskConical size={15} />
          <span>
            Modo demo: los datos se guardan en tu navegador. El código de la API REST
            (FastAPI + SQLAlchemy + JWT) está disponible en GitHub.
          </span>
          <button type="button" onClick={handleReset}>
            <RotateCcw size={13} /> Restablecer
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
