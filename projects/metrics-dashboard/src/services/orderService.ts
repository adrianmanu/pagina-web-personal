import type { Order, OrderInput, OrderStatus } from '../models/Order';
import { calcOrderTotal } from '../models/Order';
import { COLLECTIONS, generateId, loadCollection, saveCollection } from './storage';

function readOrders(): Order[] {
  return loadCollection<Order>(COLLECTIONS.orders) ?? [];
}

function nextOrderNumber(orders: Order[]): string {
  const max = orders.reduce((acc, order) => {
    const numeric = Number(order.number.replace(/\D/g, ''));
    return Number.isFinite(numeric) && numeric > acc ? numeric : acc;
  }, 1000);
  return `ORD-${max + 1}`;
}

function validateItems(input: OrderInput): void {
  if (!input.customerId) throw new Error('Selecciona un cliente');
  if (!input.items.length) throw new Error('Agrega al menos un ítem al pedido');
  for (const item of input.items) {
    if (!item.description.trim()) throw new Error('Cada ítem necesita una descripción');
    if (item.quantity < 1) throw new Error('Las cantidades deben ser mayores a cero');
    if (item.unitPrice < 0) throw new Error('Los precios no pueden ser negativos');
  }
}

export const orderService = {
  list(): Order[] {
    return readOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  create(input: OrderInput): Order {
    validateItems(input);
    const orders = readOrders();
    const order: Order = {
      id: generateId(),
      number: nextOrderNumber(orders),
      customerId: input.customerId,
      status: input.status,
      items: input.items,
      total: calcOrderTotal(input.items),
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    saveCollection(COLLECTIONS.orders, [...orders, order]);
    return order;
  },

  update(id: string, input: OrderInput): Order {
    validateItems(input);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Pedido no encontrado');

    const updated: Order = {
      ...orders[index],
      customerId: input.customerId,
      status: input.status,
      items: input.items,
      total: calcOrderTotal(input.items),
    };
    orders[index] = updated;
    saveCollection(COLLECTIONS.orders, orders);
    return updated;
  },

  changeStatus(id: string, status: OrderStatus): Order {
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Pedido no encontrado');
    orders[index] = { ...orders[index], status };
    saveCollection(COLLECTIONS.orders, orders);
    return orders[index];
  },

  remove(id: string): void {
    saveCollection(
      COLLECTIONS.orders,
      readOrders().filter((o) => o.id !== id),
    );
  },
};
