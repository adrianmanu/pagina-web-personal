import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/SocialIcons';
import type { Profile } from '../../../models';
import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';
import './ContactSection.css';

interface ContactSectionProps {
  profile: Profile;
}

export function ContactSection({ profile }: ContactSectionProps) {
  return (
    <section id="contacto" className="contact section">
      <div className="container">
        <SectionTitle
          label="Contacto"
          title="¿Trabajamos juntos?"
          subtitle="Estoy abierto a nuevas oportunidades, proyectos freelance y colaboraciones."
          align="center"
        />

        <div className="contact__card">
          <div className="contact__info">
            <div className="contact__item">
              <Mail size={20} className="contact__icon" />
              <div>
                <span className="contact__label">Email</span>
                <a href={`mailto:${profile.email}`} className="contact__value">
                  {profile.email}
                </a>
              </div>
            </div>

            <div className="contact__item">
              <Phone size={20} className="contact__icon" />
              <div>
                <span className="contact__label">Teléfono</span>
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="contact__value">
                  {profile.phone}
                </a>
              </div>
            </div>

            <div className="contact__item">
              <MapPin size={20} className="contact__icon" />
              <div>
                <span className="contact__label">Ubicación</span>
                <span className="contact__value">{profile.location}</span>
              </div>
            </div>

            {(profile.github || profile.linkedin) && (
              <div className="contact__social">
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
              </div>
            )}
          </div>

          <div className="contact__cta">
            <p className="contact__cta-text">
              ¿Tienes un proyecto en mente? Me encantaría escuchar sobre él.
            </p>
            <Button href={`mailto:${profile.email}`} size="lg">
              <Send size={18} /> Enviar mensaje
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
