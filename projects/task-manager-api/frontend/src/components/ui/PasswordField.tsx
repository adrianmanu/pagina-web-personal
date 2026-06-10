import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { FormField } from './FormField';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  minLength?: number;
  showStrength?: boolean;
}

function getStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Débil' };
  if (score <= 3) return { level: 2, label: 'Media' };
  return { level: 3, label: 'Fuerte' };
}

export function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  minLength,
  showStrength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getStrength(value) : null;

  return (
    <div className="password-field">
      <FormField
        label={label}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        hint={hint}
        minLength={minLength}
        icon={<Lock size={18} />}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        suffix={
          <button
            type="button"
            className="password-field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />
      {strength && value && (
        <div className="password-strength">
          <div className="password-strength__bars">
            {[1, 2, 3].map((bar) => (
              <span
                key={bar}
                className={`password-strength__bar ${bar <= strength.level ? `password-strength__bar--${strength.level}` : ''}`}
              />
            ))}
          </div>
          <span className="password-strength__label">{strength.label}</span>
        </div>
      )}
    </div>
  );
}
