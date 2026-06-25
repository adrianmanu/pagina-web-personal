// Cliente en modo demo: simula la Inventory API (Spring Boot + JWT) guardando
// todo en localStorage. El código real del backend está en projects/inventory-api
// (Java 17, Spring Boot, JPA) y puede ejecutarse localmente con mvn spring-boot:run.

const TOKEN_KEY = 'stockflow_token';
const USERS_KEY = 'stockflow_demo_users';
const PRODUCTS_KEY = 'stockflow_demo_products';
const INVOICES_KEY = 'stockflow_demo_invoices';
const CUSTOMERS_KEY = 'stockflow_demo_customers';
const CREDIT_NOTES_KEY = 'stockflow_demo_credit_notes';
const DEBIT_NOTES_KEY = 'stockflow_demo_debit_notes';
const COUNTER_KEY = 'stockflow_demo_counter';

const DEMO_STORAGE_KEYS = [
  USERS_KEY,
  PRODUCTS_KEY,
  INVOICES_KEY,
  CUSTOMERS_KEY,
  CREDIT_NOTES_KEY,
  DEBIT_NOTES_KEY,
  COUNTER_KEY,
  TOKEN_KEY,
  'stockflow_demo_waybills',
  'stockflow_demo_suppliers',
  'stockflow_demo_purchase_settlements',
  'stockflow_demo_retentions',
  'stockflow_demo_received_docs',
  'stockflow_demo_manual_sales',
  'stockflow_demo_proformas',
  'stockflow_demo_business_profile',
];

export const DEMO_EMAIL = 'demo@stockflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  membershipStatus?: string;
  membershipPlan?: string;
  canEmit?: boolean;
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
  id?: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  customerId?: number | null;
  finalConsumer: boolean;
  customerName: string;
  customerTaxId: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  createdAt: string;
  total: number;
  items: InvoiceItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilInvoiceId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface InvoiceInput {
  finalConsumer: boolean;
  customerId?: number;
  customerName?: string;
  customerTaxId?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: { productId: number; quantity: number }[];
}

export interface Customer {
  id: number;
  name: string;
  taxId: string;
  idType: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  invoiceCount: number;
  totalInvoiced: number;
}

export interface CustomerInput {
  name: string;
  taxId: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface CreditNoteItem {
  invoiceItemId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreditNote {
  id: number;
  invoiceId: number;
  invoiceDocumentNumber?: string | null;
  motivo: string;
  restockStock: boolean;
  createdAt: string;
  total: number;
  items: CreditNoteItem[];
  sriStatus?: string | null;
  sriDocumentNumber?: string | null;
  datilCreditNoteId?: string | null;
  sriErrorMessage?: string | null;
  sriRidePdfUrl?: string | null;
  canReissueSri?: boolean;
}

export interface CreditNoteInput {
  invoiceId: number;
  motivo: string;
  restockStock: boolean;
  fullCredit: boolean;
  items?: { invoiceItemId: number; quantity: number }[];
}

export interface DebitNoteItem {
  id?: number;
  motivo: string;
  amount: number;
  subtotal: number;
}

export interface DebitNote {
  id: number;
  invoiceId: number;
  invoiceDocumentNumber?: string | null;
  createdAt: string;
  total: number;
  items: DebitNoteItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilDebitNoteId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface DebitNoteInput {
  invoiceId: number;
  items: { motivo: string; amount: number }[];
}

export interface WaybillItem {
  id?: number;
  productId?: number | null;
  productName: string;
  sku?: string | null;
  quantity: number;
}

export interface Waybill {
  id: number;
  invoiceId?: number | null;
  invoiceDocumentNumber?: string | null;
  createdAt: string;
  direccionPartida: string;
  motivoTraslado: string;
  ruta?: string | null;
  carrierName: string;
  carrierTaxId: string;
  carrierPlate: string;
  recipientName: string;
  recipientTaxId: string;
  recipientAddress: string;
  items: WaybillItem[];
  sriStatus?: string | null;
  datilWaybillId?: string | null;
  sriErrorMessage?: string | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  canReissueSri?: boolean;
}

export interface WaybillInput {
  invoiceId?: number | null;
  direccionPartida: string;
  motivoTraslado: string;
  ruta?: string;
  carrierName: string;
  carrierTaxId: string;
  carrierPlate: string;
  carrierEmail?: string;
  carrierAddress?: string;
  carrierPhone?: string;
  recipientName: string;
  recipientTaxId: string;
  recipientEmail?: string;
  recipientAddress: string;
  recipientPhone?: string;
  items: { productId?: number; description?: string; sku?: string; quantity: number }[];
}

export interface Supplier {
  id: number;
  name: string;
  taxId: string;
  idType: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  settlementCount: number;
  totalSettled: number;
}

export interface SupplierInput {
  name: string;
  taxId: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface PurchaseSettlementItem {
  id?: number;
  productId?: number | null;
  description: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseSettlement {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierTaxId: string;
  createdAt: string;
  total: number;
  items: PurchaseSettlementItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilPurchaseSettlementId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface PurchaseSettlementInput {
  supplierId: number;
  items: { productId?: number; description?: string; sku?: string; quantity: number; unitPrice: number }[];
}

export interface RetentionTaxCode {
  id: string;
  taxType: string;
  retentionCode: string;
  percentage: number;
  label: string;
}

export interface RetentionItem {
  id?: number;
  taxType: string;
  retentionCode: string;
  retentionLabel: string;
  percentage: number;
  taxableBase: number;
  retainedAmount: number;
}

export interface Retention {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierTaxId: string;
  createdAt: string;
  supportDocumentNumber: string;
  supportDocumentType: string;
  supportDocumentDate: string;
  periodoFiscal: string;
  totalRetained: number;
  items: RetentionItem[];
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilRetentionId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
  sriDocumentNumber?: string | null;
  sriRidePdfUrl?: string | null;
  sriXmlUrl?: string | null;
  canReissueSri?: boolean;
}

export interface RetentionInput {
  supplierId: number;
  supportDocumentNumber: string;
  supportDocumentType?: string;
  supportDocumentDate: string;
  items: { retentionCodeId: string; taxableBase: number }[];
}

export interface SalesSummary {
  totalInvoices: number;
  itemsSold: number;
  totalRevenue: number;
}

export interface SriConfig {
  enabled: boolean;
  configured: boolean;
  provider?: string;
  ambiente: number;
  ruc: string;
  razonSocial: string;
  establecimientoCodigo: string;
  puntoEmision: string;
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
      sriStatus: 'AUTORIZADO',
      sriDocumentNumber: '001-002-000000901',
      sriAccessKey: '0112202401179001234500110010020000009011234567812',
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
      sriStatus: 'AUTORIZADO',
      sriDocumentNumber: '001-002-000000902',
      sriAccessKey: '0112202401179001234500110010020000009021234567813',
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
      sriStatus: 'AUTORIZADO',
      sriDocumentNumber: '001-002-000000903',
      sriAccessKey: '0112202401179001234500110010020000009031234567814',
      items: [
        { productId: 5, productName: 'Silla ergonómica', sku: 'OFI-001', quantity: 2, unitPrice: 320, subtotal: 640 },
        { productId: 6, productName: 'Escritorio ajustable', sku: 'OFI-002', quantity: 1, unitPrice: 540, subtotal: 540 },
      ],
    },
  ];
}

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 201,
    name: 'Comercial Andina S.A.',
    taxId: '1790012345001',
    idType: 'RUC',
    email: 'compras@comercialandina.com',
    address: 'Av. Amazonas N34-120, Quito',
    phone: '022345678',
    invoiceCount: 1,
    totalInvoiced: 3280,
  },
  {
    id: 202,
    name: 'Estudio Creativo Lúmina',
    taxId: '0992233445001',
    idType: 'RUC',
    email: 'admin@lumina.ec',
    address: 'Calle Larga 8-44, Cuenca',
    phone: '072112233',
    invoiceCount: 1,
    totalInvoiced: 1500,
  },
];

function seedSuppliers(): import('./client-live').Supplier[] {
  return [
    {
      id: 301,
      name: 'Distribuidora Norte',
      taxId: '1795566778001',
      idType: 'RUC',
      email: 'ventas@norte-demo.com',
      address: 'Av. 6 de Diciembre, Quito',
      phone: '022998877',
      settlementCount: 0,
      totalSettled: 0,
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
  if (!localStorage.getItem(CUSTOMERS_KEY)) {
    save(CUSTOMERS_KEY, SEED_CUSTOMERS);
  }
  if (!localStorage.getItem('stockflow_demo_suppliers')) {
    save('stockflow_demo_suppliers', seedSuppliers());
  }
}

// ─── Helpers ───

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: StoredUser): User {
  const base: User = { id: user.id, email: user.email, fullName: user.fullName };
  if (user.email === DEMO_EMAIL) {
    return {
      ...base,
      role: 'ADMIN',
      onboardingCompleted: true,
      onboardingStep: 5,
      membershipStatus: 'TRIAL',
      membershipPlan: 'TRIAL',
      canEmit: true,
    };
  }
  return {
    ...base,
    role: 'ADMIN',
    onboardingCompleted: true,
    onboardingStep: 5,
    canEmit: true,
  };
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

function customerStats(customerId: number) {
  const invoices = load<Invoice>(INVOICES_KEY).filter((inv) => inv.customerId === customerId);
  return {
    invoiceCount: invoices.length,
    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.total, 0),
  };
}

function toCustomerResponse(customer: Customer): Customer {
  const stats = customerStats(customer.id);
  const digits = customer.taxId.replace(/\D/g, '');
  return {
    ...customer,
    idType: digits.length === 13 ? 'RUC' : 'Cédula',
    invoiceCount: stats.invoiceCount,
    totalInvoiced: stats.totalInvoiced,
  };
}

function normalizeTaxIdDemo(taxId: string) {
  const digits = taxId.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 13) {
    throw new Error('La identificación debe ser cédula (10 dígitos) o RUC (13 dígitos)');
  }
  return digits;
}

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
    if (!data.finalConsumer && !data.customerName?.trim() && !data.customerId) {
      throw new Error('Los datos del cliente son obligatorios para factura con datos');
    }

    let customerName = data.customerName?.trim() ?? '';
    let customerTaxId = data.customerTaxId?.trim() ?? '';
    let customerEmail = data.customerEmail?.trim() ?? '';
    let customerAddress = data.customerAddress?.trim() ?? '';

    if (!data.finalConsumer && data.customerId) {
      const stored = load<Customer>(CUSTOMERS_KEY).find((item) => item.id === data.customerId);
      if (!stored) throw new Error('Cliente no encontrado');
      customerName = stored.name;
      customerTaxId = stored.taxId;
      customerEmail = stored.email ?? '';
      customerAddress = stored.address ?? '';
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
      customerId: data.finalConsumer ? null : data.customerId ?? null,
      finalConsumer: data.finalConsumer,
      customerName: data.finalConsumer ? 'Consumidor Final' : customerName,
      customerTaxId: data.finalConsumer ? null : customerTaxId || null,
      customerEmail: data.finalConsumer ? null : customerEmail || null,
      customerAddress: data.finalConsumer ? null : customerAddress || null,
      createdAt: new Date().toISOString(),
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      items,
    };
    save(INVOICES_KEY, [...load<Invoice>(INVOICES_KEY), invoice]);
    return invoice;
  },

  async getSriConfig(): Promise<SriConfig> {
    await delay();
    return {
      enabled: true,
      configured: true,
      provider: 'factuplan',
      ambiente: 1,
      ruc: '1791234567001',
      razonSocial: 'Demo StockFlow S.A.',
      establecimientoCodigo: '001',
      puntoEmision: '002',
    };
  },

  async getSriConnectionConfig(): Promise<SriConfig> {
    return this.getSriConfig();
  },

  async getSriCertificateStatus() {
    await delay();
    return {
      valid: true,
      hasCertificate: true,
      ruc: '1791234567001',
      legalName: 'Demo StockFlow S.A.',
      expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
      daysUntilExpiry: 180,
    };
  },

  async uploadSriCertificate(_file: File, _password: string) {
    await delay();
    return {
      hasCertificate: true,
      ruc: '1791234567001',
      legalName: 'Demo StockFlow S.A.',
      expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
      created: true,
      message: 'Modo demo: certificado simulado (no se envía al SRI).',
    };
  },

  async verifySriConnection() {
    await delay();
    return {
      ok: true,
      provider: 'factuplan',
      ambiente: 1,
      ruc: '1791234567001',
      apiConfigured: true,
      hasCertificate: true,
      certificateValid: true,
      message: 'Modo demo: conexión simulada. En producción usa Factuplan con clave ak_test_.',
    };
  },

  async refreshInvoiceSri(id: number): Promise<Invoice> {
    await delay();
    const invoice = load<Invoice>(INVOICES_KEY).find((item) => item.id === id);
    if (!invoice) throw new Error('Factura no encontrada');
    return invoice;
  },

  async reissueInvoiceSri(id: number): Promise<Invoice> {
    await delay();
    const invoice = load<Invoice>(INVOICES_KEY).find((item) => item.id === id);
    if (!invoice) throw new Error('Factura no encontrada');
    return invoice;
  },

  async getCustomers(): Promise<Customer[]> {
    await delay();
    requireSession();
    return load<Customer>(CUSTOMERS_KEY)
      .map(toCustomerResponse)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    await delay();
    requireSession();
    const q = query.trim().toLowerCase();
    if (!q) return api.getCustomers();
    return load<Customer>(CUSTOMERS_KEY)
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(q) || customer.taxId.includes(q.replace(/\D/g, '')),
      )
      .map(toCustomerResponse);
  },

  async getCustomer(id: number): Promise<Customer> {
    await delay();
    const customer = load<Customer>(CUSTOMERS_KEY).find((item) => item.id === id);
    if (!customer) throw new Error('Cliente no encontrado');
    return toCustomerResponse(customer);
  },

  async getCustomerInvoices(id: number): Promise<Invoice[]> {
    await delay();
    return load<Invoice>(INVOICES_KEY)
      .filter((invoice) => invoice.customerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createCustomer(data: CustomerInput): Promise<Customer> {
    await delay();
    requireSession();
    const taxId = normalizeTaxIdDemo(data.taxId);
    const customers = load<Customer>(CUSTOMERS_KEY);
    if (customers.some((item) => item.taxId === taxId)) {
      throw new Error('Ya existe un cliente con esa identificación');
    }
    const customer: Customer = {
      id: nextId(),
      name: data.name.trim(),
      taxId,
      idType: taxId.length === 13 ? 'RUC' : 'Cédula',
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      phone: data.phone?.trim() || null,
      invoiceCount: 0,
      totalInvoiced: 0,
    };
    save(CUSTOMERS_KEY, [...customers, customer]);
    return toCustomerResponse(customer);
  },

  async updateCustomer(id: number, data: CustomerInput): Promise<Customer> {
    await delay();
    requireSession();
    const taxId = normalizeTaxIdDemo(data.taxId);
    const customers = load<Customer>(CUSTOMERS_KEY);
    const index = customers.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Cliente no encontrado');
    if (customers.some((item) => item.id !== id && item.taxId === taxId)) {
      throw new Error('Ya existe un cliente con esa identificación');
    }
    customers[index] = {
      ...customers[index],
      name: data.name.trim(),
      taxId,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      phone: data.phone?.trim() || null,
    };
    save(CUSTOMERS_KEY, customers);
    return toCustomerResponse(customers[index]);
  },

  async deleteCustomer(id: number): Promise<void> {
    await delay();
    requireSession();
    const hasInvoices = load<Invoice>(INVOICES_KEY).some((invoice) => invoice.customerId === id);
    if (hasInvoices) throw new Error('No se puede eliminar: el cliente tiene facturas asociadas');
    save(
      CUSTOMERS_KEY,
      load<Customer>(CUSTOMERS_KEY).filter((customer) => customer.id !== id),
    );
  },

  async getCreditNotes(): Promise<CreditNote[]> {
    await delay();
    return load<CreditNote>(CREDIT_NOTES_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async createCreditNote(data: CreditNoteInput): Promise<CreditNote> {
    await delay();
    requireSession();
    const note: CreditNote = {
      id: nextId(),
      invoiceId: data.invoiceId,
      motivo: data.motivo,
      restockStock: data.restockStock,
      createdAt: new Date().toISOString(),
      total: 0,
      items: [],
      sriStatus: 'DISABLED',
    };
    save(CREDIT_NOTES_KEY, [...load<CreditNote>(CREDIT_NOTES_KEY), note]);
    return note;
  },

  async refreshCreditNoteSri(id: number): Promise<CreditNote> {
    await delay();
    const note = load<CreditNote>(CREDIT_NOTES_KEY).find((item) => item.id === id);
    if (!note) throw new Error('Nota de crédito no encontrada');
    return note;
  },

  async getDebitNotes(): Promise<DebitNote[]> {
    await delay();
    return load<DebitNote>(DEBIT_NOTES_KEY).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async createDebitNote(data: DebitNoteInput): Promise<DebitNote> {
    await delay();
    requireSession();
    const total = data.items.reduce((sum, item) => sum + item.amount, 0);
    const note: DebitNote = {
      id: nextId(),
      invoiceId: data.invoiceId,
      createdAt: new Date().toISOString(),
      total,
      items: data.items.map((item) => ({ motivo: item.motivo, amount: item.amount, subtotal: item.amount })),
      sriStatus: 'DISABLED',
    };
    save(DEBIT_NOTES_KEY, [...load<DebitNote>(DEBIT_NOTES_KEY), note]);
    return note;
  },

  async refreshDebitNoteSri(id: number): Promise<DebitNote> {
    await delay();
    const note = load<DebitNote>(DEBIT_NOTES_KEY).find((item) => item.id === id);
    if (!note) throw new Error('Nota de débito no encontrada');
    return note;
  },

  async reissueDebitNoteSri(id: number): Promise<DebitNote> {
    return this.refreshDebitNoteSri(id);
  },

  async getWaybills(): Promise<Waybill[]> {
    await delay();
    return load<Waybill>('stockflow_demo_waybills').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async createWaybill(data: WaybillInput): Promise<Waybill> {
    await delay();
    requireSession();
    const note: Waybill = {
      id: nextId(),
      invoiceId: data.invoiceId ?? null,
      createdAt: new Date().toISOString(),
      direccionPartida: data.direccionPartida,
      motivoTraslado: data.motivoTraslado,
      ruta: data.ruta,
      carrierName: data.carrierName,
      carrierTaxId: data.carrierTaxId,
      carrierPlate: data.carrierPlate,
      recipientName: data.recipientName,
      recipientTaxId: data.recipientTaxId,
      recipientAddress: data.recipientAddress,
      items: data.items.map((item) => ({
        productId: item.productId,
        productName: item.description ?? 'Ítem',
        sku: item.sku,
        quantity: item.quantity,
      })),
      sriStatus: 'DISABLED',
    };
    const key = 'stockflow_demo_waybills';
    save(key, [...load<Waybill>(key), note]);
    return note;
  },

  async refreshWaybillSri(id: number): Promise<Waybill> {
    await delay();
    const note = load<Waybill>('stockflow_demo_waybills').find((item) => item.id === id);
    if (!note) throw new Error('Guía no encontrada');
    return note;
  },

  async reissueWaybillSri(id: number): Promise<Waybill> {
    return this.refreshWaybillSri(id);
  },

  async getSuppliers(): Promise<Supplier[]> {
    await delay();
    return load<Supplier>('stockflow_demo_suppliers').sort((a, b) => a.name.localeCompare(b.name));
  },

  async searchSuppliers(query: string): Promise<Supplier[]> {
    const all = await this.getSuppliers();
    const q = query.toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(q) || s.taxId.includes(q));
  },

  async getSupplier(id: number): Promise<Supplier> {
    const supplier = load<Supplier>('stockflow_demo_suppliers').find((item) => item.id === id);
    if (!supplier) throw new Error('Proveedor no encontrado');
    return supplier;
  },

  async createSupplier(data: SupplierInput): Promise<Supplier> {
    await delay();
    requireSession();
    const supplier: Supplier = {
      id: nextId(),
      name: data.name,
      taxId: data.taxId,
      idType: data.taxId.length === 13 ? 'RUC' : 'Cédula',
      email: data.email ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
      settlementCount: 0,
      totalSettled: 0,
    };
    const key = 'stockflow_demo_suppliers';
    save(key, [...load<Supplier>(key), supplier]);
    return supplier;
  },

  async updateSupplier(id: number, data: SupplierInput): Promise<Supplier> {
    await delay();
    requireSession();
    const key = 'stockflow_demo_suppliers';
    const list = load<Supplier>(key);
    const idx = list.findIndex((item) => item.id === id);
    if (idx < 0) throw new Error('Proveedor no encontrado');
    list[idx] = {
      ...list[idx],
      name: data.name,
      taxId: data.taxId,
      idType: data.taxId.length === 13 ? 'RUC' : 'Cédula',
      email: data.email ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
    };
    save(key, list);
    return list[idx];
  },

  async deleteSupplier(id: number): Promise<void> {
    await delay();
    requireSession();
    const key = 'stockflow_demo_suppliers';
    save(key, load<Supplier>(key).filter((item) => item.id !== id));
  },

  async getPurchaseSettlements(): Promise<PurchaseSettlement[]> {
    await delay();
    return load<PurchaseSettlement>('stockflow_demo_purchase_settlements').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async createPurchaseSettlement(data: PurchaseSettlementInput): Promise<PurchaseSettlement> {
    await delay();
    requireSession();
    const supplier = await this.getSupplier(data.supplierId);
    const items = data.items.map((item) => ({
      description: item.description ?? 'Ítem',
      productId: item.productId ?? null,
      sku: item.sku ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const settlement: PurchaseSettlement = {
      id: nextId(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierTaxId: supplier.taxId,
      createdAt: new Date().toISOString(),
      total,
      items,
      sriStatus: 'DISABLED',
    };
    const key = 'stockflow_demo_purchase_settlements';
    save(key, [...load<PurchaseSettlement>(key), settlement]);
    return settlement;
  },

  async refreshPurchaseSettlementSri(id: number): Promise<PurchaseSettlement> {
    await delay();
    const settlement = load<PurchaseSettlement>('stockflow_demo_purchase_settlements').find((item) => item.id === id);
    if (!settlement) throw new Error('Liquidación no encontrada');
    return settlement;
  },

  async reissuePurchaseSettlementSri(id: number): Promise<PurchaseSettlement> {
    return this.refreshPurchaseSettlementSri(id);
  },

  async getRetentionTaxCodes(): Promise<RetentionTaxCode[]> {
    await delay();
    return [
      { id: 'renta-1-servicios', taxType: '1', retentionCode: '312', percentage: 1, label: 'Renta 1% — servicios profesionales' },
      { id: 'iva-30', taxType: '2', retentionCode: '3', percentage: 30, label: 'IVA 30% — servicios' },
    ];
  },

  async getRetentions(): Promise<Retention[]> {
    await delay();
    return load<Retention>('stockflow_demo_retentions').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async createRetention(data: RetentionInput): Promise<Retention> {
    await delay();
    requireSession();
    const supplier = await this.getSupplier(data.supplierId);
    const taxCodes = await this.getRetentionTaxCodes();
    const items = data.items.map((line) => {
      const code = taxCodes.find((item) => item.id === line.retentionCodeId);
      const retained = code ? Math.round(line.taxableBase * code.percentage) / 100 : 0;
      return {
        taxType: code?.taxType ?? '1',
        retentionCode: code?.retentionCode ?? '312',
        retentionLabel: code?.label ?? 'Retención',
        percentage: code?.percentage ?? 1,
        taxableBase: line.taxableBase,
        retainedAmount: retained,
      };
    });
    const totalRetained = items.reduce((sum, item) => sum + item.retainedAmount, 0);
    const retention: Retention = {
      id: nextId(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierTaxId: supplier.taxId,
      createdAt: new Date().toISOString(),
      supportDocumentNumber: data.supportDocumentNumber,
      supportDocumentType: data.supportDocumentType ?? '01',
      supportDocumentDate: data.supportDocumentDate,
      periodoFiscal: new Date().toLocaleDateString('es-EC', { month: '2-digit', year: 'numeric' }).replace('/', '/'),
      totalRetained,
      items,
      sriStatus: 'DISABLED',
    };
    const key = 'stockflow_demo_retentions';
    save(key, [...load<Retention>(key), retention]);
    return retention;
  },

  async refreshRetentionSri(id: number): Promise<Retention> {
    await delay();
    const retention = load<Retention>('stockflow_demo_retentions').find((item) => item.id === id);
    if (!retention) throw new Error('Retención no encontrada');
    return retention;
  },

  async reissueRetentionSri(id: number): Promise<Retention> {
    return this.refreshRetentionSri(id);
  },

  async getSustentoCodes() {
    await delay();
    return [
      { code: '01', label: 'Crédito tributario', category: 'CREDITO_TRIBUTARIO' },
      { code: '02', label: 'Costo o gasto', category: 'COSTO_GASTO' },
    ];
  },

  async getReceivedDocuments() {
    await delay();
    return load<import('./client-live').ReceivedDocument>('stockflow_demo_received_docs');
  },

  async createReceivedDocument(data: import('./client-live').ReceivedDocumentInput) {
    await delay();
    const key = 'stockflow_demo_received_docs';
    const doc: import('./client-live').ReceivedDocument = {
      id: nextId(),
      source: 'MANUAL',
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      issueDate: data.issueDate,
      issuerName: data.issuerName,
      issuerTaxId: data.issuerTaxId,
      subtotal: data.subtotal ?? null,
      iva: data.iva ?? null,
      total: data.total ?? null,
      sustentoCode: data.sustentoCode,
      sustentoLabel: data.sustentoCode,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
      hasXml: false,
    };
    save(key, [...load<import('./client-live').ReceivedDocument>(key), doc]);
    return doc;
  },

  async uploadReceivedDocumentXml(data: import('./client-live').ReceivedDocumentUploadInput) {
    return this.createReceivedDocument({
      documentType: '01',
      documentNumber: 'DEMO-XML-001',
      issueDate: new Date().toISOString().slice(0, 10),
      issuerName: 'Proveedor demo',
      issuerTaxId: '0910000000001',
      sustentoCode: data.sustentoCode ?? '01',
      notes: data.notes,
    });
  },

  async deleteReceivedDocument(id: number) {
    await delay();
    const key = 'stockflow_demo_received_docs';
    save(key, load<import('./client-live').ReceivedDocument>(key).filter((item) => item.id !== id));
  },

  async getAtsPreview(year: number, month: number) {
    await delay();
    return {
      year,
      month,
      periodLabel: `${String(month).padStart(2, '0')}/${year}`,
      informantRuc: '0000000000000',
      informantName: 'Demo',
      establishmentCode: '001',
      totalVentas: 0,
      purchases: { subtotal: 0, iva: 0, total: 0, documentCount: 0 },
      salesManual: { subtotal: 0, iva: 0, total: 0, documentCount: 0 },
      salesElectronic: { subtotal: 0, iva: 0, total: 0, documentCount: 0 },
      creditNotes: { subtotal: 0, iva: 0, total: 0, documentCount: 0 },
      retentionsIssued: { subtotal: 0, iva: 0, total: 0, documentCount: 0 },
      purchaseLines: [],
      saleManualLines: [],
      saleElectronicLines: [],
      creditNoteLines: [],
      retentionLines: [],
      validations: [{ level: 'INFO', message: 'Modo demo: sin datos ATS reales.' }],
      readyToExport: true,
      exportFileName: `AT${String(month).padStart(2, '0')}${year}.zip`,
    } satisfies import('./client-live').AtsPreview;
  },

  async exportAts(_year: number, _month: number) {
    await delay();
  },

  async getManualSales() {
    await delay();
    return load<import('./client-live').ManualSaleDocument>('stockflow_demo_manual_sales');
  },

  async createManualSale(data: import('./client-live').ManualSaleInput) {
    await delay();
    const key = 'stockflow_demo_manual_sales';
    const doc: import('./client-live').ManualSaleDocument = {
      id: nextId(),
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      issueDate: data.issueDate,
      customerName: data.customerName,
      customerTaxId: data.customerTaxId,
      customerIdType: '04',
      total: data.total,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    save(key, [...load<import('./client-live').ManualSaleDocument>(key), doc]);
    return doc;
  },

  async deleteManualSale(id: number) {
    await delay();
    const key = 'stockflow_demo_manual_sales';
    save(key, load<import('./client-live').ManualSaleDocument>(key).filter((item) => item.id !== id));
  },

  async getBusinessProfile() {
    await delay();
    return {
      id: 1,
      businessName: 'Demo StockFlow',
      ruc: '0000000000000',
      razonSocial: 'Demo StockFlow',
      onboardingCompleted: true,
      onboardingStep: 5,
    } satisfies import('./client-live').BusinessProfile;
  },

  async saveBusinessProfile(data: import('./client-live').BusinessProfileInput) {
    await delay();
    return {
      id: 1,
      businessName: data.businessName,
      ruc: data.ruc,
      razonSocial: data.razonSocial,
      direccion: data.direccion ?? null,
      emailNotificaciones: data.emailNotificaciones ?? null,
      onboardingCompleted: false,
      onboardingStep: 1,
    } satisfies import('./client-live').BusinessProfile;
  },

  async completeOnboarding() {
    return this.getBusinessProfile();
  },

  async advanceOnboardingStep(step: number) {
    await delay();
    const profile = await this.getBusinessProfile();
    return { ...profile, onboardingStep: step };
  },

  async getEmissionPoints() {
    await delay();
    return [
      {
        id: 1,
        establishmentCode: '001',
        emissionPointCode: '002',
        label: 'Principal',
        defaultPoint: true,
      },
    ] satisfies import('./client-live').EmissionPoint[];
  },

  async createEmissionPoint(data: import('./client-live').EmissionPointInput) {
    await delay();
    return {
      id: nextId(),
      establishmentCode: data.establishmentCode,
      emissionPointCode: data.emissionPointCode,
      label: data.label,
      address: data.address ?? null,
      defaultPoint: !!data.defaultPoint,
    } satisfies import('./client-live').EmissionPoint;
  },

  async deleteEmissionPoint(_id: number) {
    await delay();
  },

  async getProformas() {
    await delay();
    return load<import('./client-live').Proforma>('stockflow_demo_proformas');
  },

  async createProforma(data: import('./client-live').ProformaInput) {
    await delay();
    const products = await this.getProducts();
    const items = data.items.map((line) => {
      const product = products.find((p) => p.id === line.productId)!;
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPrice: product.price,
        subtotal: product.price * line.quantity,
      };
    });
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const proforma: import('./client-live').Proforma = {
      id: nextId(),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      finalConsumer: data.finalConsumer,
      customerName: data.finalConsumer ? 'Consumidor final' : (data.customerName ?? 'Cliente'),
      total,
      items,
    };
    const key = 'stockflow_demo_proformas';
    save(key, [...load<import('./client-live').Proforma>(key), proforma]);
    return proforma;
  },

  async convertProforma(id: number) {
    await delay();
    const key = 'stockflow_demo_proformas';
    const proforma = load<import('./client-live').Proforma>(key).find((item) => item.id === id);
    if (!proforma) throw new Error('Proforma no encontrada');
    const invoice = await this.createInvoice({
      finalConsumer: proforma.finalConsumer,
      items: proforma.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
    const converted: import('./client-live').Proforma = {
      ...proforma,
      status: 'CONVERTED',
      convertedInvoiceId: invoice.id,
    };
    save(
      key,
      load<import('./client-live').Proforma>(key).map((item) => (item.id === id ? converted : item)),
    );
    return converted;
  },

  async deleteProforma(id: number) {
    await delay();
    const key = 'stockflow_demo_proformas';
    save(key, load<import('./client-live').Proforma>(key).filter((item) => item.id !== id));
  },

  async getMembershipStatus() {
    await delay();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 10);
    return {
      plan: 'TRIAL',
      status: 'TRIAL',
      provider: 'demo',
      message: 'Prueba gratis de 14 días (modo demo). En el servidor real puedes pagar con PayPhone.',
      trialEndsAt: trialEnd.toISOString(),
      currentPeriodEnd: null,
      canEmit: true,
      enforcementEnabled: false,
    } satisfies import('./client-live').MembershipStatus;
  },

  async getMembershipPlans() {
    await delay();
    const starterOptions = [
      { periodMonths: 1, periodDays: 30, label: '1 mes', priceUsd: 19, pricePerMonthUsd: 19, savingsPercent: 0 },
      { periodMonths: 3, periodDays: 90, label: '3 meses', priceUsd: 54.15, pricePerMonthUsd: 18.05, savingsPercent: 5 },
      { periodMonths: 6, periodDays: 180, label: '6 meses', priceUsd: 102.6, pricePerMonthUsd: 17.1, savingsPercent: 10 },
      { periodMonths: 12, periodDays: 365, label: '1 año', priceUsd: 193.8, pricePerMonthUsd: 16.15, savingsPercent: 15 },
    ];
    const proOptions = [
      { periodMonths: 1, periodDays: 30, label: '1 mes', priceUsd: 39, pricePerMonthUsd: 39, savingsPercent: 0 },
      { periodMonths: 3, periodDays: 90, label: '3 meses', priceUsd: 111.15, pricePerMonthUsd: 37.05, savingsPercent: 5 },
      { periodMonths: 6, periodDays: 180, label: '6 meses', priceUsd: 210.6, pricePerMonthUsd: 35.1, savingsPercent: 10 },
      { periodMonths: 12, periodDays: 365, label: '1 año', priceUsd: 397.8, pricePerMonthUsd: 33.15, savingsPercent: 15 },
    ];
    return [
      {
        id: 'STARTER',
        name: 'Starter',
        description: 'Ideal para negocios que empiezan a facturar electrónicamente con el SRI.',
        monthlyPriceUsd: 19,
        benefits: [
          'Control de inventario y productos',
          'Facturas electrónicas SRI',
          'Notas de crédito y débito',
          'Guías de remisión y retenciones',
          'Motor SRI Factuplan incluido',
          '1 usuario',
        ],
        recommended: true,
        billingOptions: starterOptions,
      },
      {
        id: 'PRO',
        name: 'Pro',
        description: 'Para contadores y negocios con más comprobantes y reportes.',
        monthlyPriceUsd: 39,
        benefits: [
          'Todo lo incluido en Starter',
          'Exportación ATS',
          'Liquidaciones de compra',
          'Múltiples usuarios',
          'Soporte prioritario',
        ],
        recommended: false,
        billingOptions: proOptions,
      },
    ] satisfies import('./client-live').MembershipPlan[];
  },

  async startMembershipCheckout(_plan: 'STARTER' | 'PRO', _periodMonths = 1) {
    await delay();
    return {
      checkoutUrl: null,
      message: 'Modo demo: los pagos PayPhone solo funcionan con el backend en un servidor. Usa SETUP-PRODUCCION.md.',
    };
  },

  async confirmPayPhonePayment(_id: number, _clientTxId: string) {
    await delay();
    return {
      approved: false,
      message: 'Modo demo: no hay pago PayPhone que confirmar.',
    };
  },

  async getMembershipBillingProvider() {
    await delay();
    return { provider: 'demo' };
  },
};
