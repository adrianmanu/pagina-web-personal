import { MessageCircle, Phone } from 'lucide-react';
import { HoursSection } from '../components/HoursSection';
import { Location } from '../components/Location';
import { restaurant, whatsappUrl } from '../data/restaurant';

export function ContactPage() {
  return (
    <>
      <section className="section contact-cta page-section">
        <div className="contact-cta__inner">
          <span className="section-heading__label">Escríbenos</span>
          <h2>¿Preguntas o reservas?</h2>
          <p>Contáctanos por WhatsApp o llámanos. Te respondemos lo antes posible.</p>
          <div className="contact-cta__actions">
            <a href={whatsappUrl()} className="btn btn--primary" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="btn btn--outline">
              <Phone size={16} /> {restaurant.phone}
            </a>
          </div>
        </div>
      </section>
      <HoursSection />
      <Location />
    </>
  );
}
