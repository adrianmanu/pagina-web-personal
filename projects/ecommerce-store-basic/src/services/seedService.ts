import type { Category, Order, OrderItem, Product, StoreInfo, AdminUser } from '../models/types';
import { KEYS, generateId, load, save, clearStore } from './storage';

const STORE_INFO: StoreInfo = {
  name: 'TiendaNova',
  tagline: 'Emprendimiento local — Plan Básico',
  email: 'hola@tianova.demo',
  phone: '+593 99 123 4567',
  whatsapp: '593991234567',
  address: 'Av. República E7-120, Quito, Ecuador',
  hours: 'Lun–Vie 9:00–18:00 · Sáb 10:00–14:00',
};

const CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Ropa', slug: 'ropa' },
  { name: 'Accesorios', slug: 'accesorios' },
  { name: 'Hogar', slug: 'hogar' },
  { name: 'Belleza', slug: 'belleza' },
];

const PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'categoryId'>[] = [
  { name: 'Blusa linen terracota', description: 'Blusa ligera de lino, corte relajado.', price: 28.5, available: true, imageHue: 18, featured: true, active: true },
  { name: 'Pantalón wide leg', description: 'Pantalón de tiro alto, tela suave.', price: 42, available: true, imageHue: 210, featured: true, active: true },
  { name: 'Vestido midi floral', description: 'Estampado floral delicado, manga corta.', price: 55, available: true, imageHue: 330, featured: true, active: true },
  { name: 'Chaqueta denim', description: 'Denim medio con botones metálicos.', price: 48, available: false, imageHue: 220, featured: false, active: true },
  { name: 'Bolso tote canvas', description: 'Tote de lona resistente.', price: 22, available: true, imageHue: 35, featured: true, active: true },
  { name: 'Aretes dorados minimal', description: 'Acero inoxidable bañado en oro.', price: 15.5, available: true, imageHue: 45, featured: false, active: true },
  { name: 'Cinturón cuero natural', description: 'Cuero genuino con hebilla plateada.', price: 19, available: true, imageHue: 28, featured: false, active: true },
  { name: 'Set velas aromáticas', description: 'Pack de 3 velas: vainilla, lavanda y cítrico.', price: 24, available: true, imageHue: 280, featured: true, active: true },
  { name: 'Taza cerámica artesanal', description: 'Cerámica hecha a mano, 350 ml.', price: 16, available: true, imageHue: 160, featured: false, active: true },
  { name: 'Manta tejida algodón', description: 'Manta suave 130×170 cm.', price: 38, available: false, imageHue: 200, featured: false, active: true },
  { name: 'Serum vitamina C', description: 'Ilumina y unifica el tono.', price: 32, available: true, imageHue: 50, featured: true, active: true },
  { name: 'Kit skincare básico', description: 'Limpiador, tónico e hidratante.', price: 45, available: true, imageHue: 300, featured: false, active: true },
];

export function hashPassword(password: string): string {
  return `demo_${password}`;
}

function buildSeedOrders(products: Product[]): Order[] {
  const orders: Order[] = [];
  let seq = 1001;

  for (let i = 0; i < 8; i++) {
    const product = products[i % products.length];
    const items: OrderItem[] = [{
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
    }];
    orders.push({
      id: generateId(),
      orderNumber: `TB-${seq}`,
      customerName: ['María López', 'Carlos Pérez', 'Ana Torres', 'Luis Vega'][i % 4],
      customerPhone: '+593 98 765 4321',
      address: 'La Floresta, Quito',
      items,
      total: product.price,
      status: i < 3 ? 'nuevo' : 'atendido',
      createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    });
    seq += 1;
  }

  return orders;
}

export function seedIfNeeded(): void {
  if (load(KEYS.seeded, false)) return;

  const categories: Category[] = CATEGORIES.map((c) => ({ ...c, id: generateId() }));
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const slugMap: Record<number, string> = {
    0: 'ropa', 1: 'ropa', 2: 'ropa', 3: 'ropa',
    4: 'accesorios', 5: 'accesorios', 6: 'accesorios',
    7: 'hogar', 8: 'hogar', 9: 'hogar',
    10: 'belleza', 11: 'belleza',
  };

  const products: Product[] = PRODUCTS.map((p, i) => ({
    ...p,
    id: generateId(),
    categoryId: catBySlug[slugMap[i]],
    createdAt: new Date().toISOString(),
  }));

  const admin: AdminUser = {
    id: generateId(),
    email: 'admin@tianova.demo',
    password: hashPassword('admin123'),
    name: 'Administrador',
  };

  save(KEYS.categories, categories);
  save(KEYS.products, products);
  save(KEYS.orders, buildSeedOrders(products));
  save(KEYS.store, STORE_INFO);
  save(KEYS.admin, admin);
  save(KEYS.seeded, true);
}

export function resetDemo(): void {
  clearStore();
  seedIfNeeded();
}
