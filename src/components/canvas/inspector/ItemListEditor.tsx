import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useT } from '../../../contexts/LocaleContext';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { cn } from '../../../utils/cn';

interface ItemListEditorProps<T extends {id: string;}> {
  /** English; translated here (D297). */
  legend: string;
  items: T[];
  onChange: (items: T[], field: string) => void;
  /** Short title shown on the collapsed row (usually what the owner typed, shown as typed). */
  title: (item: T, index: number) => string;
  /** Already in the screen language. */
  meta?: (item: T) => string | undefined;
  render: (item: T, update: (patch: Partial<T>, field: string) => void) => React.ReactNode;
  create: () => T;
  /** English; translated here. */
  addLabel: string;
  /** English singular, e.g. "Photo"; translated here. */
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
  const { t: tr } = useT();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const update = (id: string) => (patch: Partial<T>, field: string) =>
  onChange(items.map((i) => i.id === id ? { ...i, ...patch } : i), `${id}:${field}`);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next, 'order');
  };
  const thing = tr(noun);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-label font-medium text-fg">
        {tr(legend)}
        <span className="text-caption font-normal text-fg-subtle">
          {items.length} / {max}
        </span>
      </legend>
      {hint && <p className="-mt-1 text-caption text-fg-subtle">{tr(hint)}</p>}
      {error && <p className="text-caption text-danger">{tr(error)}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const open = openId === item.id;
          const m = meta?.(item);
          const label = `${thing} ${i + 1}`;
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
                    <span className="block truncate text-label text-fg">{title(item, i) || label}</span>
                    {m && <span className="block truncate text-caption text-fg-subtle">{m}</span>}
                  </span>
                </button>
                <IconButton icon={ArrowUpIcon} label={tr('Move {item} up', { item: label })} size="sm" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton icon={ArrowDownIcon} label={tr('Move {item} down', { item: label })} size="sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} />
                <IconButton
                  icon={Trash2Icon}
                  label={tr('Remove {item}', { item: label })}
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
        
        {items.length >= max ? tr('Limit of {n} reached', { n: max }) : tr(addLabel)}
      </Button>
    </fieldset>);

}