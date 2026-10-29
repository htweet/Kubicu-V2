import React, { useRef } from 'react';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  badge?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  idPrefix: string;
  fullWidth?: boolean;
  /** Tighter tabs for narrow panels; the strip never shows a scrollbar (it still scrolls by keyboard). */
  dense?: boolean;
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, ariaLabel, idPrefix, fullWidth, dense, className }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const { t } = useT();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('scroll-quiet flex overflow-x-auto shadow-[inset_0_-1px_0_0_rgb(var(--border-subtle))]', dense ? 'no-scrollbar gap-0' : 'gap-1', className)}>
      {items.map((item, i) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => refs.current[i] = el}
            id={`${idPrefix}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 text-label font-medium',
              dense ? 'px-1.5' : 'px-2.5',
              'transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
              fullWidth && 'flex-1',
              selected ? 'border-action text-fg' : 'border-transparent text-fg-subtle hover:text-fg'
            )}>
            
            {t(item.label)}
            {item.badge ?
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-soft px-1 text-meta font-semibold text-warning">
                {item.badge}
              </span> :
            null}
          </button>);

      })}
    </div>);

}