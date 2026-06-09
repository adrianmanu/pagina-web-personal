export type ProjectCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'api'
  | 'data'
  | 'mobile';

export interface Project {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: ProjectCategory;
  featured: boolean;
  githubUrl?: string;
  githubPath?: string;
  liveUrl?: string;
  apkUrl?: string;
  demoVideoUrl?: string;
  imageGradient: string;
  highlights: string[];
}
