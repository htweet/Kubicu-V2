import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { cn } from '../../../utils/cn';

interface ItemListEditorProps<T extends {id: string;}> {
  legend: string;
  items: T[];
  onChange: (items: T[], field: string) => void;
  /** Short title shown on the collapsed row. */
  title: (item: T, index: number) => string;
  meta?: (item: T) => string | undefined;
  render: (item: T, update: (patch: Partial<T>, field: string) => void) => React.ReactNode;
  create: () => T;
  addLabel: string;
  noun: string;
  max?: number;
  min?: number;
  error?: string;
  hint?: string;
}

/** Ordered list of sub-items (products, packages, photos…). One row open at a time keeps the inspector short. */
export function ItemListEditor<T extends {id: string;}>({
  legend,
  items,
  onChange,
  title,
  meta,
  render,
  create,
  addLabel,
  noun,
  max = 12,
  min = 0,
  error,
  hint
}: ItemListEditorProps<T>) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const update = (id: string) => (patch: Partial<T>, field: string) =>
  onChange(items.map((i) => i.id === id ? { ...i, ...patch } : i), `${id}:${field}`);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next, 'order');
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-label font-medium text-fg">
        {legend}
        <span className="text-caption font-normal text-fg-subtle">
          {items.length} / {max}
        </span>
      </legend>
      {hint && <p className="-mt-1 text-caption text-fg-subtle">{hint}</p>}
      {error && <p className="text-caption text-danger">{error}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const open = openId === item.id;
          const m = meta?.(item);
          return (
            <li key={item.id} className={cn('rounded-md border', open ? 'border-line-strong' : 'border-line')}>
              <div className="flex items-center gap-1 pl-1 pr-1">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex min-h-[40px] min-w-0 flex-1 items-center gap-2 rounded-sm px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  
                  <ChevronDownIcon size={14} className={cn('shrink-0 text-fg-subtle transition-transform duration-150', !open && '-rotate-90')} aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-label text-fg">{title(item, i) || `${noun} ${i + 1}`}</span>
                    {m && <span className="block truncate text-caption text-fg-subtle">{m}</span>}
                  </span>
                </button>
                <IconButton icon={ArrowUpIcon} label={`Move ${noun.toLowerCase()} ${i + 1} up`} size="sm" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton icon={ArrowDownIcon} label={`Move ${noun.toLowerCase()} ${i + 1} down`} size="sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} />
                <IconButton
                  icon={Trash2Icon}
                  label={`Remove ${noun.toLowerCase()} ${i + 1}`}
                  size="sm"
                  disabled={items.length <= min}
                  onClick={() => onChange(items.filter((x) => x.id !== item.id), 'remove')} />
                
              </div>
              {open && <div className="flex flex-col gap-3 border-t border-line p-3">{render(item, update(item.id))}</div>}
            </li>);

        })}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={PlusIcon}
        className="self-start"
        disabled={items.length >= max}
        onClick={() => {
          const next = create();
          onChange([...items, next], 'add');
          setOpenId(next.id);
        }}>
        
        {items.length >= max ? `Limit of ${max} reached` : addLabel}
      </Button>
    </fieldset>);

}