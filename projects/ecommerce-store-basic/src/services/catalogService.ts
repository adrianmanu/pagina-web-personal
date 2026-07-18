import type { Category, Product } from '../models/types';
import { MAX_PRODUCTS } from '../models/types';
import { KEYS, generateId, load, save } from './storage';
import { seedIfNeeded } from './seedService';

function products(): Product[] {
  seedIfNeeded();
  return load<Product[]>(KEYS.products, []);
}

function categories(): Category[] {
  seedIfNeeded();
  return load<Category[]>(KEYS.categories, []);
}

export const productService = {
  list(activeOnly = false): Product[] {
    const list = products();
    return activeOnly ? list.filter((p) => p.active) : list;
  },

  count(): number {
    return products().length;
  },

  canCreate(): boolean {
    return products().length < MAX_PRODUCTS;
  },

  getById(id: string): Product | undefined {
    return products().find((p) => p.id === id);
  },

  create(data: Omit<Product, 'id' | 'createdAt'>): Product | null {
    if (!this.canCreate()) return null;
    const product: Product = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    save(KEYS.products, [...products(), product]);
    return product;
  },

  update(id: string, data: Partial<Product>): Product | null {
    const list = products();
    const idx = list.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...data };
    save(KEYS.products, list);
    return list[idx];
  },

  remove(id: string): boolean {
    const list = products().filter((p) => p.id !== id);
    if (list.length === products().length) return false;
    save(KEYS.products, list);
    return true;
  },

  toggleAvailable(id: string): Product | null {
    const p = products().find((x) => x.id === id);
    if (!p) return null;
    return this.update(id, { available: !p.available });
  },
};

export const categoryService = {
  list(): Category[] {
    return categories();
  },

  getById(id: string): Category | undefined {
    return categories().find((c) => c.id === id);
  },
};
