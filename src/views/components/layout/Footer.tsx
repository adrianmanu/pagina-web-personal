import { Heart } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/SocialIcons';
import type { Profile } from '../../../models';
import './Footer.css';

interface FooterProps {
  profile: Profile;
}

export function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">
            <span className="footer__logo-bracket">&lt;</span>
            AR
            <span className="footer__logo-bracket">/&gt;</span>
          </span>
          <p className="footer__tagline">{profile.title}</p>
        </div>

        {(profile.github || profile.linkedin) && (
          <div className="footer__social">
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

        <p className="footer__copy">
          © {currentYear} {profile.name}. Hecho con <Heart size={14} className="footer__heart" /> y Clean Code.
        </p>
      </div>
    </footer>
  );
}
