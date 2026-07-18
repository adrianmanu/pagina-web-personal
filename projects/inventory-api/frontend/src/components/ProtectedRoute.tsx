import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.onboardingCompleted === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.onboardingCompleted !== false && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
