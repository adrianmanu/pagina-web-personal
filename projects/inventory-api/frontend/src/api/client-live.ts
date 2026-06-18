const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'stockflow_token';

export const DEMO_EMAIL = 'demo@stockflow.dev';
export const DEMO_PASSWORD = 'demo1234';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function resetDemoData(): void {
  clearToken();
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
  sriStatus?: string | null;
  sriAccessKey?: string | null;
  sriAuthorizationNumber?: string | null;
  datilInvoiceId?: string | null;
  sriErrorMessage?: string | null;
  sriSecuencial?: number | null;
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

export interface SriConfig {
  enabled: boolean;
  configured: boolean;
  ambiente: number;
  ruc: string;
  razonSocial: string;
  establecimientoCodigo: string;
  puntoEmision: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? data?.error ?? `Error ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

function mapInvoice(raw: Invoice): Invoice {
  return {
    ...raw,
    items: raw.items.map((item) => ({
      ...item,
      subtotal: item.subtotal ?? item.unitPrice * item.quantity,
    })),
  };
}

export const api = {
  async register(data: { email: string; password: string; fullName: string }) {
    return request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(email: string, password: string) {
    const result = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    return result;
  },

  async me() {
    return request<User>('/api/auth/me');
  },

  async getProducts() {
    return request<Product[]>('/api/products');
  },

  async getSummary() {
    return request<InventorySummary>('/api/products/summary');
  },

  async createProduct(data: ProductInput) {
    return request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateProduct(id: number, data: ProductInput) {
    return request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteProduct(id: number) {
    await request<void>(`/api/products/${id}`, { method: 'DELETE' });
  },

  async addStock(id: number, quantity: number) {
    return request<Product>(`/api/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  },

  async getInvoices() {
    const invoices = await request<Invoice[]>('/api/invoices');
    return invoices.map(mapInvoice);
  },

  async getSalesSummary() {
    return request<SalesSummary>('/api/invoices/summary');
  },

  async getSriConfig() {
    return request<SriConfig>('/api/invoices/sri/config');
  },

  async createInvoice(data: InvoiceInput) {
    const invoice = await request<Invoice>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapInvoice(invoice);
  },

  async refreshInvoiceSri(id: number) {
    const invoice = await request<Invoice>(`/api/invoices/${id}/sri/refresh`, { method: 'POST' });
    return mapInvoice(invoice);
  },
};
