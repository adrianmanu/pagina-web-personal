import { Menu, X } from 'lucide-react';
import type { NavItem } from '../../../models';
import './Header.css';

interface HeaderProps {
  navItems: NavItem[];
  activeSection: string;
  isScrolled: boolean;
  isMenuOpen: boolean;
  onNavigate: (href: string) => void;
  onToggleMenu: () => void;
}

export function Header({
  navItems,
  activeSection,
  isScrolled,
  isMenuOpen,
  onNavigate,
  onToggleMenu,
}: HeaderProps) {
  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a
          href="#inicio"
          className="header__logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('#inicio');
          }}
        >
          <span className="header__logo-bracket">&lt;</span>
          AR
          <span className="header__logo-bracket">/&gt;</span>
        </a>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`header__nav-link ${
                    activeSection === item.id ? 'header__nav-link--active' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.href);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="header__menu-btn"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
