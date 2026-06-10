// Cliente en modo demo: simula la Inventory API (Spring Boot + JWT) guardando
// todo en localStorage. El código real del backend está en projects/inventory-api
// (Java 17, Spring Boot, JPA) y puede ejecutarse localmente con mvn spring-boot:run.

const TOKEN_KEY = 'stockflow_token';
const USERS_KEY = 'stockflow_demo_users';
const PRODUCTS_KEY = 'stockflow_demo_products';
const INVOICES_KEY = 'stockflow_demo_invoices';
const COUNTER_KEY = 'stockflow_demo_counter';

export const DEMO_EMAIL = 'demo@stockflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  [USERS_KEY, PRODUCTS_KEY, INVOICES_KEY, COUNTER_KEY, TOKEN_KEY].forEach((key) =>
    localStorage.removeItem(key),
  );
}

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  byCategory: { category: string; products: number; stock: number; value: number }[];
}

export interface InvoiceItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  finalConsumer: boolean;
  customerName: string;
  customerTaxId: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  createdAt: string;
  total: number;
  items: InvoiceItem[];
}

export interface InvoiceInput {
  finalConsumer: boolean;
  customerName?: string;
  customerTaxId?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: { productId: number; quantity: number }[];
}

export interface SalesSummary {
  totalInvoices: number;
  itemsSold: number;
  totalRevenue: number;
}

interface StoredUser extends User {
  password: string;
}

// ─── Almacenamiento ───

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function nextId(): number {
  const current = Number(localStorage.getItem(COUNTER_KEY) ?? '1000') + 1;
  localStorage.setItem(COUNTER_KEY, String(current));
  return current;
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

// ─── Datos demo ───

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Pro 14"', sku: 'TEC-001', stock: 18, price: 1450, category: 'Tecnología' },
  { id: 2, name: 'Monitor 27" 4K', sku: 'TEC-002', stock: 32, price: 380, category: 'Tecnología' },
  { id: 3, name: 'Teclado mecánico RGB', sku: 'TEC-003', stock: 54, price: 95, category: 'Tecnología' },
  { id: 4, name: 'Mouse inalámbrico', sku: 'TEC-004', stock: 73, price: 42, category: 'Tecnología' },
  { id: 5, name: 'Silla ergonómica', sku: 'OFI-001', stock: 12, price: 320, category: 'Oficina' },
  { id: 6, name: 'Escritorio ajustable', sku: 'OFI-002', stock: 8, price: 540, category: 'Oficina' },
  { id: 7, name: 'Lámpara LED de escritorio', sku: 'OFI-003', stock: 41, price: 38, category: 'Oficina' },
  { id: 8, name: 'Auriculares con micrófono', sku: 'ACC-001', stock: 27, price: 78, category: 'Accesorios' },
  { id: 9, name: 'Hub USB-C 7 en 1', sku: 'ACC-002', stock: 36, price: 55, category: 'Accesorios' },
];

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function seedInvoices(): Invoice[] {
  return [
    {
      id: 901,
      finalConsumer: false,
      customerName: 'Comercial Andina S.A.',
      customerTaxId: '1790012345001',
      customerEmail: 'compras@comercialandina.com',
      customerAddress: 'Av. Amazonas N34-120, Quito',
      createdAt: daysAgo(6),
      total: 2 * 1450 + 4 * 95,
      items: [
        { productId: 1, productName: 'Laptop Pro 14"', sku: 'TEC-001', quantity: 2, unitPrice: 1450, subtotal: 2900 },
        { productId: 3, productName: 'Teclado mecánico RGB', sku: 'TEC-003', quantity: 4, unitPrice: 95, subtotal: 380 },
      ],
    },
    {
      id: 902,
      finalConsumer: true,
      customerName: 'Consumidor Final',
      customerTaxId: null,
      customerEmail: null,
      customerAddress: null,
      createdAt: daysAgo(3),
      total: 380 + 2 * 42,
      items: [
        { productId: 2, productName: 'Monitor 27" 4K', sku: 'TEC-002', quantity: 1, unitPrice: 380, subtotal: 380 },
        { productId: 4, productName: 'Mouse inalámbrico', sku: 'TEC-004', quantity: 2, unitPrice: 42, subtotal: 84 },
      ],
    },
    {
      id: 903,
      finalConsumer: false,
      customerName: 'Estudio Creativo Lúmina',
      customerTaxId: '0992233445001',
      customerEmail: 'admin@lumina.ec',
      customerAddress: 'Calle Larga 8-44, Cuenca',
      createdAt: daysAgo(1),
      total: 2 * 320 + 540,
      items: [
        { productId: 5, productName: 'Silla ergonómica', sku: 'OFI-001', quantity: 2, unitPrice: 320, subtotal: 640 },
        { productId: 6, productName: 'Escritorio ajustable', sku: 'OFI-002', quantity: 1, unitPrice: 540, subtotal: 540 },
      ],
    },
  ];
}

function ensureSeeded(): void {
  const users = load<StoredUser>(USERS_KEY);
  if (!users.some((user) => user.email === DEMO_EMAIL)) {
    users.push({ id: 1, email: DEMO_EMAIL, fullName: 'Usuario Demo', password: DEMO_PASSWORD });
    save(USERS_KEY, users);
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    save(PRODUCTS_KEY, SEED_PRODUCTS);
  }
  if (!localStorage.getItem(INVOICES_KEY)) {
    save(INVOICES_KEY, seedInvoices());
  }
}

// ─── Helpers ───

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: StoredUser): User {
  return { id: user.id, email: user.email, fullName: user.fullName };
}

function requireSession(): StoredUser {
  ensureSeeded();
  const token = getToken();
  const user = load<StoredUser>(USERS_KEY).find((u) => String(u.id) === token);
  if (!user) throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  return user;
}

function validateProduct(data: ProductInput): void {
  if (!data.name?.trim()) throw new Error('El nombre es obligatorio');
  if (!data.sku?.trim()) throw new Error('El SKU es obligatorio');
  if (data.stock < 0) throw new Error('El stock no puede ser negativo');
  if (data.price < 0) throw new Error('El precio no puede ser negativo');
}

// ─── API demo (misma interfaz que el backend Spring Boot) ───

export const api = {
  async register(data: { email: string; password: string; fullName: string }) {
    await delay();
    ensureSeeded();
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new Error('Correo electrónico inválido');
    if (data.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    if (data.fullName.trim().length < 2) throw new Error('El nombre es obligatorio');

    const users = load<StoredUser>(USERS_KEY);
    if (users.some((user) => user.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo');
    }
    const user: StoredUser = {
      id: nextId(),
      email,
      fullName: data.fullName.trim(),
      password: data.password,
    };
    save(USERS_KEY, [...users, user]);
    return publicUser(user);
  },

  async login(email: string, password: string) {
    await delay();
    ensureSeeded();
    const user = load<StoredUser>(USERS_KEY).find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );
    if (!user) throw new Error('Credenciales incorrectas');
    localStorage.setItem(TOKEN_KEY, String(user.id));
    return { accessToken: String(user.id), user: publicUser(user) };
  },

  async me() {
    await delay();
    return publicUser(requireSession());
  },

  async getProducts() {
    await delay();
    requireSession();
    return load<Product>(PRODUCTS_KEY).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getSummary(): Promise<InventorySummary> {
    await delay();
    requireSession();
    const products = load<Product>(PRODUCTS_KEY);
    const byCategoryMap = new Map<string, { products: number; stock: number; value: number }>();
    for (const product of products) {
      const entry = byCategoryMap.get(product.category) ?? { products: 0, stock: 0, value: 0 };
      entry.products += 1;
      entry.stock += product.stock;
      entry.value += product.stock * product.price;
      byCategoryMap.set(product.category, entry);
    }
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      inventoryValue: products.reduce((sum, p) => sum + p.stock * p.price, 0),
      byCategory: [...byCategoryMap.entries()].map(([category, data]) => ({ category, ...data })),
    };
  },

  async createProduct(data: ProductInput): Promise<Product> {
    await delay();
    requireSession();
    validateProduct(data);
    const products = load<Product>(PRODUCTS_KEY);
    if (products.some((p) => p.sku === data.sku.trim())) {
      throw new Error('Ya existe un producto con ese SKU');
    }
    const product: Product = {
      id: nextId(),
      name: data.name.trim(),
      sku: data.sku.trim(),
      stock: data.stock,
      price: data.price,
      category: data.category.trim() || 'General',
    };
    save(PRODUCTS_KEY, [...products, product]);
    return product;
  },

  async updateProduct(id: number, data: ProductInput): Promise<Product> {
    await delay();
    requireSession();
    validateProduct(data);
    const products = load<Product>(PRODUCTS_KEY);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    if (products.some((p) => p.sku === data.sku.trim() && p.id !== id)) {
      throw new Error('Ya existe un producto con ese SKU');
    }
    const updated: Product = {
      ...products[index],
      name: data.name.trim(),
      sku: data.sku.trim(),
      stock: data.stock,
      price: data.price,
      category: data.category.trim() || 'General',
    };
    products[index] = updated;
    save(PRODUCTS_KEY, products);
    return updated;
  },

  async deleteProduct(id: number): Promise<void> {
    await delay();
    requireSession();
    const products = load<Product>(PRODUCTS_KEY);
    const remaining = products.filter((p) => p.id !== id);
    if (remaining.length === products.length) throw new Error('Producto no encontrado');
    save(PRODUCTS_KEY, remaining);
  },

  async addStock(id: number, quantity: number): Promise<Product> {
    await delay();
    requireSession();
    if (quantity <= 0) throw new Error('La cantidad debe ser mayor a cero');
    const products = load<Product>(PRODUCTS_KEY);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    products[index] = { ...products[index], stock: products[index].stock + quantity };
    save(PRODUCTS_KEY, products);
    return products[index];
  },

  async getInvoices() {
    await delay();
    requireSession();
    return load<Invoice>(INVOICES_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getSalesSummary(): Promise<SalesSummary> {
    await delay();
    requireSession();
    const invoices = load<Invoice>(INVOICES_KEY);
    return {
      totalInvoices: invoices.length,
      itemsSold: invoices.reduce(
        (sum, invoice) => sum + invoice.items.reduce((s, item) => s + item.quantity, 0),
        0,
      ),
      totalRevenue: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
    };
  },

  async createInvoice(data: InvoiceInput): Promise<Invoice> {
    await delay();
    requireSession();
    if (!data.items.length) throw new Error('Agrega al menos un producto a la factura');
    if (!data.finalConsumer && !data.customerName?.trim()) {
      throw new Error('Los datos del cliente son obligatorios para factura con datos');
    }

    const products = load<Product>(PRODUCTS_KEY);
    const items: InvoiceItem[] = [];

    for (const line of data.items) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) throw new Error('Producto no encontrado');
      if (line.quantity <= 0) throw new Error('La cantidad debe ser mayor a cero');
      if (product.stock < line.quantity) {
        throw new Error(`Stock insuficiente de "${product.name}" (disponible: ${product.stock})`);
      }
      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPrice: product.price,
        subtotal: product.price * line.quantity,
      });
    }

    // Descontar stock una vez validadas todas las líneas
    for (const item of items) {
      const index = products.findIndex((p) => p.id === item.productId);
      products[index] = { ...products[index], stock: products[index].stock - item.quantity };
    }
    save(PRODUCTS_KEY, products);

    const invoice: Invoice = {
      id: nextId(),
      finalConsumer: data.finalConsumer,
      customerName: data.finalConsumer ? 'Consumidor Final' : data.customerName!.trim(),
      customerTaxId: data.finalConsumer ? null : data.customerTaxId?.trim() || null,
      customerEmail: data.finalConsumer ? null : data.customerEmail?.trim() || null,
      customerAddress: data.finalConsumer ? null : data.customerAddress?.trim() || null,
      createdAt: new Date().toISOString(),
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      items,
    };
    save(INVOICES_KEY, [...load<Invoice>(INVOICES_KEY), invoice]);
    return invoice;
  },
};
