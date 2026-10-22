import React from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import type { RenderMode } from '../../types/page';
import { useCart } from '../../contexts/CartContext';

interface CheckoutButtonProps {
  mode: RenderMode;
  onAdd: (cart: NonNullable<ReturnType<typeof useCart>>) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  disabled?: boolean;
  children: React.ReactNode;
  showIcon?: boolean;
}

/** Adds to the visitor's cart on the live page. Inert in the editor and in previews. */
export function CheckoutButton({ mode, onAdd, className, style, ariaLabel, disabled, children, showIcon = true }: CheckoutButtonProps) {
  const cart = useCart();
  if (mode === 'edit' || !cart) {
    return (
      <span className={className} style={style} aria-label={ariaLabel}>
        {showIcon && <ShoppingBagIcon size={16} aria-hidden />}
        {children}
      </span>);

  }
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => onAdd(cart)}
      className={`${className ?? ''} transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50`}
      style={style}>
      
      {showIcon && <ShoppingBagIcon size={16} aria-hidden />}
      {children}
    </button>);

}