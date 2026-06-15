import { Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function Location() {
  return (
    <section className="section location page-section">
      <SectionHeading
        label="Encuéntranos"
        title="Ubicación y redes"
        description="Estamos en una zona accesible con parqueadero cercano."
      />
      <div className="location-grid">
        <div className="location-info">
          <p><MapPin size={16} /> {restaurant.address}</p>
          <p><Phone size={16} /> {restaurant.phone}</p>
          <div className="location-social">
            <a href={restaurant.social.instagram} target="_blank" rel="noreferrer">
              <Instagram size={16} /> Instagram
            </a>
            <a href={restaurant.social.facebook} target="_blank" rel="noreferrer">
              <Facebook size={16} /> Facebook
            </a>
          </div>
        </div>
        <div className="location-map">
          <iframe
            title="Ubicación del restaurante"
            src={restaurant.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
