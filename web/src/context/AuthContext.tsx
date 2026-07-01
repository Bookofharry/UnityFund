import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authApi, User } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  setSession: (user: User, accessToken: string) => void;
  logout: () => void;
  activeOrg: { id: string; name: string; role: string } | null;
  setActiveOrg: (org: { id: string; name: string; role: string } | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOrg, setActiveOrg] = useState<{ id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }

    authApi.me().then((u) => {
      setUser(u);
      const orgs = u.orgMemberships ?? u.memberships ?? [];
      if (orgs.length > 0) {
        const m = orgs[0];
        setActiveOrg({ id: m.organization.id, name: m.organization.name, role: m.role });
      }
    }).catch(() => {
      localStorage.removeItem('access_token');
    }).finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((u: User, accessToken: string) => {
    localStorage.setItem('access_token', accessToken);
    setUser(u);
    const orgs = u.orgMemberships ?? u.memberships ?? [];
    if (orgs.length > 0) {
      const m = orgs[0];
      setActiveOrg({ id: m.organization.id, name: m.organization.name, role: m.role });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await authApi.login(email, password);
    localStorage.setItem('access_token', accessToken);
    const u = await authApi.me();
    setSession(u, accessToken);
  }, [setSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
    setActiveOrg(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, setSession, logout, activeOrg, setActiveOrg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
