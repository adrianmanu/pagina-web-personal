import type { InputHTMLAttributes } from 'react';
import { PanelField } from './PanelField';
import { taxIdTypeLabel } from '../../utils/validation';

interface TaxIdFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  requireRuc?: boolean;
}

export function TaxIdField({
  label = 'Cédula / RUC',
  error,
  hint,
  value = '',
  requireRuc = false,
  ...props
}: TaxIdFieldProps) {
  const typeLabel = taxIdTypeLabel(String(value));
  const resolvedHint =
    hint ??
    (typeLabel
      ? `Detectado: ${typeLabel}`
      : requireRuc
        ? 'Ingresa el RUC de 13 dígitos'
        : 'Cédula (10) o RUC (13 dígitos)');

  return (
    <PanelField
      label={label}
      error={error}
      hint={resolvedHint}
      value={value}
      inputMode="numeric"
      autoComplete="off"
      placeholder={requireRuc ? '1712345678001' : '1712345678 o 1712345678001'}
      {...props}
    />
  );
}
