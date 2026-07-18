import type { Category, Product } from '../models/types';
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

  getById(id: string): Product | undefined {
    return products().find((p) => p.id === id);
  },

  create(data: Omit<Product, 'id' | 'createdAt'>): Product {
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

  adjustStock(id: string, delta: number): Product | null {
    const p = products().find((x) => x.id === id);
    if (!p) return null;
    return this.update(id, { stock: Math.max(0, p.stock + delta) });
  },
};

export const categoryService = {
  list(): Category[] {
    return categories();
  },

  getById(id: string): Category | undefined {
    return categories().find((c) => c.id === id);
  },

  create(name: string): Category {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const cat: Category = { id: generateId(), name, slug };
    save(KEYS.categories, [...categories(), cat]);
    return cat;
  },

  update(id: string, name: string): Category | null {
    const list = categories();
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    list[idx] = { ...list[idx], name, slug };
    save(KEYS.categories, list);
    return list[idx];
  },

  remove(id: string): boolean {
    const hasProducts = products().some((p) => p.categoryId === id);
    if (hasProducts) return false;
    const list = categories().filter((c) => c.id !== id);
    if (list.length === categories().length) return false;
    save(KEYS.categories, list);
    return true;
  },
};
