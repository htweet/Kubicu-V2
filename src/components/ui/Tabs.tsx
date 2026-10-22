import React, { useRef } from 'react';
import { cn } from '../../utils/cn';

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
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, ariaLabel, idPrefix, fullWidth, className }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('flex gap-1 border-b border-line', className)}>
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
              'relative -mb-px inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 text-label font-medium',
              'transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
              fullWidth && 'flex-1',
              selected ? 'border-action text-fg' : 'border-transparent text-fg-subtle hover:text-fg'
            )}>
            
            {item.label}
            {item.badge ?
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-soft px-1 text-meta font-semibold text-warning">
                {item.badge}
              </span> :
            null}
          </button>);

      })}
    </div>);

}