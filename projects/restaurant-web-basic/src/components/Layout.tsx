import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { restaurant, whatsappUrl } from '../data/restaurant';
import { Footer } from './Footer';

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/menu', label: 'Menú' },
  { to: '/contacto', label: 'Contacto' },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="site">
      <div className="demo-banner">
        Demo Paquete Esencial · Menú, contacto y WhatsApp · Personalizable a tu marca
      </div>

      <header className={`header ${scrolled ? 'header--scrolled' : ''} ${open ? 'header--menu-open' : ''}`}>
        <div className="header__inner">
          <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand__mark">MR</span>
            <div>
              <strong>{restaurant.name}</strong>
              <small>Restaurante</small>
            </div>
          </NavLink>

          <nav className={`header__nav ${open ? 'open' : ''}`} aria-hidden={!open}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={whatsappUrl()}
              className="header__nav-reservar"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              WhatsApp
            </a>
          </nav>

          <div className="header__actions">
            <a
              href={whatsappUrl()}
              className="btn btn--primary btn--sm header__cta header__cta--desktop"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <button
          type="button"
          className="menu-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
