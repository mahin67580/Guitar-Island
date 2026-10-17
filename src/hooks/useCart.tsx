"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const CART_KEY = "gi_cart";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  brand: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
  maxQuantity: number; // stock limit at time of adding
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.productId === "string");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("gi_cart_changed"));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(readCart());
    setReady(true);

    const sync = () => setItems(readCart());
    window.addEventListener("gi_cart_changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gi_cart_changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
      const current = readCart();
      const existing = current.find((i) => i.productId === newItem.productId);
      let next: CartItem[];

      if (existing) {
        const newQty = Math.min(
          existing.quantity + qty,
          newItem.maxQuantity
        );
        next = current.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: newQty, maxQuantity: newItem.maxQuantity }
            : i
        );
      } else {
        next = [
          ...current,
          { ...newItem, quantity: Math.min(qty, newItem.maxQuantity) },
        ];
      }

      writeCart(next);
      setItems(next);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    const next = readCart().filter((i) => i.productId !== productId);
    writeCart(next);
    setItems(next);
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    const next = readCart()
      .map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: Math.max(1, Math.min(qty, i.maxQuantity)),
            }
          : i
      )
      .filter((i) => i.quantity > 0);
    writeCart(next);
    setItems(next);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}