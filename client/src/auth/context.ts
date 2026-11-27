import { createContext } from 'react';
import type { UserProfile, CompanyProfile, LoginRequest, RegisterRequest } from '../api/types';

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  company: CompanyProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authNotice: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: (notice?: string) => void;
  clearNotice: () => void;
  tokenExpiresAt: Date | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
