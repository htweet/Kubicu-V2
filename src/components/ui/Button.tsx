import React, { forwardRef } from "react";
import { Loader2Icon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
/** `ai` is reserved for actions that run AI (D63) — the gradient marks them everywhere. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: BoxIcon;
  trailingIcon?: BoxIcon;
  fullWidth?: boolean;
}
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-action text-action-fg hover:bg-action-hover active:bg-action-pressed',
  secondary: 'bg-raised text-fg border border-line-strong hover:bg-sunken',
  tertiary: 'text-fg-muted hover:text-fg hover:bg-sunken',
  destructive: 'bg-danger-soft text-danger border border-danger/30 hover:border-danger/60',
  ai: 'ai-fill text-white hover:brightness-110'
};
const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-label rounded-sm gap-1.5',
  md: 'h-10 px-4 text-label rounded-md gap-2',
  lg: 'h-12 px-5 text-body rounded-md gap-2'
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}, ref) {
  const iconSize = size === 'sm' ? 14 : 16;
  return <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn('inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium', 'transition-[background-color,border-color,color,transform,filter] duration-150 ease-out active:scale-[0.98]', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas', 'disabled:pointer-events-none disabled:opacity-45', variants[variant], sizes[size], fullWidth && 'w-full', className)} {...rest}>
      {loading ? <Loader2Icon size={iconSize} className="animate-spin" aria-hidden /> : Leading && <Leading size={iconSize} aria-hidden />}
      {children}
      {Trailing && !loading && <Trailing size={iconSize} aria-hidden />}
    </button>;
});