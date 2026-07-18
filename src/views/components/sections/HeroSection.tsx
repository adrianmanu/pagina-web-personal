import { ArrowDown, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/SocialIcons';
import type { Profile } from '../../../models';
import { Button } from '../ui/Button';
import './HeroSection.css';

interface HeroSectionProps {
  profile: Profile;
  onNavigate: (href: string) => void;
}

export function HeroSection({ profile, onNavigate }: HeroSectionProps) {
  return (
    <section id="inicio" className="hero section">
      <div className="hero__bg-grid" />
      <div className="hero__glow" />

      <div className="container hero__content">
        <div className="hero__badge animate-fade-in-up">
          <span className="hero__status-dot" />
          Disponible para proyectos
        </div>

        <h1 className="hero__title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Hola, soy <span className="hero__name">{profile.name}</span>
        </h1>

        <p className="hero__subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {profile.title}
        </p>

        <p className="hero__tagline animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {profile.tagline}
        </p>

        <div className="hero__actions animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button onClick={() => onNavigate('#proyectos')}>
            Ver proyectos
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('#contacto')}>
            Contactar
          </Button>
        </div>

        <div className="hero__social animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon size={20} />
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon size={20} />
            </a>
          )}
          <a href={`mailto:${profile.email}`} aria-label="Email">
            <Mail size={20} />
          </a>
        </div>
      </div>

      <button
        className="hero__scroll"
        onClick={() => onNavigate('#sobre-mi')}
        aria-label="Scroll hacia abajo"
      >
        <ArrowDown size={20} />
      </button>
    </section>
  );
}
