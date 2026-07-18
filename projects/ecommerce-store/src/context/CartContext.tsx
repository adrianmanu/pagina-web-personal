import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '../models/types';
import { KEYS, load, save } from '../services/storage';
import { productService } from '../services/catalogService';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  return load<CartItem[]>(KEYS.cart, []);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    save(KEYS.cart, next);
  }, []);

  const add = useCallback(
    (productId: string, qty = 1) => {
      const product = productService.getById(productId);
      if (!product || !product.active || product.stock < 1) return;
      const existing = items.find((i) => i.productId === productId);
      const nextQty = (existing?.quantity ?? 0) + qty;
      const capped = Math.min(nextQty, product.stock);
      if (existing) {
        persist(items.map((i) => (i.productId === productId ? { ...i, quantity: capped } : i)));
      } else {
        persist([...items, { productId, quantity: capped }]);
      }
    },
    [items, persist],
  );

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      const product = productService.getById(productId);
      if (!product) return;
      if (qty <= 0) {
        persist(items.filter((i) => i.productId !== productId));
        return;
      }
      persist(
        items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(qty, product.stock) } : i,
        ),
      );
    },
    [items, persist],
  );

  const remove = useCallback(
    (productId: string) => persist(items.filter((i) => i.productId !== productId)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const item of items) {
      const p = productService.getById(item.productId);
      if (!p) continue;
      c += item.quantity;
      s += item.quantity * p.price;
    }
    return { count: c, subtotal: s };
  }, [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, add, updateQty, remove, clear }),
    [items, count, subtotal, add, updateQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside provider');
  return ctx;
}
