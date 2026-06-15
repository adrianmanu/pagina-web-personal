import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminRoute } from './components/admin/AdminRoute';
import { StoreLayout } from './components/store/StoreLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { CartPage } from './pages/store/CartPage';
import { CatalogPage } from './pages/store/CatalogPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { ContactPage } from './pages/store/ContactPage';
import { HomePage } from './pages/store/HomePage';
import { ProductPage } from './pages/store/ProductPage';

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tienda" element={<CatalogPage />} />
              <Route path="producto/:id" element={<ProductPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="admin/login" element={<AdminLoginPage />} />
            </Route>

            <Route path="admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/productos" replace />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </AdminAuthProvider>
  );
}
