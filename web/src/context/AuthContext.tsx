import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authApi, User } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  setSession: (user: User, accessToken: string, refreshToken?: string) => void;
  clearSession: () => void;
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

  const setSession = useCallback((u: User, accessToken: string, refreshToken?: string) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    setUser(u);
    const orgs = u.orgMemberships ?? u.memberships ?? [];
    if (orgs.length > 0) {
      const m = orgs[0];
      setActiveOrg({ id: m.organization.id, name: m.organization.name, role: m.role });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await authApi.login(email, password);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    const u = await authApi.me();
    setSession(u, accessToken);
    return u;
  }, [setSession]);

  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setActiveOrg(null);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refresh_token');
    // Revoke server-side, but don't block the redirect on it — logout must
    // always succeed locally even if this request fails.
    authApi.logout(refreshToken).catch(() => {});
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, setSession, clearSession, logout, activeOrg, setActiveOrg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
