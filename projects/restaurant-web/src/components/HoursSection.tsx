import { Clock } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

export function HoursSection() {
  return (
    <section className="section hours page-section">
      <SectionHeading
        label="Visítanos"
        title="Horarios de atención"
        description="Te esperamos con la mejor disposición y mesa lista."
      />
      <div className="hours-grid">
        {restaurant.schedule.map((block) => (
          <article key={block.days} className="hours-card">
            <Clock size={18} />
            <div>
              <h3>{block.days}</h3>
              <p>{block.hours}</p>
              {block.note && <small>{block.note}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
