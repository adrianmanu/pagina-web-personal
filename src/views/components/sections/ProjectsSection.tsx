import type { Project } from '../../../models';
import type { FilterOption } from '../../../services';
import { SectionTitle } from '../ui/SectionTitle';
import { ProjectCard } from './ProjectCard';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  projects: Project[];
  filters: FilterOption[];
  filterLabels: Record<FilterOption, string>;
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function ProjectsSection({
  projects,
  filters,
  filterLabels,
  activeFilter,
  onFilterChange,
}: ProjectsSectionProps) {
  return (
    <section id="proyectos" className="projects section">
      <div className="container">
        <SectionTitle
          label="Portafolio"
          title="Proyectos destacados"
          subtitle="Proyectos profesionales y de portafolio en backend, frontend, mobile y automatización de datos."
          align="center"
        />

        <div className="projects__filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`projects__filter ${
                activeFilter === filter ? 'projects__filter--active' : ''
              }`}
              onClick={() => onFilterChange(filter)}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>

        <div className="projects__grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="projects__empty">No hay proyectos en esta categoría.</p>
        )}
      </div>
    </section>
  );
}
