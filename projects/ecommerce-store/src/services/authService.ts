import type { StoreInfo, User } from '../models/types';
import { KEYS, generateId, load, save } from './storage';
import { hashPassword, seedIfNeeded } from './seedService';

function users(): User[] {
  seedIfNeeded();
  return load<User[]>(KEYS.users, []);
}

export const authService = {
  login(email: string, password: string): User | null {
    const hashed = hashPassword(password);
    return users().find((u) => u.email === email && u.password === hashed) ?? null;
  },

  register(name: string, email: string, password: string, phone?: string): User | null {
    if (users().some((u) => u.email === email)) return null;
    const user: User = {
      id: generateId(),
      name,
      email,
      password: hashPassword(password),
      phone,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    save(KEYS.users, [...users(), user]);
    return user;
  },

  listCustomers(): User[] {
    return users().filter((u) => u.role === 'customer');
  },

  getById(id: string): User | undefined {
    return users().find((u) => u.id === id);
  },
};

export const storeService = {
  get(): StoreInfo {
    seedIfNeeded();
    return load<StoreInfo>(KEYS.store, {
      name: 'TiendaNova',
      tagline: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      hours: '',
    });
  },
};

export function getSession(): string | null {
  return load<string | null>(KEYS.session, null);
}

export function setSession(userId: string | null): void {
  save(KEYS.session, userId);
}

export function getCurrentUser(): User | null {
  const id = getSession();
  if (!id) return null;
  return authService.getById(id) ?? null;
}
