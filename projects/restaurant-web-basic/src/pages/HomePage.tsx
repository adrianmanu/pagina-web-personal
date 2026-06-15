import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, MessageCircle, UtensilsCrossed } from 'lucide-react';
import { restaurant, whatsappUrl } from '../data/restaurant';

const QUICK_LINKS = [
  { to: '/menu', label: 'Ver menú', desc: 'Carta completa con precios', icon: UtensilsCrossed },
  { to: '/contacto', label: 'Contacto', desc: 'Horarios, mapa y redes', icon: MapPin },
];

export function HomePage() {
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${restaurant.heroImage})` }}>
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="pill">Quito · Cocina de altura</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.tagline}</p>
          <p className="hero__desc">{restaurant.description}</p>
          <div className="hero__cta">
            <Link to="/menu" className="btn btn--primary">
              Ver menú <ArrowRight size={16} />
            </Link>
            <a href={whatsappUrl()} className="btn btn--outline" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
          <div className="hero__meta">
            <span><MapPin size={14} /> {restaurant.address}</span>
            <span><Clock size={14} /> {restaurant.schedule[0].hours}</span>
          </div>
        </div>
      </section>

      <section className="section home-links">
        <div className="section-heading">
          <span className="section-heading__label">Explora</span>
          <h2>Todo lo esencial en un solo sitio</h2>
          <p>Menú actualizado, horarios, ubicación y contacto directo por WhatsApp.</p>
        </div>
        <div className="home-links__grid home-links__grid--compact">
          {QUICK_LINKS.map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to} className="home-link-card">
              <Icon size={22} />
              <div>
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
