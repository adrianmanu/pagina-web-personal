import { useState } from 'react';
import { restaurant, formatPrice } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function MenuSection() {
  const [active, setActive] = useState(restaurant.menu[0]?.id ?? '');
  const category = restaurant.menu.find((c) => c.id === active) ?? restaurant.menu[0];

  return (
    <section className="section menu-section page-section">
      <SectionHeading
        label="Carta"
        title="Nuestro menú"
        description="Platos preparados al momento. Los precios pueden variar según temporada."
      />

      <div className="menu-tabs">
        {restaurant.menu.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={active === cat.id ? 'active' : ''}
            onClick={() => setActive(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="menu-list">
        {category?.items.map((item) => (
          <article key={item.name} className={`menu-item${item.imageUrl ? '' : ' menu-item--no-img'}`}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="menu-item__img" loading="lazy" />
            )}
            <div className="menu-item__body">
              <div className="menu-item__head">
                <h3>{item.name}</h3>
                {item.tag && <span className="menu-item__tag">{item.tag}</span>}
                <strong>{formatPrice(item.price)}</strong>
              </div>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
