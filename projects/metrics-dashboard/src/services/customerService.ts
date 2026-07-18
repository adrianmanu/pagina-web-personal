import type { Customer, CustomerInput, CustomerWithStats } from '../models/Customer';
import type { Order } from '../models/Order';
import { COLLECTIONS, generateId, loadCollection, saveCollection } from './storage';

function readCustomers(): Customer[] {
  return loadCollection<Customer>(COLLECTIONS.customers) ?? [];
}

function readOrders(): Order[] {
  return loadCollection<Order>(COLLECTIONS.orders) ?? [];
}

export const customerService = {
  list(): Customer[] {
    return readCustomers().sort((a, b) => a.name.localeCompare(b.name));
  },

  listWithStats(): CustomerWithStats[] {
    const orders = readOrders();
    return this.list().map((customer) => {
      const customerOrders = orders.filter((order) => order.customerId === customer.id);
      const totalSpent = customerOrders
        .filter((order) => order.status !== 'cancelado')
        .reduce((sum, order) => sum + order.total, 0);
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
      };
    });
  },

  create(input: CustomerInput): Customer {
    const customers = readCustomers();
    const normalizedEmail = input.email.trim().toLowerCase();
    if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Ya existe un cliente con ese correo');
    }
    const customer: Customer = {
      ...input,
      email: normalizedEmail,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    saveCollection(COLLECTIONS.customers, [...customers, customer]);
    return customer;
  },

  update(id: string, input: CustomerInput): Customer {
    const customers = readCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cliente no encontrado');

    const normalizedEmail = input.email.trim().toLowerCase();
    if (customers.some((c) => c.id !== id && c.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Ya existe otro cliente con ese correo');
    }

    const updated: Customer = { ...customers[index], ...input, email: normalizedEmail };
    customers[index] = updated;
    saveCollection(COLLECTIONS.customers, customers);
    return updated;
  },

  remove(id: string): void {
    const hasOrders = readOrders().some((order) => order.customerId === id);
    if (hasOrders) {
      throw new Error('No se puede eliminar: el cliente tiene pedidos asociados');
    }
    saveCollection(
      COLLECTIONS.customers,
      readCustomers().filter((c) => c.id !== id),
    );
  },
};
