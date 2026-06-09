import './Badge.css';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'accent';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
