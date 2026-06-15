import { Heart, Leaf, Sparkles, Users } from 'lucide-react';
import { restaurant } from '../data/restaurant';
import { SectionHeading } from './SectionHeading';

const ICONS = [Heart, Leaf, Sparkles, Users];

export function About() {
  return (
    <section className="section about page-section">
      <SectionHeading
        label="Nosotros"
        title="Quiénes somos"
        description="Tradición, producto local y una experiencia pensada para disfrutar sin prisa."
      />
      <div className="about__grid">
        <div className="about__media">
          <img src={restaurant.aboutImage} alt="Ambiente del restaurante" />
        </div>
        <div className="about__copy">
          {restaurant.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="about__highlights">
            {restaurant.highlights.map((text, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={text} className="about__card">
                  <Icon size={20} />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
