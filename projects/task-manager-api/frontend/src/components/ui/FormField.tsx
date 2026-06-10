import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  error?: string;
  hint?: string;
}

export function FormField({ label, icon, suffix, error, hint, id, className = '', ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      <label htmlFor={fieldId} className="form-field__label">
        {label}
      </label>
      <div className="form-field__control">
        {icon && <span className="form-field__icon">{icon}</span>}
        <input id={fieldId} className={`form-field__input ${suffix ? 'form-field__input--suffix' : ''}`} {...props} />
        {suffix}
      </div>
      {hint && !error && <span className="form-field__hint">{hint}</span>}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
