export type CustomerStatus = 'activo' | 'inactivo';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  city: string;
  status: CustomerStatus;
  createdAt: string;
}

export type CustomerInput = Omit<Customer, 'id' | 'createdAt'>;

/** Cliente enriquecido con estadísticas derivadas de sus pedidos. */
export interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
}
