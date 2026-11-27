import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, CompanyProfile, LoginRequest, RegisterRequest } from '../api/types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../api/client';
import { AuthContext, type AuthContextType } from './context';

const USER_STORAGE_KEY = 'ledgerguard_auth_user';
const COMPANY_STORAGE_KEY = 'ledgerguard_auth_company';

// Decode token payload ONLY for UX expiry display, never for security decisions
function parseJwtExpiry(token: string): Date | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (typeof payload.exp === 'number') {
      return new Date(payload.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem(USER_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as UserProfile) : null;
    } catch {
      return null;
    }
  });
  const [company, setCompany] = useState<CompanyProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem(COMPANY_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CompanyProfile) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const tokenExpiresAt = token ? parseJwtExpiry(token) : null;

  const logout = useCallback((notice?: string) => {
    clearStoredToken();
    try {
      sessionStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(COMPANY_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setToken(null);
    setUser(null);
    setCompany(null);
    if (notice) {
      setAuthNotice(notice);
    }
  }, []);

  // Listen for global 401 auth required events
  useEffect(() => {
    const handleAuthRequired = (event: Event) => {
      const customEvent = event as CustomEvent<{ reason?: string }>;
      logout(customEvent.detail?.reason || 'Your session has expired. Please sign in again.');
    };

    window.addEventListener('ledgerguard_auth_required', handleAuthRequired);
    return () => {
      window.removeEventListener('ledgerguard_auth_required', handleAuthRequired);
    };
  }, [logout]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setAuthNotice(null);
    try {
      const res = await api.login(credentials);
      const authData = res.data;
      setStoredToken(authData.token);
      try {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
        sessionStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(authData.company));
      } catch {
        // Ignore
      }
      setToken(authData.token);
      setUser(authData.user);
      setCompany(authData.company);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setAuthNotice(null);
    try {
      const res = await api.register(payload);
      const authData = res.data;
      setStoredToken(authData.token);
      try {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
        sessionStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(authData.company));
      } catch {
        // Ignore
      }
      setToken(authData.token);
      setUser(authData.user);
      setCompany(authData.company);
    } finally {
      setIsLoading(false);
    }
  };

  const clearNotice = () => setAuthNotice(null);

  const value: AuthContextType = {
    token,
    user,
    company,
    isAuthenticated: Boolean(token && user),
    isLoading,
    authNotice,
    login,
    register,
    logout,
    clearNotice,
    tokenExpiresAt,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
