import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface PanelFieldBaseProps {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface PanelInputProps extends PanelFieldBaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface PanelTextareaProps extends PanelFieldBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

interface PanelSelectProps extends PanelFieldBaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select';
  children: ReactNode;
}

type PanelFieldProps = PanelInputProps | PanelTextareaProps | PanelSelectProps;

export function PanelField(props: PanelFieldProps) {
  const { label, error, hint, id, className = '', style, as = 'input' } = props;
  const fieldId = id ?? ('name' in props ? props.name?.toString() : undefined) ?? label.replace(/\s+/g, '-').toLowerCase();
  const controlClass = error ? 'panel-field__control panel-field__control--error' : 'panel-field__control';

  let control: ReactNode;
  if (as === 'textarea') {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, ...rest } = props as PanelTextareaProps;
    control = <textarea id={fieldId} className={controlClass} {...rest} />;
  } else if (as === 'select') {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, children, ...rest } = props as PanelSelectProps;
    control = (
      <select id={fieldId} className={controlClass} {...rest}>
        {children}
      </select>
    );
  } else {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, ...rest } = props as PanelInputProps;
    control = <input id={fieldId} className={controlClass} {...rest} />;
  }

  return (
    <div className={`panel-field ${error ? 'panel-field--error' : ''} ${className}`} style={style}>
      <label htmlFor={fieldId} className="panel-field__label">
        {label}
      </label>
      {control}
      {hint && !error && <span className="panel-field__hint">{hint}</span>}
      {error && <span className="panel-field__error" role="alert">{error}</span>}
    </div>
  );
}
