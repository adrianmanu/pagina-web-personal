export type SkillLevel = 'expert' | 'advanced' | 'intermediate';

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'language' | 'tools';
  level: SkillLevel;
  icon: string;
}
