import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandedLoaderBlock } from './BrandedLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <BrandedLoaderBlock size="lg" fullScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
