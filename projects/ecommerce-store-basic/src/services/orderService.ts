import type { Order, OrderItem, OrderStatus } from '../models/types';
import { KEYS, generateId, load, save } from './storage';
import { productService } from './catalogService';
import { seedIfNeeded } from './seedService';

function orders(): Order[] {
  seedIfNeeded();
  return load<Order[]>(KEYS.orders, []);
}

function nextOrderNumber(): string {
  const nums = orders()
    .map((o) => parseInt(o.orderNumber.replace('TB-', ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `TB-${max + 1}`;
}

export const orderService = {
  list(): Order[] {
    return [...orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  getById(id: string): Order | undefined {
    return orders().find((o) => o.id === id);
  },

  create(input: {
    customerName: string;
    customerPhone: string;
    address: string;
    notes?: string;
    items: OrderItem[];
  }): Order | null {
    for (const item of input.items) {
      const p = productService.getById(item.productId);
      if (!p || !p.available || !p.active) return null;
    }

    const total = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const order: Order = {
      id: generateId(),
      orderNumber: nextOrderNumber(),
      ...input,
      total,
      status: 'nuevo',
      createdAt: new Date().toISOString(),
    };

    save(KEYS.orders, [order, ...orders()]);
    return order;
  },

  updateStatus(id: string, status: OrderStatus): Order | null {
    const list = orders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], status };
    save(KEYS.orders, list);
    return list[idx];
  },
};
