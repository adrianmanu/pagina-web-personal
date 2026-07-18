import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminRoute } from './components/admin/AdminRoute';
import { StoreLayout } from './components/store/StoreLayout';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AccountPage } from './pages/store/AccountPage';
import { CartPage } from './pages/store/CartPage';
import { CatalogPage } from './pages/store/CatalogPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { ContactPage } from './pages/store/ContactPage';
import { HomePage } from './pages/store/HomePage';
import { ProductPage } from './pages/store/ProductPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tienda" element={<CatalogPage />} />
              <Route path="producto/:id" element={<ProductPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="cuenta" element={<AccountPage />} />
              <Route path="contacto" element={<ContactPage />} />
            </Route>

            <Route path="admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="categorias" element={<AdminCategoriesPage />} />
                <Route path="inventario" element={<AdminInventoryPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
                <Route path="usuarios" element={<AdminUsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
}
