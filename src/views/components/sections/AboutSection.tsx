import { Code2, Layers, Shield } from 'lucide-react';
import type { Profile } from '../../../models';
import { SectionTitle } from '../ui/SectionTitle';
import './AboutSection.css';

interface AboutSectionProps {
  profile: Profile;
}

const PRINCIPLES = [
  {
    icon: Code2,
    title: 'Clean Code',
    description: 'Código legible, funciones pequeñas, nombres descriptivos y principios SOLID.',
  },
  {
    icon: Layers,
    title: 'Arquitectura MVC',
    description: 'Separación clara entre Modelo, Vista y Controlador para máxima mantenibilidad.',
  },
  {
    icon: Shield,
    title: 'Microservicios & Seguridad',
    description: 'Arquitecturas escalables con Docker, OAuth2, CI/CD y formación en ciberseguridad.',
  },
];

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <section id="sobre-mi" className="about section">
      <div className="container">
        <SectionTitle
          label="Sobre mí"
          title="3 años transformando ideas en productos digitales"
          subtitle="Ingeniero de Software en formación (ESPE) con experiencia en GUSVIVAN, UTIC-ESPE y proyectos full stack de portafolio."
        />

        <div className="about__grid">
          <div className="about__bio">
            <p>{profile.bio}</p>
            <div className="about__info">
              <div className="about__info-item">
                <span className="about__info-label">Ubicación</span>
                <span className="about__info-value">{profile.location}</span>
              </div>
              <div className="about__info-item">
                <span className="about__info-label">Email</span>
                <a href={`mailto:${profile.email}`} className="about__info-value about__info-link">
                  {profile.email}
                </a>
              </div>
              <div className="about__info-item">
                <span className="about__info-label">Teléfono</span>
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="about__info-value about__info-link">
                  {profile.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="about__principles">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="about__principle-card">
                <div className="about__principle-icon">
                  <principle.icon size={24} />
                </div>
                <div>
                  <h3 className="about__principle-title">{principle.title}</h3>
                  <p className="about__principle-desc">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
