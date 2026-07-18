import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Heart,
  Package,
  Sparkles,
  Truck,
} from 'lucide-react';
import { categoryService, productService } from '../../services/catalogService';
import { storeService } from '../../services/adminAuthService';
import { formatPrice, ProductImage } from '../../components/ui/ProductImage';

export function HomePage() {
  const store = storeService.get();
  const featured = productService.list(true).filter((p) => p.featured).slice(0, 4);
  const categories = categoryService.list();
  const categoryNames = categories.map((c) => c.name).join(', ');

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__copy">
          <span className="pill"><Sparkles size={14} /> Emprendimiento ecuatoriano</span>
          <h1>{store.name}</h1>
          <p>{store.tagline}. Compra en línea sin necesidad de crear una cuenta.</p>
          <div className="hero__cta">
            <Link to="/tienda" className="btn btn--primary">Ver catálogo <ArrowRight size={16} /></Link>
            <Link to="/contacto" className="btn btn--outline">Contactar</Link>
          </div>
        </div>
        <div className="hero__card">
          <p><strong>¿Por qué comprar con nosotros?</strong></p>
          <ul>
            <li>Tienda disponible las 24 horas del día</li>
            <li>Entregas en máximo 3 días hábiles</li>
            <li>Pedido rápido como invitado</li>
            <li>Atención por WhatsApp</li>
          </ul>
        </div>
      </section>

      <section className="section about-section">
        <div className="section__head">
          <h2>Sobre la empresa</h2>
        </div>
        <div className="about-grid">
          <div className="about-card about-card--main">
            <h3>Quiénes somos</h3>
            <p>
              <strong>{store.name}</strong> es un emprendimiento local en Quito dedicado a ofrecer
              productos de {categoryNames.toLowerCase()} con atención cercana y precios justos.
            </p>
            <p>
              Vendemos artículos seleccionados para el día a día. Cada pieza del catálogo está
              pensada en calidad, utilidad y buen precio.
            </p>
          </div>

          <div className="about-card">
            <Clock size={22} className="about-card__icon" />
            <h3>Disponibles 24/7</h3>
            <p>
              Nuestra tienda online está abierta todo el día. Explora el catálogo y haz tu pedido
              a la hora que te convenga.
            </p>
          </div>

          <div className="about-card">
            <Truck size={22} className="about-card__icon" />
            <h3>Entrega en máximo 3 días</h3>
            <p>
              En Quito y valles cercanos la entrega se realiza en un máximo de{' '}
              <strong>3 días hábiles</strong> después de confirmar tu compra.
            </p>
          </div>

          <div className="about-card">
            <Package size={22} className="about-card__icon" />
            <h3>Qué vendemos</h3>
            <p>
              Manejamos {categories.length} líneas: {categoryNames}. Los productos muestran si están
              disponibles o agotados.
            </p>
          </div>

          <div className="about-card">
            <Heart size={22} className="about-card__icon" />
            <h3>Nuestro compromiso</h3>
            <p>
              Experiencia sencilla: elegir, pedir y recibir. Pago por transferencia o efectivo
              contra entrega. ¿Dudas? Escríbenos por WhatsApp.
            </p>
          </div>
        </div>
        <p className="about-hours muted">
          Horario de atención: {store.hours} · {store.address}
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Categorías</h2>
          <Link to="/tienda">Ver todo</Link>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/tienda?categoria=${cat.id}`} className="category-card">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Destacados</h2>
        </div>
        <div className="product-grid">
          {featured.map((product) => {
            const cat = categoryService.getById(product.categoryId);
            return (
              <Link key={product.id} to={`/producto/${product.id}`} className="product-card">
                <ProductImage product={product} categoryName={cat?.name} />
                <div className="product-card__body">
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                  {!product.available && <span className="stock-out">Agotado</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
