export function normalizeTaxId(value: string): string {
  return value.replace(/\D/g, '');
}

export function taxIdTypeLabel(value: string): 'RUC' | 'Cédula' | null {
  const normalized = normalizeTaxId(value);
  if (normalized.length === 13) return 'RUC';
  if (normalized.length === 10) return 'Cédula';
  return null;
}

export function validateTaxId(value: string): string | undefined {
  const normalized = normalizeTaxId(value);
  if (!normalized) return 'La identificación es obligatoria';
  if (normalized.length !== 10 && normalized.length !== 13) {
    return 'Debe ser cédula (10 dígitos) o RUC (13 dígitos)';
  }
  return undefined;
}

export function validateRuc(value: string): string | undefined {
  const normalized = normalizeTaxId(value);
  if (!normalized) return 'El RUC es obligatorio';
  if (normalized.length !== 13) return 'El RUC debe tener 13 dígitos';
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} es obligatorio`;
  return undefined;
}

export function validateEmail(value: string, required = false): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'El correo es obligatorio' : undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Correo inválido';
  return undefined;
}

export function validateEmissionCode(value: string, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} es obligatorio`;
  if (!/^\d{3}$/.test(trimmed)) return `${label} debe ser 3 dígitos (ej. 001)`;
  return undefined;
}

export function validatePositiveAmount(value: number, label = 'El monto'): string | undefined {
  if (!Number.isFinite(value) || value <= 0) return `${label} debe ser mayor a cero`;
  return undefined;
}

export function validateAccessKey(value: string, required = false): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'La clave de acceso es obligatoria' : undefined;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 49) return 'La clave de acceso debe tener 49 dígitos';
  return undefined;
}

export function validateDocumentNumber(value: string, label = 'El número de documento'): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} es obligatorio`;
  if (!/^\d{3}-\d{3}-\d{9}$/.test(trimmed)) {
    return `${label} debe tener formato 001-002-000000123`;
  }
  return undefined;
}

export function validateXmlContent(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Pega el contenido XML del comprobante';
  if (!trimmed.includes('<') || !trimmed.includes('>')) return 'El contenido no parece XML válido';
  return undefined;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

export function firstFieldError<T extends string>(errors: FieldErrors<T>): string | undefined {
  const values = Object.values(errors).filter(Boolean);
  return values.length ? (values[0] as string) : undefined;
}
