import { Tag } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function Promotions() {
  return (
    <section className="section promotions page-section">
      <SectionHeading
        label="Ofertas"
        title="Promociones"
        description="Aprovecha nuestras propuestas especiales de la semana."
      />
      <div className="promo-grid">
        {restaurant.promotions.map((promo) => (
          <article key={promo.title} className="promo-card">
            {promo.imageUrl && (
              <img src={promo.imageUrl} alt={promo.title} className="promo-card__img" loading="lazy" />
            )}
            <div className="promo-card__body">
              {promo.badge && <span className="promo-card__badge"><Tag size={12} /> {promo.badge}</span>}
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
              <small>{promo.validUntil}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
