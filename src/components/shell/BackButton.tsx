import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  /** Where to go when there's no earlier page in this tab (e.g. the link was opened directly). */
  fallback: string;
  label?: string;
  /** Overrides history: run this instead (e.g. step back inside a flow). */
  onClick?: () => void;
  /** Hide the text on narrow screens, keeping a 40px round target. */
  compact?: boolean;
  className?: string;
}

/** A plain "Back" control: browser history when there is some, otherwise a sensible fallback (D266). */
export function BackButton({ fallback, label = 'Back', onClick, compact, className }: BackButtonProps) {
  const navigate = useNavigate();
  const go = () => {
    if (onClick) return onClick();
    const idx = (window.history.state as {idx?: number;} | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);else
    navigate(fallback);
  };
  return (
    <button
      type="button"
      onClick={go}
      aria-label={label}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-label font-medium text-fg-muted transition-colors duration-150 ease-out hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        compact ? 'w-10 sm:w-auto sm:pl-2.5 sm:pr-3.5' : 'pl-2.5 pr-3.5',
        className
      )}>
      
      <ArrowLeftIcon size={18} aria-hidden />
      <span className={compact ? 'hidden sm:inline' : undefined}>{label}</span>
    </button>);

}