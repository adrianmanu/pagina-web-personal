import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CreditCard, FileMinus2, FilePlus2, FileSpreadsheet, FileText, Files, FlaskConical, Inbox, LogOut, Package, Receipt, RotateCcw, Scale, Settings, ShoppingCart, Truck, Users } from 'lucide-react';
import { IS_DEMO_MODE, resetDemoData } from '../api';
import { useAuth } from '../context/AuthContext';

type NavItem = { to: string; label: string; icon: typeof Package; end?: boolean; roles?: string[] };

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/productos', label: 'Productos', icon: Package, roles: ['ADMIN', 'CAJERO'] },
  { to: '/clientes', label: 'Clientes', icon: Users, roles: ['ADMIN', 'CAJERO'] },
  { to: '/proformas', label: 'Proformas', icon: FileText, roles: ['ADMIN', 'CAJERO'] },
  { to: '/facturacion', label: 'Facturación', icon: Receipt, roles: ['ADMIN', 'CAJERO'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'CAJERO'] },
  { to: '/liquidaciones-compra', label: 'Liquidaciones', icon: ShoppingCart, roles: ['ADMIN', 'CAJERO'] },
  { to: '/documentos-recibidos', label: 'Docs. recibidos', icon: Inbox, roles: ['ADMIN', 'CAJERO', 'CONTADOR'] },
  { to: '/ats', label: 'ATS', icon: FileSpreadsheet, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/retenciones', label: 'Retenciones', icon: Scale, roles: ['ADMIN', 'CAJERO'] },
  { to: '/documentos', label: 'Documentos emitidos', icon: Files },
  { to: '/notas-credito', label: 'Notas de crédito', icon: FileMinus2, roles: ['ADMIN', 'CAJERO'] },
  { to: '/notas-debito', label: 'Notas de débito', icon: FilePlus2, roles: ['ADMIN', 'CAJERO'] },
  { to: '/guias-remision', label: 'Guías de remisión', icon: Truck, roles: ['ADMIN', 'CAJERO'] },
  { to: '/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN'] },
  { to: '/membresia', label: 'Membresía', icon: CreditCard, roles: ['ADMIN'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const role = user?.role ?? 'ADMIN';
  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(role));

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
            <Package size={20} />
          </span>
          StockFlow
        </div>
        <nav className="nav">
          {visibleNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__user">
          <p>{user?.fullName}</p>
          <small>{user?.email}</small>
          <small className="muted">Rol: {role}</small>
          <button type="button" onClick={logout} className="btn btn--ghost btn--sm btn--full">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <div className={`demo-banner ${IS_DEMO_MODE ? 'demo-banner--portfolio' : ''}`}>
          <FlaskConical size={15} />
          <span>
            {IS_DEMO_MODE
              ? 'Modo demo del portafolio — datos en tu navegador, sin servidor. Facturas SRI simuladas. Usa «Restablecer» para empezar de cero.'
              : user?.canEmit === false
                ? 'Membresía inactiva — no puedes emitir comprobantes SRI. Activa un plan en Membresía.'
                : 'StockFlow en servidor — facturación electrónica Ecuador (ambiente de pruebas).'}
          </span>
          {IS_DEMO_MODE && (
            <button type="button" onClick={handleReset}>
              <RotateCcw size={13} /> Restablecer
            </button>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
