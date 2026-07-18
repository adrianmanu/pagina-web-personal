import { useCallback, useMemo, useState } from 'react';
import type { Customer, CustomerInput } from '../models/Customer';
import { customerService } from '../services/customerService';

export function useCustomersController() {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const customers = useMemo(() => customerService.listWithStats(), [version]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.company.toLowerCase().includes(query) ||
        customer.city.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const createCustomer = (input: CustomerInput): Customer => {
    const customer = customerService.create(input);
    refresh();
    return customer;
  };

  const updateCustomer = (id: string, input: CustomerInput): Customer => {
    const customer = customerService.update(id, input);
    refresh();
    return customer;
  };

  const removeCustomer = (id: string): void => {
    customerService.remove(id);
    refresh();
  };

  return {
    customers: filtered,
    totalCustomers: customers.length,
    search,
    setSearch,
    createCustomer,
    updateCustomer,
    removeCustomer,
  };
}
