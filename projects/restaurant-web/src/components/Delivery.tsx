import { ExternalLink, Truck } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function Delivery() {
  return (
    <section className="section delivery page-section page-section--narrow">
      <SectionHeading
        label="A domicilio"
        title="Pide a delivery"
        description="También puedes disfrutar Mi Restaurante desde casa."
      />
      <div className="delivery-grid">
        {restaurant.delivery.map((partner) => (
          <a key={partner.name} href={partner.url} className="delivery-card" target="_blank" rel="noreferrer">
            <Truck size={22} />
            <div>
              <strong>{partner.name}</strong>
              <span>Pedir ahora <ExternalLink size={12} /></span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
