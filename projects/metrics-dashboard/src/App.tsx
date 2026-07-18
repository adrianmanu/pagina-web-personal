import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './views/components/Layout';
import { ToastProvider } from './views/components/Toast';
import { CustomersPage } from './views/pages/CustomersPage';
import { DashboardPage } from './views/pages/DashboardPage';
import { OrdersPage } from './views/pages/OrdersPage';

function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
