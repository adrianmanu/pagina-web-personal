import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminRoute() {
  const { admin } = useAdminAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
