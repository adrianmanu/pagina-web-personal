import type { ReactNode } from 'react';
import { BarChart3, Package, Shield, Tags } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const FEATURES = [
  { icon: Package, label: 'Gestión completa de productos y SKU' },
  { icon: BarChart3, label: 'Dashboard de stock y valor de inventario' },
  { icon: Shield, label: 'Autenticación segura con JWT' },
  { icon: Tags, label: 'Organización por categorías' },
];

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-showcase">
        <div className="auth-showcase__glow auth-showcase__glow--1" />
        <div className="auth-showcase__glow auth-showcase__glow--2" />
        <div className="auth-showcase__grid" />

        <div className="auth-showcase__content">
          <div className="auth-brand">
            <div className="auth-brand__icon">
              <Package size={22} />
            </div>
            <div>
              <span className="auth-brand__name">StockFlow</span>
              <span className="auth-brand__tag">Enterprise Inventory</span>
            </div>
          </div>

          <h2 className="auth-showcase__title">
            Controla tu inventario.
            <br />
            <span>Escala tu negocio.</span>
          </h2>
          <p className="auth-showcase__desc">
            Plataforma empresarial para gestión de productos, stock y categorías
            con arquitectura Spring Boot y React.
          </p>

          <ul className="auth-features">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="auth-features__icon">
                  <Icon size={18} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="auth-stats">
            <div>
              <strong>CRUD</strong>
              <span>Productos</span>
            </div>
            <div>
              <strong>JWT</strong>
              <span>Seguridad</span>
            </div>
            <div>
              <strong>REST</strong>
              <span>Spring Boot</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="auth-card__badge">
              <Package size={15} />
              <span>StockFlow</span>
            </div>
            <header className="auth-form-header">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </header>
            {children}
            <footer className="auth-form-footer">{footer}</footer>
          </div>
        </div>
      </section>
    </div>
  );
}
