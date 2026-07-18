import { useCallback, useMemo, useState } from 'react';
import type { Order, OrderInput, OrderStatus } from '../models/Order';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';

const PAGE_SIZE = 8;

export type StatusFilter = OrderStatus | 'todos';

export function useOrdersController() {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [page, setPage] = useState(1);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const orders = useMemo(() => orderService.list(), [version]);
  const customers = useMemo(() => customerService.list(), [version]);

  const customersById = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((customer) => map.set(customer.id, customer.name));
    return map;
  }, [customers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'todos' && order.status !== statusFilter) return false;
      if (!query) return true;
      const customerName = customersById.get(order.customerId) ?? '';
      return (
        order.number.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        order.items.some((item) => item.description.toLowerCase().includes(query))
      );
    });
  }, [orders, search, statusFilter, customersById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const createOrder = (input: OrderInput): Order => {
    const order = orderService.create(input);
    refresh();
    return order;
  };

  const updateOrder = (id: string, input: OrderInput): Order => {
    const order = orderService.update(id, input);
    refresh();
    return order;
  };

  const changeStatus = (id: string, status: OrderStatus): Order => {
    const order = orderService.changeStatus(id, status);
    refresh();
    return order;
  };

  const removeOrder = (id: string): void => {
    orderService.remove(id);
    refresh();
  };

  return {
    orders: paginated,
    totalOrders: filtered.length,
    customers,
    customersById,
    search,
    updateSearch,
    statusFilter,
    updateStatusFilter,
    page: currentPage,
    totalPages,
    setPage,
    createOrder,
    updateOrder,
    changeStatus,
    removeOrder,
  };
}
