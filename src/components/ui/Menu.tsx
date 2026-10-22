import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { BoxIcon, CheckIcon } from "lucide-react";
export interface MenuItem {
  id: string;
  label: string;
  icon?: BoxIcon;
  /** Custom leading visual (e.g. a colour swatch); used instead of `icon`. */
  leading?: React.ReactNode;
  /** Shows a check on the right, for single-choice menus. */
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  reason?: string;
  destructive?: boolean;
}
interface MenuProps {
  trigger: (props: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
  }) => React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
  header?: React.ReactNode;
  /** Classes for the wrapper, e.g. `w-full` so a trigger can stretch. */
  className?: string;
}
export function Menu({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  header,
  className
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    const first = itemRefs.current.find((el) => el && !el.disabled);
    first?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const onItemKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    for (let i = 1; i <= items.length; i++) {
      const next = itemRefs.current[(index + step * i + items.length) % items.length];
      if (next && !next.disabled) {
        next.focus();
        break;
      }
    }
  };
  return <div ref={rootRef} className={cn('relative inline-flex', className)}>
      {trigger({
      onClick: () => setOpen((o) => !o),
      'aria-expanded': open,
      'aria-haspopup': 'menu'
    })}
      <AnimatePresence>
        {open && <motion.div role="menu" initial={{
        opacity: 0,
        scale: 0.96,
        y: side === 'bottom' ? -4 : 4
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98
      }} transition={{
        duration: 0.15,
        ease: [0.23, 1, 0.32, 1]
      }} className={cn('absolute z-50 min-w-[220px] rounded-md border border-line bg-overlay p-1 shadow-3', side === 'bottom' ? 'top-full mt-1.5 origin-top' : 'bottom-full mb-1.5 origin-bottom', align === 'end' ? 'right-0' : 'left-0')}>
            {header && <div className="border-b border-line px-2.5 pb-2 pt-1.5">{header}</div>}
            {items.map((item, i) => {
          const Icon = item.icon;
          return <button key={item.id} ref={(el) => itemRefs.current[i] = el} role="menuitem" type="button" disabled={item.disabled} onKeyDown={(e) => onItemKey(e, i)} onClick={() => {
            item.onSelect?.();
            setOpen(false);
          }} className={cn('flex w-full items-start gap-2.5 rounded-sm px-2.5 py-2 text-left text-label', 'transition-colors duration-100 focus-visible:bg-sunken focus-visible:outline-none', item.disabled ? 'cursor-not-allowed text-fg-subtle' : 'hover:bg-sunken', item.destructive && !item.disabled ? 'text-danger' : !item.disabled && 'text-fg')}>
                  {item.leading ? <span className="mt-px shrink-0">{item.leading}</span> : Icon && <Icon size={15} className="mt-px shrink-0" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="block">{item.label}</span>
                    {item.reason && <span className="mt-0.5 block text-caption text-fg-subtle">{item.reason}</span>}
                  </span>
                  {item.selected && <CheckIcon size={15} strokeWidth={2.5} className="mt-px shrink-0 text-action" aria-label="Selected" />}
                </button>;
        })}
          </motion.div>}
      </AnimatePresence>
    </div>;
}