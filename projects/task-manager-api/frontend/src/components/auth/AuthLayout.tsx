import type { ReactNode } from 'react';
import { BarChart3, CalendarClock, ListChecks, Shield } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const FEATURES = [
  { icon: ListChecks, label: 'Tablero kanban con estados y prioridades' },
  { icon: CalendarClock, label: 'Fechas límite y alertas de tareas vencidas' },
  { icon: BarChart3, label: 'Dashboard con métricas de productividad' },
  { icon: Shield, label: 'Autenticación segura con JWT' },
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
              <ListChecks size={22} />
            </div>
            <div>
              <span className="auth-brand__name">TaskFlow</span>
              <span className="auth-brand__tag">Task Management</span>
            </div>
          </div>

          <h2 className="auth-showcase__title">
            Organiza tu trabajo.
            <br />
            <span>Cumple tus plazos.</span>
          </h2>
          <p className="auth-showcase__desc">
            Plataforma de gestión de tareas con tablero kanban, prioridades y
            métricas, construida con Node.js, Express y React.
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
              <strong>Kanban</strong>
              <span>Tablero</span>
            </div>
            <div>
              <strong>JWT</strong>
              <span>Seguridad</span>
            </div>
            <div>
              <strong>REST</strong>
              <span>Node.js</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="auth-card__badge">
              <ListChecks size={15} />
              <span>TaskFlow</span>
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
