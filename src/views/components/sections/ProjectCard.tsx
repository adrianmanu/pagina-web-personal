import { Download, ExternalLink, Play, Smartphone, Star } from 'lucide-react';
import { isFreelanceMode, resolveGithubTreeUrl, resolvePublicUrl } from '../../../config/site';
import { GithubIcon } from '../ui/SocialIcons';
import type { Project } from '../../../models';
import { Badge } from '../ui/Badge';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isMobile = project.category === 'mobile';
  const githubUrl = project.githubPath
    ? resolveGithubTreeUrl(project.githubPath)
    : project.githubUrl;
  const liveUrl = project.liveUrl ? resolvePublicUrl(project.liveUrl) : undefined;
  const serverAppUrl = project.serverAppUrl
    ? resolvePublicUrl(project.serverAppUrl)
    : undefined;
  const apkUrl =
    project.apkUrl && !(isMobile && liveUrl)
      ? resolvePublicUrl(project.apkUrl)
      : undefined;

  return (
    <article className="project-card">
      <div
        className="project-card__image"
        style={{ background: project.imageGradient }}
      >
        <div className="project-card__image-overlay">
          {isMobile ? (
            <Smartphone size={48} className="project-card__mobile-icon" />
          ) : (
            <span className="project-card__initials">
              {project.title
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)}
            </span>
          )}
        </div>
        {project.featured && (
          <span className="project-card__featured">
            <Star size={12} /> Destacado
          </span>
        )}
        {isMobile && (
          <span className="project-card__platform">Android APK</span>
        )}
      </div>

      <div className="project-card__body">
        <div className="project-card__meta">
          <span className="project-card__company">{project.company}</span>
          <span className="project-card__period">{project.period}</span>
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__desc">{project.description}</p>

        <ul className="project-card__highlights">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="project-card__tech">
          {project.technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <div className="project-card__links">
          {!isFreelanceMode && githubUrl && githubUrl !== '#' && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link"
            >
              <GithubIcon size={16} /> Código
            </a>
          )}
          {apkUrl && (
            <a
              href={apkUrl}
              download
              className="project-card__link project-card__link--apk"
            >
              <Download size={16} /> Descargar APK
            </a>
          )}
          {project.demoVideoUrl && (
            <a
              href={project.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link project-card__link--video"
            >
              <Play size={16} /> Ver demo
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link project-card__link--live"
            >
              <ExternalLink size={16} /> Ver proyecto
            </a>
          )}
          {serverAppUrl && (
            <a
              href={serverAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link project-card__link--live"
            >
              <ExternalLink size={16} /> Servidor live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
