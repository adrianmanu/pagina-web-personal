import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Database, LogOut, Play, Table2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/fuentes', label: 'Fuentes de datos', icon: Database },
  { to: '/registros', label: 'Registros', icon: Table2 },
  { to: '/jobs', label: 'Jobs ETL', icon: Play },
];

export function Layout() {
  const { user, logout } = useAuth();

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
        <Outlet />
      </main>
    </div>
  );
}
