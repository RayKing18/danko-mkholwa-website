"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Extra } from "@/db/schema";

export type BasketItem = {
  key: string; // identifies identical lines (same product + same options)
  productId: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPriceCents: number; // base price + option deltas + extras
  quantity: number;
  selectedOptions: string[]; // e.g. ["Size: Large"]
  extras: Extra[];
  notes?: string;
};

type BasketContextValue = {
  items: BasketItem[];
  hydrated: boolean;
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<BasketItem, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "danko-mkholwa-basket-v1";
const MAX_QTY = 20;

const BasketContext = createContext<BasketContextValue | null>(null);

function makeKey(item: Omit<BasketItem, "key">) {
  return [
    item.productId,
    item.selectedOptions.join("|"),
    item.extras.map((e) => e.label).join("|"),
    item.notes ?? "",
  ].join("::");
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on the client (never during server render)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Save whenever the basket changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / private mode */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<BasketItem, "key">) => {
    const key = makeKey(item);
    setItems((current) => {
      const existing = current.find((i) => i.key === key);
      if (existing) {
        return current.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) }
            : i,
        );
      }
      return [...current, { ...item, key, quantity: Math.min(MAX_QTY, item.quantity) }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.key !== key)
        : current.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i,
          ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<BasketContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    return { items, hydrated, count, subtotalCents, addItem, setQuantity, removeItem, clear };
  }, [items, hydrated, addItem, setQuantity, removeItem, clear]);

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}
