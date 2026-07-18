import type { Project, ProjectCategory } from '../models';

export type FilterOption = 'all' | ProjectCategory;

export class ProjectFilterService {
  static filterProjects(projects: Project[], filter: FilterOption): Project[] {
    if (filter === 'all') {
      return projects;
    }
    return projects.filter((project) => project.category === filter);
  }

  static getFilterLabels(): Record<FilterOption, string> {
    return {
      all: 'Todos',
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Full Stack',
      api: 'APIs',
      data: 'Data / ML',
      mobile: 'Mobile',
    };
  }
}
