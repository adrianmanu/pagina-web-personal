interface Props {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeading({ label, title, description }: Props) {
  return (
    <div className="section-heading">
      <span className="section-heading__label">{label}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
