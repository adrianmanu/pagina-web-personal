import './SectionTitle.css';

interface SectionTitleProps {
  label: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({
  label,
  title,
  subtitle,
  align = 'left',
}: SectionTitleProps) {
  return (
    <div className={`section-header section-header--${align}`}>
      <span className="section-label">{label}</span>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
