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
  /** App SPA desplegada con backend real (ej. /apps/stockflow-live/) */
  serverAppUrl?: string;
  apkUrl?: string;
  demoVideoUrl?: string;
  imageGradient: string;
  highlights: string[];
}
