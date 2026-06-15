import type { AdminUser, StoreInfo } from '../models/types';
import { KEYS, load, save } from './storage';
import { hashPassword, seedIfNeeded } from './seedService';

function admin(): AdminUser {
  seedIfNeeded();
  return load<AdminUser>(KEYS.admin, {
    id: '',
    email: '',
    password: '',
    name: 'Admin',
  });
}

export const adminAuthService = {
  login(email: string, password: string): AdminUser | null {
    const user = admin();
    const hashed = hashPassword(password);
    if (user.email === email && user.password === hashed) return user;
    return null;
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

export function setSession(adminId: string | null): void {
  save(KEYS.session, adminId);
}

export function getCurrentAdmin(): AdminUser | null {
  const id = getSession();
  if (!id) return null;
  const user = admin();
  return user.id === id ? user : null;
}
