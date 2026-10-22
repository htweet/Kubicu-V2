import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine } from '../types/commerce';

interface CartValue {
  lines: CartLine[];
  open: boolean;
  /** Product waiting for an option choice before it can go in the cart. */
  choosing: string | null;
  add: (productId: string, variantId?: string, needsChoice?: boolean) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  doneChoosing: () => void;
  count: number;
}

const CartContext = createContext<CartValue | null>(null);

/** A visitor's cart on one public page. Kept for the browser session. */
export function CartProvider({ pageKey, children }: {pageKey: string;children: React.ReactNode;}) {
  const storageKey = `kubicu.cart.${pageKey}`;
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) as CartLine[] : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [choosing, setChoosing] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {

      // Session storage unavailable — cart lasts until refresh.
    }}, [lines, storageKey]);

  const add = useCallback((productId: string, variantId?: string, needsChoice?: boolean) => {
    if (!variantId || needsChoice) {
      setChoosing(productId);
      setOpen(true);
      return;
    }
    setLines((prev) => {
      const found = prev.find((l) => l.variantId === variantId);
      return found ? prev.map((l) => l.variantId === variantId ? { ...l, qty: Math.min(20, l.qty + 1) } : l) : [...prev, { productId, variantId, qty: 1 }];
    });
    setChoosing(null);
    setOpen(true);
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) => qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => l.variantId === variantId ? { ...l, qty: Math.min(20, qty) } : l));
  }, []);
  const remove = useCallback((variantId: string) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);
  const doneChoosing = useCallback(() => setChoosing(null), []);

  const value = useMemo(
    () => ({ lines, open, choosing, add, setQty, remove, clear, setOpen, doneChoosing, count: lines.reduce((s, l) => s + l.qty, 0) }),
    [lines, open, choosing, add, setQty, remove, clear, doneChoosing]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Null in the editor and previews, where checkout buttons are inert. */
export function useCart(): CartValue | null {
  return useContext(CartContext);
}