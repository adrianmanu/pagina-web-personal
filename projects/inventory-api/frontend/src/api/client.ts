export const API_URL = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function apiPath(path: string): string {
  return `${API_URL}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(apiPath(path), { ...options, headers });
  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          API_URL
            ? `API no responde correctamente (${response.status}). Verifica que el backend esté activo.`
            : 'API no configurada. Define INVENTORY_API_URL en GitHub y vuelve a desplegar.',
        );
      }
      throw new Error(`Error de servidor (${response.status})`);
    }
    const error = await response.json().catch(() => ({ detail: 'Error de servidor' }));
    throw new Error(error.detail || 'Error de servidor');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  register: (data: { email: string; password: string; fullName: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>('/api/auth/me'),

  getProducts: () => request<Product[]>('/api/products'),
  getSummary: () => request<InventorySummary>('/api/products/summary'),
  createProduct: (data: ProductInput) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: ProductInput) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<void>(`/api/products/${id}`, { method: 'DELETE' }),
};

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
