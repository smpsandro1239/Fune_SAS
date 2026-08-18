'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ApiUser,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens,
  apiService,
} from '@/lib/api';

interface AuthContextType {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const profile = await apiService.auth.me();
        if (!cancelled) setUser(profile);
      } catch {
        clearTokens();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const isPublicPath = pathname === '/login' || pathname.startsWith('/public');

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPath) {
      router.replace('/login');
    }
  }, [loading, user, pathname, router, isPublicPath]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await apiService.auth.login(email, password);
      storeTokens(tokens);
      const profile = await apiService.auth.me();
      setUser(profile);
      router.replace('/');
    },
    [router],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await apiService.auth.logout(refreshToken);
    } catch {
      // sessão já pode estar expirada no servidor
    }
    clearTokens();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(() => ({ user, setUser, loading, login, logout }), [user, loading, login, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 animate-pulse">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center text-xl font-serif font-bold gold-gradient-text">
              F
            </div>
          </div>
          <p className="text-xs text-navy-300 font-medium">A carregar a sessão...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
