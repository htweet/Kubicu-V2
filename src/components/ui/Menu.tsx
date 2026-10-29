import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { BoxIcon, CheckIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
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
  const { t } = useT();
  items = items.map((i) => ({ ...i, label: t(i.label), reason: i.reason && t(i.reason) }));
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // D250: the menu floats over the page (fixed position) so a scrolling list or card can't clip it,
  // and flips above the trigger when there isn't room below.
  const [placed, setPlaced] = useState<'top' | 'bottom'>(side);
  const [pos, setPos] = useState<{top: number;left: number;width?: number;} | null>(null);
  const place = useCallback(() => {
    const root = rootRef.current;
    const menu = menuRef.current;
    if (!root || !menu) return;
    const r = root.getBoundingClientRect();
    // A stretched trigger (e.g. the sidebar appearance row) gets a menu exactly its width, as it had
    // before menus floated (D250); small triggers keep a content-sized menu.
    const width = r.width >= 220 ? Math.min(r.width, window.innerWidth - 16) : undefined;
    if (width !== undefined) menu.style.width = `${width}px`;
    const h = menu.offsetHeight;
    const w = width ?? menu.offsetWidth;
    const gap = 6;
    const edge = 8;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    let s: 'top' | 'bottom' = side;
    if (s === 'bottom' && r.bottom + gap + h > vh - edge && r.top - gap - h >= edge) s = 'top';else
    if (s === 'top' && r.top - gap - h < edge && r.bottom + gap + h <= vh - edge) s = 'bottom';
    const top = Math.max(edge, Math.min(s === 'bottom' ? r.bottom + gap : r.top - gap - h, vh - h - edge));
    const left = Math.max(edge, Math.min(align === 'end' ? r.right - w : r.left, vw - w - edge));
    setPos((p) => p && p.top === top && p.left === left && p.width === width ? p : { top, left, width });
    setPlaced(s);
  }, [align, side]);
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);
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
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const enabled = itemRefs.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled);
      (e.key === 'Home' ? enabled[0] : enabled[enabled.length - 1])?.focus();
      return;
    }
    if (e.key === 'Tab') {
      setOpen(false);
      return;
    }
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
        {open && <motion.div ref={menuRef} role="menu" style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width: pos?.width, visibility: pos ? 'visible' : 'hidden' }} initial={{
        opacity: 0,
        scale: 0.96,
        y: placed === 'bottom' ? -4 : 4
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
      }} className={cn('fixed z-[80] max-h-[calc(100vh-16px)] min-w-[220px] overflow-y-auto rounded-md border border-line bg-overlay p-1 shadow-3', pos?.width ? 'max-w-[calc(100vw-16px)]' : 'max-w-[min(340px,calc(100vw-16px))]', placed === 'bottom' ? align === 'end' ? 'origin-top-right' : 'origin-top-left' : align === 'end' ? 'origin-bottom-right' : 'origin-bottom-left')}>
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