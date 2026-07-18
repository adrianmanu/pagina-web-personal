import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Clock,
  Image,
  MapPin,
  Phone,
  Tag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { restaurant } from '../data/restaurant';

const QUICK_LINKS = [
  { to: '/menu', label: 'Ver menú', desc: 'Carta completa con precios', icon: UtensilsCrossed },
  { to: '/reservas', label: 'Reservar mesa', desc: 'Formulario → WhatsApp', icon: Calendar },
  { to: '/promociones', label: 'Promociones', desc: 'Ofertas de la semana', icon: Tag },
  { to: '/galeria', label: 'Galería', desc: 'Fotos del local y platos', icon: Image },
  { to: '/ubicacion', label: 'Ubicación', desc: 'Mapa y redes sociales', icon: MapPin },
  { to: '/delivery', label: 'Delivery', desc: 'Pide a domicilio', icon: Truck },
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
            <Link to="/reservas" className="btn btn--outline">
              <Phone size={16} /> Reservar mesa
            </Link>
          </div>
          <div className="hero__meta">
            <span><MapPin size={14} /> {restaurant.address}</span>
            <span><Clock size={14} /> {restaurant.schedule[0].hours}</span>
          </div>
        </div>
      </section>

      <section className="section home-preview">
        <div className="home-preview__grid">
          <img src={restaurant.aboutImage} alt="Ambiente del restaurante" className="home-preview__img" />
          <div>
            <span className="section-heading__label">Bienvenidos</span>
            <h2>Una experiencia para recordar</h2>
            <p>{restaurant.about[0]}</p>
            <Link to="/nosotros" className="btn btn--outline">Conocer más</Link>
          </div>
        </div>
      </section>

      <section className="section home-links">
        <div className="section-heading">
          <span className="section-heading__label">Explora</span>
          <h2>Todo en su propia sección</h2>
          <p>Cada parte del sitio tiene su página: menú, galería, reservas y más.</p>
        </div>
        <div className="home-links__grid">
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
