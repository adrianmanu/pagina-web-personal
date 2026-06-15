import type { Category, Order, OrderItem, Product, StoreInfo, User } from '../models/types';
import { KEYS, generateId, load, save } from './storage';

const STORE_INFO: StoreInfo = {
  name: 'TiendaNova',
  tagline: 'Emprendimiento local con estilo',
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
  { name: 'Blusa linen terracota', description: 'Blusa ligera de lino, corte relajado. Ideal para clima cálido.', price: 28.5, stock: 18, imageHue: 18, featured: true, active: true },
  { name: 'Pantalón wide leg', description: 'Pantalón de tiro alto, tela suave y caída amplia.', price: 42, stock: 12, imageHue: 210, featured: true, active: true },
  { name: 'Vestido midi floral', description: 'Estampado floral delicado, manga corta y cintura marcada.', price: 55, stock: 8, imageHue: 330, featured: true, active: true },
  { name: 'Chaqueta denim', description: 'Denim medio, botones metálicos y bolsillos frontales.', price: 48, stock: 10, imageHue: 220, featured: false, active: true },
  { name: 'Bolso tote canvas', description: 'Tote de lona resistente con asas reforzadas.', price: 22, stock: 25, imageHue: 35, featured: true, active: true },
  { name: 'Aretes dorados minimal', description: 'Aretes de acero inoxidable bañado en oro 18k.', price: 15.5, stock: 30, imageHue: 45, featured: false, active: true },
  { name: 'Cinturón cuero natural', description: 'Cuero genuino con hebilla plateada.', price: 19, stock: 14, imageHue: 28, featured: false, active: true },
  { name: 'Set velas aromáticas', description: 'Pack de 3 velas: vainilla, lavanda y cítrico.', price: 24, stock: 20, imageHue: 280, featured: true, active: true },
  { name: 'Taza cerámica artesanal', description: 'Cerámica hecha a mano, 350 ml, apta microondas.', price: 16, stock: 22, imageHue: 160, featured: false, active: true },
  { name: 'Manta tejida algodón', description: 'Manta suave para sofá o cama, 130×170 cm.', price: 38, stock: 6, imageHue: 200, featured: false, active: true },
  { name: 'Serum vitamina C', description: 'Ilumina y unifica el tono. Uso diario AM.', price: 32, stock: 15, imageHue: 50, featured: true, active: true },
  { name: 'Kit skincare básico', description: 'Limpiador, tónico e hidratante para rutina completa.', price: 45, stock: 9, imageHue: 300, featured: false, active: true },
];

function hashPassword(password: string): string {
  return `demo_${password}`;
}

const STATUSES: Order['status'][] = ['entregado', 'entregado', 'confirmado', 'enviado', 'pendiente'];

function buildSeedOrders(products: Product[], customerId: string): Order[] {
  const orders: Order[] = [];
  let seq = 1001;
  const now = Date.now();

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const count = 2 + (5 - monthsAgo);
    for (let i = 0; i < count; i++) {
      const product = products[(seq + i) % products.length];
      const qty = 1 + (seq % 3);
      const items: OrderItem[] = [{
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.price,
      }];
      const created = new Date(now);
      created.setMonth(created.getMonth() - monthsAgo);
      created.setDate(1 + ((seq + i) % 26));
      created.setHours(10 + (i % 8), 0, 0, 0);

      orders.push({
        id: generateId(),
        orderNumber: `TN-${seq}`,
        userId: customerId,
        customerName: 'María Demo',
        customerEmail: 'cliente@demo.com',
        customerPhone: '+593 98 765 4321',
        address: 'La Floresta, Quito',
        items,
        total: items.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
        status: STATUSES[seq % STATUSES.length],
        createdAt: created.toISOString(),
      });
      seq += 1;
    }
  }

  for (let day = 6; day >= 0; day--) {
    if (day % 2 === 0) continue;
    const product = products[day % products.length];
    const items: OrderItem[] = [{
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
    }];
    orders.push({
      id: generateId(),
      orderNumber: `TN-${seq}`,
      userId: customerId,
      customerName: 'María Demo',
      customerEmail: 'cliente@demo.com',
      customerPhone: '+593 98 765 4321',
      address: 'La Floresta, Quito',
      items,
      total: product.price,
      status: day <= 1 ? 'pendiente' : 'entregado',
      createdAt: new Date(now - day * 86400000).toISOString(),
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

  const adminId = generateId();
  const customerId = generateId();

  const users: User[] = [
    {
      id: adminId,
      name: 'Admin TiendaNova',
      email: 'admin@tianova.demo',
      password: hashPassword('admin123'),
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: customerId,
      name: 'María Demo',
      email: 'cliente@demo.com',
      password: hashPassword('demo123'),
      phone: '+593 98 765 4321',
      role: 'customer',
      createdAt: new Date().toISOString(),
    },
  ];

  const orders = buildSeedOrders(products, customerId);

  save(KEYS.categories, categories);
  save(KEYS.products, products);
  save(KEYS.users, users);
  save(KEYS.orders, orders);
  save(KEYS.store, STORE_INFO);
  save(KEYS.seeded, true);
}

export function resetDemo(): void {
  ['seeded', 'session', 'cart', 'users', 'products', 'categories', 'orders', 'store'].forEach((k) => {
    localStorage.removeItem(`tianova_${k}`);
  });
  seedIfNeeded();
}

export { hashPassword, STORE_INFO };
