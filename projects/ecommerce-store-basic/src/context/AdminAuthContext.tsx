import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdminUser } from '../models/types';
import { adminAuthService, getCurrentAdmin, setSession } from '../services/adminAuthService';

interface AdminAuthContextValue {
  admin: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(getCurrentAdmin);

  const login = useCallback((email: string, password: string) => {
    const user = adminAuthService.login(email, password);
    if (!user) return false;
    setSession(user.id);
    setAdmin(user);
    return true;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth outside provider');
  return ctx;
}
