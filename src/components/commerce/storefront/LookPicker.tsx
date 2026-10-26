import React from 'react';
import { CheckIcon } from 'lucide-react';
import type { ShopLook } from '../../../types/commerce';
import { shopLooks, type ShopLookDef } from '../../../utils/commerce/shopLooks';
import { cn } from '../../../utils/cn';

interface LookPickerProps {
  value: ShopLook;
  customised: boolean;
  disabled: boolean;
  onPick: (look: ShopLookDef) => void;
}

/** Six complete shop looks (D196). Each card sketches its own arrangement so they can be told apart at a glance. */
export function LookPicker({ value, customised, disabled, onPick }: LookPickerProps) {
  return (
    <div role="radiogroup" aria-label="Shop look" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {shopLooks.map((l) => {
        const on = l.id === value;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onPick(l)}
            className={cn(
              'group flex flex-col gap-2.5 rounded-lg border p-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60',
              on ? 'border-fg bg-raised' : 'border-line hover:border-line-strong'
            )}>
            
            <LookSketch id={l.id} />
            <span className="flex flex-col gap-0.5 px-0.5">
              <span className="flex items-center justify-between gap-2 text-label font-semibold text-fg">
                <span className="truncate">{l.name}</span>
                {on && <CheckIcon size={14} aria-hidden className="shrink-0" />}
              </span>
              <span className="line-clamp-2 text-caption text-fg-muted">{l.forWho}</span>
              {on && customised && <span className="text-caption font-medium text-fg-subtle">Customised</span>}
            </span>
          </button>);

      })}
    </div>);

}

/** A tiny structural drawing of each look, in neutral app tokens. */
function LookSketch({ id }: {id: ShopLook;}) {
  const box = 'rounded-[3px] bg-line';
  const soft = 'rounded-[3px] bg-sunken';
  return (
    <span aria-hidden className="flex aspect-[4/3] w-full flex-col gap-1 overflow-hidden rounded-md border border-line bg-raised p-1.5">
      {id === 'classic' &&
      <>
          <span className={`${box} h-[22%]`} />
          <span className="h-1 w-1/3 rounded-full bg-line-strong" />
          <span className="grid flex-1 grid-cols-4 gap-1">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} className={soft} />)}</span>
        </>
      }
      {id === 'boutique' &&
      <>
          <span className={`${box} h-[20%]`} />
          <span className="grid h-[42%] grid-cols-[1.4fr_1fr] gap-1">
            <span className={box} />
            <span className="grid grid-rows-2 gap-1"><span className={soft} /><span className={soft} /></span>
          </span>
          <span className="grid flex-1 grid-cols-3 gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={soft} />)}</span>
        </>
      }
      {id === 'catalogue' &&
      <span className="grid flex-1 grid-cols-[28%_1fr] gap-1.5">
          <span className="flex flex-col gap-1 pt-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className="h-1 rounded-full bg-line-strong" />)}</span>
          <span className="flex flex-col gap-1">
            {[0, 1].map((g) =>
          <span key={g} className="flex flex-1 flex-col gap-0.5">
                <span className="h-1.5 w-1/3 rounded-full bg-fg-subtle" />
                <span className="h-px w-full bg-line-strong" />
                {[0, 1].map((i) =>
            <span key={i} className="flex flex-1 items-center gap-1">
                    <span className="h-1 w-2/5 rounded-full bg-line-strong" />
                    <span className="flex-1 border-b border-dotted border-line-strong" />
                    <span className="h-1 w-2 rounded-full bg-line-strong" />
                  </span>
            )}
              </span>
          )}
          </span>
        </span>
      }
      {id === 'lookbook' &&
      <>
          <span className="grid h-[34%] grid-cols-2 gap-1"><span className="flex flex-col justify-center gap-1"><span className="h-1.5 w-3/4 rounded-full bg-line-strong" /><span className="h-1 w-1/2 rounded-full bg-line" /></span><span className={box} /></span>
          <span className="grid flex-1 grid-cols-3 gap-1">{[0, 1, 2].map((i) => <span key={i} className={`${box} relative`}><span className="absolute inset-x-0.5 bottom-0.5 h-1.5 rounded-sm bg-raised" /></span>)}</span>
        </>
      }
      {id === 'quick' &&
      <span className="flex flex-1 flex-col gap-1">
          {[0, 1, 2, 3].map((i) =>
        <span key={i} className="flex flex-1 items-center gap-1">
              <span className={`${soft} aspect-square h-full`} />
              <span className="h-1 flex-1 rounded-full bg-line" />
              <span className="flex gap-0.5"><span className="h-2 w-2 rounded-full bg-line-strong" /><span className="h-2 w-2 rounded-full bg-line-strong" /></span>
            </span>
        )}
          <span className="mx-auto h-2 w-1/2 rounded-full bg-fg-subtle" />
        </span>
      }
      {id === 'spotlight' &&
      <>
          <span className="grid h-[58%] grid-cols-2 gap-1.5">
            <span className={box} />
            <span className="flex flex-col justify-center gap-1"><span className="h-1.5 w-full rounded-full bg-line-strong" /><span className="h-1 w-2/3 rounded-full bg-line" /><span className="mt-1 h-2 w-1/2 rounded-sm bg-fg-subtle" /></span>
          </span>
          <span className="grid flex-1 grid-cols-3 gap-1">{[0, 1, 2].map((i) => <span key={i} className={soft} />)}</span>
        </>
      }
    </span>);

}