export type OrderStatus = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface OrderInput {
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt?: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pendiente',
  'pagado',
  'enviado',
  'entregado',
  'cancelado',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function calcOrderTotal(items: OrderItem[]): number {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return Math.round(total * 100) / 100;
}
