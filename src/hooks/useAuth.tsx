import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, LoginPayload } from '../services/auth';
import { AdminUser } from '../types';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(authService.getStoredAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getMe();
          setAdmin(user);
          setIsAuthenticated(true);
        } catch {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    setAdmin(res.admin);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const refreshAdmin = async () => {
    try {
      const user = await authService.getMe();
      setAdmin(user);
      setIsAuthenticated(true);
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, isLoading, login, logout, refreshAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
