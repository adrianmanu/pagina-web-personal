import { useMemo } from 'react';
import { PortfolioService } from '../services';

export function usePortfolioController() {
  const profile = useMemo(() => PortfolioService.getProfile(), []);
  const navItems = useMemo(() => PortfolioService.getNavItems(), []);
  const skills = useMemo(() => PortfolioService.getSkills(), []);
  const projects = useMemo(() => PortfolioService.getProjects(), []);
  const featuredProjects = useMemo(() => PortfolioService.getFeaturedProjects(), []);

  return {
    profile,
    navItems,
    skills,
    projects,
    featuredProjects,
  };
}
