// FRAN-X Digital Store — shopping cart context.
//
// Persists cart items in localStorage and exposes add/remove/clear plus a
// drawer-open state used by the cart drawer component. Cart items reference
// digital products by slug; the actual product data is resolved from the
// catalog at render time so prices stay in sync with the catalog.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  kind: "product" | "subscription";
  /** For subscriptions: the subscription code. */
  subCode?: string;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
};

const STORAGE_KEY = "franx.digital.cart";
const CartContext = createContext<CartState | null>(null);

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadItems);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Avoid duplicates by slug; subscriptions replace any existing subscription.
      if (item.kind === "subscription") {
        const withoutSubs = prev.filter((p) => p.kind !== "subscription");
        return [...withoutSubs, item];
      }
      if (prev.some((p) => p.slug === item.slug)) return prev;
      return [...prev, item];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const count = items.length;
  const total = items.reduce((sum, i) => sum + i.price, 0);

  const value = useMemo<CartState>(
    () => ({ items, add, remove, clear, count, total, isOpen, setOpen, open, close }),
    [items, add, remove, clear, count, total, isOpen, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
