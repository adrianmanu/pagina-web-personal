import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AtsPage } from './pages/AtsPage';
import { BillingPage } from './pages/BillingPage';
import { CreditNotesPage } from './pages/CreditNotesPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { DebitNotesPage } from './pages/DebitNotesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { LoginPage } from './pages/LoginPage';
import { MembershipPage } from './pages/MembershipPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProformasPage } from './pages/ProformasPage';
import { PurchaseSettlementsPage } from './pages/PurchaseSettlementsPage';
import { ReceivedDocumentsPage } from './pages/ReceivedDocumentsPage';
import { RegisterPage } from './pages/RegisterPage';
import { RetentionsPage } from './pages/RetentionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { WaybillsPage } from './pages/WaybillsPage';

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/proformas" element={<ProformasPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route path="/membresia" element={<MembershipPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/notas-credito" element={<CreditNotesPage />} />
            <Route path="/notas-debito" element={<DebitNotesPage />} />
            <Route path="/documentos" element={<DocumentsPage />} />
            <Route path="/proveedores" element={<SuppliersPage />} />
            <Route path="/liquidaciones-compra" element={<PurchaseSettlementsPage />} />
            <Route path="/documentos-recibidos" element={<ReceivedDocumentsPage />} />
            <Route path="/ats" element={<AtsPage />} />
            <Route path="/retenciones" element={<RetentionsPage />} />
            <Route path="/guias-remision" element={<WaybillsPage />} />
            <Route path="/facturacion" element={<BillingPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
