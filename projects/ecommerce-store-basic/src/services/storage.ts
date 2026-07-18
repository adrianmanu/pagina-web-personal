const PREFIX = 'tianova_basic_';

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function clearStore(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

export const KEYS = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  store: 'store',
  admin: 'admin',
  session: 'session',
  cart: 'cart',
  seeded: 'seeded',
} as const;
