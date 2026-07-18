import type { ReactNode } from 'react';
import type { NavItem } from '../../../models';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeSection: string;
  isScrolled: boolean;
  isMenuOpen: boolean;
  onNavigate: (href: string) => void;
  onToggleMenu: () => void;
}

export function Layout({
  children,
  navItems,
  activeSection,
  isScrolled,
  isMenuOpen,
  onNavigate,
  onToggleMenu,
}: LayoutProps) {
  return (
    <>
      <Header
        navItems={navItems}
        activeSection={activeSection}
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        onNavigate={onNavigate}
        onToggleMenu={onToggleMenu}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
