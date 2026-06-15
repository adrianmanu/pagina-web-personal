import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function Gallery() {
  return (
    <section className="section gallery page-section">
      <SectionHeading
        label="Ambiente"
        title="Galería"
        description="Conoce el espacio, los platos y la experiencia de Mi Restaurante."
      />
      <div className="gallery-grid">
        {restaurant.gallery.map((item) => (
          <figure key={item.id} className="gallery-item">
            <img src={item.imageUrl} alt={item.label} loading="lazy" />
            <figcaption>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
