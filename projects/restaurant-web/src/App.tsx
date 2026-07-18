import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MenuPage } from './pages/MenuPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { GalleryPage } from './pages/GalleryPage';
import { HoursPage } from './pages/HoursPage';
import { LocationPage } from './pages/LocationPage';
import { ReservationPage } from './pages/ReservationPage';
import { DeliveryPage } from './pages/DeliveryPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="nosotros" element={<AboutPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="promociones" element={<PromotionsPage />} />
          <Route path="galeria" element={<GalleryPage />} />
          <Route path="horarios" element={<HoursPage />} />
          <Route path="ubicacion" element={<LocationPage />} />
          <Route path="reservas" element={<ReservationPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
