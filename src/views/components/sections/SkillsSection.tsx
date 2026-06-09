import type { Skill } from '../../../models';
import { SectionTitle } from '../ui/SectionTitle';
import './SkillsSection.css';

interface SkillsSectionProps {
  skills: Skill[];
}

const LEVEL_LABELS: Record<Skill['level'], string> = {
  expert: 'Experto',
  advanced: 'Avanzado',
  intermediate: 'Intermedio',
};

const CATEGORY_LABELS: Record<Skill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  language: 'Lenguajes',
  tools: 'Herramientas',
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <section id="habilidades" className="skills section">
      <div className="container">
        <SectionTitle
          label="Habilidades"
          title="Stack tecnológico"
          subtitle="Tecnologías con las que trabajo día a día para construir soluciones robustas."
          align="center"
        />

        <div className="skills__grid">
          {categories.map((category) => (
            <div key={category} className="skills__category">
              <h3 className="skills__category-title">{CATEGORY_LABELS[category]}</h3>
              <div className="skills__list">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <div key={skill.name} className="skills__card">
                      <span className="skills__icon">{skill.icon}</span>
                      <div className="skills__info">
                        <span className="skills__name">{skill.name}</span>
                        <span className={`skills__level skills__level--${skill.level}`}>
                          {LEVEL_LABELS[skill.level]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
