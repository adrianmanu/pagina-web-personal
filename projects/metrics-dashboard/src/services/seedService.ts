import type { Customer } from '../models/Customer';
import type { Order, OrderItem, OrderStatus } from '../models/Order';
import { calcOrderTotal } from '../models/Order';
import { COLLECTIONS, clearAllCollections, generateId, loadCollection, saveCollection } from './storage';

const SEED_CUSTOMERS: Omit<Customer, 'id' | 'createdAt'>[] = [
  { name: 'María Fernanda López', email: 'mlopez@andinatech.com', company: 'Andina Tech', phone: '+593 99 210 4456', city: 'Quito', status: 'activo' },
  { name: 'Carlos Andrade', email: 'candrade@pacificorp.ec', company: 'Pacific Corp', phone: '+593 98 771 2034', city: 'Guayaquil', status: 'activo' },
  { name: 'Lucía Mendoza', email: 'lucia@nexsolutions.io', company: 'Nex Solutions', phone: '+593 96 332 8810', city: 'Cuenca', status: 'activo' },
  { name: 'Jorge Villacís', email: 'jvillacis@kameleon.dev', company: 'Kameleon Dev', phone: '+593 99 845 1290', city: 'Quito', status: 'activo' },
  { name: 'Ana Cristina Ríos', email: 'arios@vortexlabs.co', company: 'Vortex Labs', phone: '+57 310 442 7765', city: 'Bogotá', status: 'activo' },
  { name: 'Diego Salazar', email: 'dsalazar@altamar.com.pe', company: 'Altamar SAC', phone: '+51 987 220 415', city: 'Lima', status: 'activo' },
  { name: 'Paola Cevallos', email: 'pcevallos@brillamarket.ec', company: 'Brilla Market', phone: '+593 95 118 6642', city: 'Manta', status: 'activo' },
  { name: 'Ricardo Bustamante', email: 'rbustamante@zonafit.mx', company: 'ZonaFit MX', phone: '+52 55 8841 2203', city: 'CDMX', status: 'activo' },
  { name: 'Valentina Suárez', email: 'vsuarez@cloudpyme.com', company: 'CloudPyme', phone: '+56 9 6122 0489', city: 'Santiago', status: 'activo' },
  { name: 'Esteban Cárdenas', email: 'ecardenas@rutalogistica.ec', company: 'Ruta Logística', phone: '+593 99 027 5531', city: 'Ambato', status: 'inactivo' },
  { name: 'Gabriela Ponce', email: 'gponce@selvaverde.org', company: 'Selva Verde ONG', phone: '+593 98 660 9912', city: 'Tena', status: 'activo' },
  { name: 'Andrés Maldonado', email: 'amaldonado@ferrexpress.ec', company: 'FerreXpress', phone: '+593 96 559 7308', city: 'Loja', status: 'inactivo' },
];

const CATALOG: { description: string; price: number }[] = [
  { description: 'Licencia ERP anual', price: 1200 },
  { description: 'Suscripción CRM (mes)', price: 89 },
  { description: 'Consultoría técnica (hora)', price: 65 },
  { description: 'Implementación e-commerce', price: 2400 },
  { description: 'Soporte premium (mes)', price: 150 },
  { description: 'Migración de datos', price: 480 },
  { description: 'Capacitación de equipo', price: 350 },
  { description: 'Dashboard personalizado', price: 900 },
  { description: 'Integración API de pagos', price: 720 },
  { description: 'Auditoría de seguridad', price: 1500 },
];

/** RNG determinista para que los datos demo sean siempre coherentes. */
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pickStatus(rng: () => number, monthsAgo: number): OrderStatus {
  // Los pedidos antiguos casi siempre están cerrados; los recientes, en curso.
  const roll = rng();
  if (monthsAgo >= 3) {
    if (roll < 0.82) return 'entregado';
    if (roll < 0.92) return 'enviado';
    return 'cancelado';
  }
  if (roll < 0.3) return 'pendiente';
  if (roll < 0.55) return 'pagado';
  if (roll < 0.78) return 'enviado';
  if (roll < 0.93) return 'entregado';
  return 'cancelado';
}

function buildSeedData(): { customers: Customer[]; orders: Order[] } {
  const rng = createRng(20260609);
  const now = new Date();

  const customers: Customer[] = SEED_CUSTOMERS.map((customer, index) => {
    const created = new Date(now.getFullYear(), now.getMonth() - 11, 2 + index * 2);
    return { ...customer, id: generateId(), createdAt: created.toISOString() };
  });

  const orders: Order[] = [];
  let sequence = 1000;

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    // Tendencia creciente: más pedidos en meses recientes.
    const baseCount = 4 + Math.floor((11 - monthsAgo) / 3);
    const count = baseCount + Math.floor(rng() * 3);

    for (let i = 0; i < count; i++) {
      const customer = customers[Math.floor(rng() * customers.length)];
      const itemCount = 1 + Math.floor(rng() * 3);
      const items: OrderItem[] = Array.from({ length: itemCount }, () => {
        const product = CATALOG[Math.floor(rng() * CATALOG.length)];
        return {
          description: product.description,
          quantity: 1 + Math.floor(rng() * 4),
          unitPrice: product.price,
        };
      });

      // En el mes en curso no se generan pedidos con fecha futura.
      const dayRange = monthsAgo === 0 ? Math.max(1, now.getDate() - 1) : 26;
      const day = 1 + Math.floor(rng() * dayRange);
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 9 + Math.floor(rng() * 9));
      sequence += 1;

      orders.push({
        id: generateId(),
        number: `ORD-${sequence}`,
        customerId: customer.id,
        status: pickStatus(rng, monthsAgo),
        items,
        total: calcOrderTotal(items),
        createdAt: date.toISOString(),
      });
    }
  }

  return { customers, orders };
}

export const seedService = {
  /** Crea los datos demo solo la primera vez que se abre la aplicación. */
  ensureSeeded(): void {
    if (loadCollection(COLLECTIONS.customers) !== null) return;
    const { customers, orders } = buildSeedData();
    saveCollection(COLLECTIONS.customers, customers);
    saveCollection(COLLECTIONS.orders, orders);
  },

  resetDemoData(): void {
    clearAllCollections();
    const { customers, orders } = buildSeedData();
    saveCollection(COLLECTIONS.customers, customers);
    saveCollection(COLLECTIONS.orders, orders);
  },
};
