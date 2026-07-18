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
import { storeService } from '../../services/authService';
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
          <p>{store.tagline}. Compra en línea con entrega rápida en Quito y alrededores.</p>
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
            <li>Productos seleccionados con calidad</li>
            <li>Atención por WhatsApp y pedidos online</li>
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
              Nacimos con la idea de acercar nuestra tienda a más personas a través de internet,
              sin perder el trato personal que nos caracteriza.
            </p>
            <p>
              Vendemos artículos seleccionados para el día a día: desde moda y accesorios hasta
              productos para el hogar y cuidado personal. Cada pieza del catálogo es elegida pensando
              en calidad, utilidad y buen precio.
            </p>
          </div>

          <div className="about-card">
            <Clock size={22} className="about-card__icon" />
            <h3>Disponibles 24/7</h3>
            <p>
              Nuestra tienda online está abierta todo el día, todos los días. Puedes explorar el
              catálogo, armar tu carrito y hacer tu pedido a la hora que te convenga, incluso de
              noche o en fin de semana.
            </p>
          </div>

          <div className="about-card">
            <Truck size={22} className="about-card__icon" />
            <h3>Entrega en máximo 3 días</h3>
            <p>
              Coordinamos el despacho de tu pedido de forma ágil. En Quito y valles cercanos la
              entrega se realiza en un máximo de <strong>3 días hábiles</strong> después de
              confirmar tu compra. Te avisamos por WhatsApp cuando tu pedido esté en camino.
            </p>
          </div>

          <div className="about-card">
            <Package size={22} className="about-card__icon" />
            <h3>Qué vendemos</h3>
            <p>
              Manejamos {categories.length} líneas de producto: {categoryNames}. Trabajamos con
              inventario actualizado para que veas en tiempo real qué hay disponible antes de
              comprar.
            </p>
          </div>

          <div className="about-card">
            <Heart size={22} className="about-card__icon" />
            <h3>Nuestro compromiso</h3>
            <p>
              Queremos que tu experiencia sea sencilla: navegar, elegir, pagar y recibir. Aceptamos
              transferencia y efectivo contra entrega. Si tienes dudas, escríbenos — estamos para
              ayudarte.
            </p>
          </div>
        </div>
        <p className="about-hours muted">
          Horario de atención presencial y WhatsApp: {store.hours} · {store.address}
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
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
