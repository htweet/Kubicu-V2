import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useCart } from '../../contexts/CartContext';
import { buttonRadius } from '../blocks/pageStyle';

/** Floating cart button on the public page, shown once something is in the cart. */
export function CartButton({ theme }: {theme: PageTheme;}) {
  const cart = useCart();
  const show = !!cart && cart.count > 0 && !cart.open;
  return (
    <AnimatePresence>
      {show &&
      <motion.div
        key="cart-button"
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        
          <button
          type="button"
          onClick={() => cart?.setOpen(true)}
          aria-label={`View cart, ${cart?.count} item${cart?.count === 1 ? '' : 's'}`}
          className="pointer-events-auto flex h-12 items-center gap-2.5 px-5 text-[15px] font-semibold shadow-3"
          style={{ background: theme.accent, color: theme.accentText, borderRadius: Math.min(buttonRadius(theme), 999) }}>
          
            <ShoppingBagIcon size={17} aria-hidden />
            View cart
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] tabular-nums" style={{ background: theme.accentText, color: theme.accent }}>
              {cart?.count}
            </span>
          </button>
        </motion.div>
      }
    </AnimatePresence>);

}