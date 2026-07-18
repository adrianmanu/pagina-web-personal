import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../models/types';
import { authService, getCurrentUser, setSession } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, phone?: string) => boolean;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const refresh = useCallback(() => setUser(getCurrentUser()), []);

  const login = useCallback((email: string, password: string) => {
    const found = authService.login(email, password);
    if (!found) return false;
    setSession(found.id);
    setUser(found);
    return true;
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string, phone?: string) => {
      const created = authService.register(name, email, password, phone);
      if (!created) return false;
      setSession(created.id);
      setUser(created);
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, refresh }),
    [user, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
