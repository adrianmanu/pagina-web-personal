import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { restaurant } from '../data/restaurant';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <strong className="footer__brand">{restaurant.name}</strong>
          <p>{restaurant.tagline}</p>
          <nav className="footer__links">
            <Link to="/menu">Menú</Link>
            <Link to="/contacto">Contacto</Link>
          </nav>
        </div>
        <div>
          <h4>Contacto</h4>
          <p><Phone size={14} /> {restaurant.phone}</p>
          <p><Mail size={14} /> {restaurant.email}</p>
          <p><MapPin size={14} /> {restaurant.address}</p>
        </div>
        <div>
          <h4>Horario hoy</h4>
          <p><Clock size={14} /> {restaurant.schedule[0].hours}</p>
          <div className="footer__social">
            <a href={restaurant.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href={restaurant.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>
      <p className="footer__demo">
        Demo plantilla Paquete Esencial · Desarrollado por Adrián Ramos
      </p>
    </footer>
  );
}
