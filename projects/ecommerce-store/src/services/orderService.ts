import type { Order, OrderItem, OrderStatus, RevenuePeriod, RevenuePoint } from '../models/types';
import { KEYS, generateId, load, save } from './storage';
import { productService } from './catalogService';
import { seedIfNeeded } from './seedService';

function orders(): Order[] {
  seedIfNeeded();
  return load<Order[]>(KEYS.orders, []);
}

function nextOrderNumber(): string {
  const nums = orders()
    .map((o) => parseInt(o.orderNumber.replace('TN-', ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `TN-${max + 1}`;
}

export const orderService = {
  list(): Order[] {
    return [...orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  byUser(userId: string): Order[] {
    return this.list().filter((o) => o.userId === userId);
  },

  getById(id: string): Order | undefined {
    return orders().find((o) => o.id === id);
  },

  create(input: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    notes?: string;
    items: OrderItem[];
  }): Order | null {
    for (const item of input.items) {
      const p = productService.getById(item.productId);
      if (!p || p.stock < item.quantity) return null;
    }

    const total = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const order: Order = {
      id: generateId(),
      orderNumber: nextOrderNumber(),
      ...input,
      total,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    for (const item of input.items) {
      productService.adjustStock(item.productId, -item.quantity);
    }

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

  stats() {
    const all = orders();
    return {
      total: all.length,
      pending: all.filter((o) => o.status === 'pendiente').length,
      revenue: all
        .filter((o) => o.status !== 'cancelado')
        .reduce((s, o) => s + o.total, 0),
    };
  },

  revenueSeries(period: RevenuePeriod): RevenuePoint[] {
    const valid = orders().filter((o) => o.status !== 'cancelado');
    const now = new Date();

    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const matched = valid.filter((o) => o.createdAt.slice(0, 10) === key);
        return {
          key,
          label: d.toLocaleDateString('es-EC', { weekday: 'short' }),
          revenue: matched.reduce((s, o) => s + o.total, 0),
          orders: matched.length,
        };
      });
    }

    if (period === 'month') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const matched = valid.filter((o) => o.createdAt.slice(0, 7) === key);
        return {
          key,
          label: d.toLocaleDateString('es-EC', { month: 'short' }),
          revenue: matched.reduce((s, o) => s + o.total, 0),
          orders: matched.length,
        };
      });
    }

    const currentYear = now.getFullYear();
    return Array.from({ length: 4 }, (_, i) => {
      const year = currentYear - (3 - i);
      const key = String(year);
      const matched = valid.filter((o) => o.createdAt.slice(0, 4) === key);
      return {
        key,
        label: key,
        revenue: matched.reduce((s, o) => s + o.total, 0),
        orders: matched.length,
      };
    });
  },
};
