import type { ReactNode } from 'react';
import { BarChart3, Database, Shield, Zap } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const FEATURES = [
  { icon: Database, label: 'ETL automatizado desde APIs REST' },
  { icon: BarChart3, label: 'Dashboard analítico en tiempo real' },
  { icon: Shield, label: 'Autenticación segura con JWT' },
  { icon: Zap, label: 'Exportación instantánea CSV y JSON' },
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
              <Database size={22} />
            </div>
            <div>
              <span className="auth-brand__name">DataFlow</span>
              <span className="auth-brand__tag">Enterprise ETL Platform</span>
            </div>
          </div>

          <h2 className="auth-showcase__title">
            Automatiza tus datos.
            <br />
            <span>Impulsa decisiones.</span>
          </h2>
          <p className="auth-showcase__desc">
            Plataforma empresarial para extracción, transformación y visualización
            de datos con arquitectura profesional MVC.
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
              <strong>50+</strong>
              <span>Registros por job</span>
            </div>
            <div>
              <strong>99.9%</strong>
              <span>Uptime API</span>
            </div>
            <div>
              <strong>JWT</strong>
              <span>Seguridad</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="auth-card__badge">
              <Database size={15} />
              <span>DataFlow</span>
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
