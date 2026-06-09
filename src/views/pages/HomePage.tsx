import { usePortfolioController, useNavigationController, useProjectFilterController } from '../../controllers';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { SkillsSection } from '../components/sections/SkillsSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';

export function HomePage() {
  const { profile, navItems, skills, projects } = usePortfolioController();
  const { activeSection, isMenuOpen, isScrolled, navigateTo, toggleMenu } =
    useNavigationController();
  const { activeFilter, setActiveFilter, filteredProjects, filterLabels, filters } =
    useProjectFilterController(projects);

  return (
    <Layout
      profile={profile}
      navItems={navItems}
      activeSection={activeSection}
      isScrolled={isScrolled}
      isMenuOpen={isMenuOpen}
      onNavigate={navigateTo}
      onToggleMenu={toggleMenu}
    >
      <HeroSection profile={profile} onNavigate={navigateTo} />
      <AboutSection profile={profile} />
      <SkillsSection skills={skills} />
      <ProjectsSection
        projects={filteredProjects}
        filters={filters}
        filterLabels={filterLabels}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ContactSection profile={profile} />
    </Layout>
  );
}
