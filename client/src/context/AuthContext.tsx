import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface UserProfile {
  name: string;
  role: string;
  tenantName: string;
  email?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loginSession: (token: string, userData?: Partial<UserProfile>) => void;
  logoutSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ledgerToken'))
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('ledgerUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('ledgerToken', token)
    } else {
      localStorage.removeItem('ledgerToken')
    }
  }, [token])

  const loginSession = (newToken: string, userData?: Partial<UserProfile>) => {
    setToken(newToken)
    const profile: UserProfile = {
      name: userData?.name || 'Priyanka',
      role: userData?.role || 'Security Admin',
      tenantName: userData?.tenantName || 'Company A',
      email: userData?.email
    }
    setUser(profile)
    localStorage.setItem('ledgerUser', JSON.stringify(profile))
  }

  const logoutSession = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ledgerToken')
    localStorage.removeItem('ledgerUser')
  }

  return (
    <AuthContext.Provider value={{ user, token, loginSession, logoutSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}