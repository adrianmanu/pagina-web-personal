export const MAX_PRODUCTS = 30;

export type OrderStatus = 'nuevo' | 'atendido';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  imageHue: number;
  imageUrl?: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  atendido: 'Atendido',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['nuevo', 'atendido'];
