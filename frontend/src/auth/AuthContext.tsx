import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/api/auth';
import { clearTokens, hasTokens, setTokens } from '@/auth/tokenStore';
import { emitGlobalSuccess } from '@/lib/globalSuccessBus';
import type { AuthMeResponse, LoginRequest, RegisterRequest } from '@/types/api';

type AuthContextValue = {
  user: AuthMeResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isScanner: boolean;
  isLoading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (!hasTokens()) {
      setUser(null);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      await refreshMe();
      setIsLoading(false);
    };
    void boot();
  }, [refreshMe]);

  const login = useCallback(async (body: LoginRequest) => {
    const tokens = await authApi.login(body);
    setTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const tokens = await authApi.register(body);
    setTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setUser(null);
      emitGlobalSuccess('Signed out successfully.');
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isScanner: user?.role === 'SCANNER',
    isLoading,
    login,
    register,
    logout,
    refreshMe,
  }), [isLoading, login, logout, refreshMe, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
