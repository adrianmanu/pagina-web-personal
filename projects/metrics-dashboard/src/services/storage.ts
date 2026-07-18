/**
 * Repositorio de persistencia sobre localStorage.
 * Simula la capa de datos de una API: las colecciones sobreviven recargas
 * y sesiones del navegador.
 */
const PREFIX = 'metrix_';

export const COLLECTIONS = {
  customers: 'customers',
  orders: 'orders',
} as const;

export function loadCollection<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

export function saveCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items));
}

export function clearAllCollections(): void {
  Object.values(COLLECTIONS).forEach((key) => localStorage.removeItem(PREFIX + key));
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
