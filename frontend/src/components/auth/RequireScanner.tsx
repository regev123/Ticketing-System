import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from '@/components';
import { useAuth } from '@/hooks';

export function RequireScanner({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isScanner, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  if (!isAdmin && !isScanner) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
