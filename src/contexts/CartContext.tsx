import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine } from '../types/commerce';
import { useTrack } from './TrackContext';

interface CartValue {
  lines: CartLine[];
  open: boolean;
  /** Product waiting for an option choice before it can go in the cart. */
  choosing: string | null;
  /** `silent` adds without opening the cart (quick-order steppers, D196). */
  add: (productId: string, variantId?: string, needsChoice?: boolean, opts?: { silent?: boolean }) => void;
  setQty: (variantId: string, qty: number) => void;
  /** Seated tickets (D113): replaces the line with exactly these seats. Empty removes it. */
  setSeats: (productId: string, variantId: string, seats: string[]) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  doneChoosing: () => void;
  count: number;
}

const CartContext = createContext<CartValue | null>(null);

/** A visitor's cart on one public page. Kept for the browser session. */
export function CartProvider({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {
  const storageKey = `kubicu.cart.${pageKey}`;
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [choosing, setChoosing] = useState<string | null>(null);
  const track = useTrack();

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      // Session storage unavailable — cart lasts until refresh.
    }
  }, [lines, storageKey]);

  const add = useCallback((productId: string, variantId?: string, needsChoice?: boolean, opts?: { silent?: boolean }) => {
    if (!variantId || needsChoice) {
      setChoosing(productId);
      setOpen(true);
      return;
    }
    setLines((prev) => {
      const found = prev.find((l) => l.variantId === variantId);
      return found ? prev.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(20, l.qty + 1) } : l)) : [...prev, { productId, variantId, qty: 1 }];
    });
    track('cart_add', { label: productId });
    setChoosing(null);
    if (!opts?.silent) setOpen(true);
  }, [track]);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => {
            if (l.variantId !== variantId) return l;
            // Seated lines can only drop seats here; adding goes back through the seat map.
            if (l.seats?.length) {
              const seats = l.seats.slice(0, Math.min(qty, l.seats.length));
              return { ...l, seats, qty: seats.length };
            }
            return { ...l, qty: Math.min(20, qty) };
          }),
    );
  }, []);
  const setSeats = useCallback(
    (productId: string, variantId: string, seats: string[]) => {
      setLines((prev) => {
        const rest = prev.filter((l) => l.variantId !== variantId);
        if (!seats.length) return rest;
        const existingIndex = prev.findIndex((l) => l.variantId === variantId);
        const line = { productId, variantId, qty: seats.length, seats };
        if (existingIndex < 0) return [...rest, line];
        const out = [...prev];
        out[existingIndex] = line;
        return out;
      });
      if (seats.length) track('cart_add', { label: productId });
    },
    [track],
  );
  const remove = useCallback((variantId: string) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);
  const doneChoosing = useCallback(() => setChoosing(null), []);

  const value = useMemo(
    () => ({ lines, open, choosing, add, setQty, setSeats, remove, clear, setOpen, doneChoosing, count: lines.reduce((s, l) => s + l.qty, 0) }),
    [lines, open, choosing, add, setQty, setSeats, remove, clear, doneChoosing],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Null in the editor and previews, where checkout buttons are inert. */
export function useCart(): CartValue | null {
  return useContext(CartContext);
}
