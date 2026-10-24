import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../contexts/LocaleContext";
import { BoxIcon } from "lucide-react";
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: BoxIcon;
  label: string;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}
const sizes = {
  sm: 'h-8 w-8 rounded-sm',
  md: 'h-9 w-9 rounded-md',
  lg: 'h-11 w-11 rounded-md'
};
const iconSizes = {
  sm: 15,
  md: 17,
  lg: 19
};
const variants = {
  ghost: 'text-fg-muted hover:text-fg hover:bg-sunken',
  outline: 'border border-line-strong bg-raised text-fg hover:bg-sunken',
  solid: 'bg-action text-action-fg hover:bg-action-hover'
};
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  active,
  className,
  type = 'button',
  title,
  ...rest
}, ref) {
  label = useT().t(label);
  return <button ref={ref} type={type} aria-label={label} title={title ?? label} aria-pressed={active} className={cn('inline-flex shrink-0 items-center justify-center', 'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', 'disabled:pointer-events-none disabled:opacity-40', sizes[size], variants[variant], active && 'bg-action-soft text-action hover:bg-action-soft hover:text-action', className)} {...rest}>
      <Icon size={iconSizes[size]} aria-hidden />
    </button>;
});