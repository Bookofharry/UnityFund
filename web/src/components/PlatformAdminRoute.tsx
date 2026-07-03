import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandedLoaderBlock } from './BrandedLoader';

export function PlatformAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <BrandedLoaderBlock size="lg" fullScreen />;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const memberships = user.orgMemberships ?? user.memberships ?? [];
  const isPlatformAdmin = memberships.some((m) => m.role === 'platform_admin');
  if (!isPlatformAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
