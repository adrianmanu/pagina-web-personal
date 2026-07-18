import { useMemo, useState } from 'react';
import type { Project } from '../models';
import { ProjectFilterService, type FilterOption } from '../services';

export function useProjectFilterController(projects: Project[]) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredProjects = useMemo(
    () => ProjectFilterService.filterProjects(projects, activeFilter),
    [projects, activeFilter],
  );

  const filterLabels = useMemo(() => ProjectFilterService.getFilterLabels(), []);

  const filters = useMemo(
    () => Object.keys(filterLabels) as FilterOption[],
    [filterLabels],
  );

  return {
    activeFilter,
    setActiveFilter,
    filteredProjects,
    filterLabels,
    filters,
  };
}
