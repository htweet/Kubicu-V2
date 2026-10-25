import React from 'react';
import { CheckIcon, ImageIcon, MinusIcon, PlusIcon } from 'lucide-react';
import type { FormField } from '../../types/forms';
import type { FormSkin } from './formSkin';
import { SignatureInput } from './SignatureInput';
import { parsePicks, picksTotal } from '../../utils/forms/logic';
import { formatNgn } from '../../utils/format';

interface RichFieldControlProps {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  skin: FormSkin;
  inert: boolean;
  /** Id for the first focusable control, so validation can focus it. */
  id: string;
  labelId: string;
  describedBy?: string;
  invalid: boolean;
}

export const richFieldTypes = ['name', 'dateRange', 'signature', 'scale', 'imageChoice', 'products'] as const;

/** Controls for the richer field types (D193): name, date range, signature, scale, image choice, product picker. */
export function RichFieldControl({ field, value, onChange, skin, inert, id, labelId, describedBy, invalid }: RichFieldControlProps) {
  const list = Array.isArray(value) ? value : [];
  const text = typeof value === 'string' ? value : '';
  const tab = inert ? -1 : undefined;
  const inputCls = 'h-11 w-full min-w-0 px-3.5 text-[14.5px] outline-none focus:ring-2';
  const sub = (htmlFor: string, t: string) =>
  <label htmlFor={htmlFor} className="text-[12px]" style={{ color: skin.muted }}>
      {t}
    </label>;

  const common = { disabled: inert, tabIndex: tab, 'aria-invalid': invalid || undefined, 'aria-describedby': describedBy, style: skin.input };

  switch (field.type) {
    case 'name':{
        const [first = '', last = ''] = list;
        return (
          <div role="group" aria-labelledby={labelId} className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1">
            {sub(id, 'First name')}
            <input id={id} {...common} autoComplete="given-name" maxLength={60} value={first} onChange={(e) => onChange([e.target.value, last])} className={inputCls} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {sub(`${id}-last`, 'Last name')}
            <input id={`${id}-last`} {...common} autoComplete="family-name" maxLength={60} value={last} onChange={(e) => onChange([first, e.target.value])} className={inputCls} />
          </div>
        </div>);

      }

    case 'dateRange':{
        const [from = '', to = ''] = list;
        return (
          <div role="group" aria-labelledby={labelId} className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1">
            {sub(id, 'From')}
            <input id={id} type="date" {...common} value={from} max={to || undefined} onChange={(e) => onChange([e.target.value, to])} className={inputCls} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {sub(`${id}-to`, 'To')}
            <input id={`${id}-to`} type="date" {...common} value={to} min={from || undefined} onChange={(e) => onChange([from, e.target.value])} className={inputCls} />
          </div>
        </div>);

      }

    case 'signature':
      return <SignatureInput id={id} value={text} onChange={onChange} skin={skin} inert={inert} describedBy={describedBy} invalid={invalid} labelledBy={labelId} />;

    case 'scale':{
        const s = field.scale ?? { min: 0, max: 10, minLabel: '', maxLabel: '' };
        const values = Array.from({ length: s.max - s.min + 1 }, (_, i) => s.min + i);
        return (
          <div className="flex flex-col gap-2">
          <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-wrap gap-1.5">
            {values.map((n, i) => {
                const on = text === String(n);
                const end = n === s.min ? s.minLabel : n === s.max ? s.maxLabel : '';
                return (
                  <button
                    key={n}
                    id={i === 0 ? id : undefined}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={end ? `${n} — ${end}` : String(n)}
                    disabled={inert}
                    tabIndex={tab}
                    onClick={() => onChange(String(n))}
                    className="flex h-11 min-w-[44px] flex-1 items-center justify-center text-[14.5px] font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2"
                    style={on ? { ...skin.input, ...skin.button } : { ...skin.input, color: skin.text }}>
                    
                  {n}
                </button>);

              })}
          </div>
          {(s.minLabel || s.maxLabel) &&
            <div aria-hidden className="flex justify-between gap-4 text-[12px]" style={{ color: skin.muted }}>
              <span>
                {s.min} = {s.minLabel}
              </span>
              <span className="text-right">
                {s.max} = {s.maxLabel}
              </span>
            </div>
            }
        </div>);

      }

    case 'imageChoice':{
        const opts = field.options.map((o, i) => ({ label: o.trim(), image: field.optionImages?.[i] ?? '' })).filter((o) => o.label);
        return (
          <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {opts.map((o, i) => {
              const on = text === o.label;
              return (
                <label
                  key={o.label}
                  className="group relative flex cursor-pointer flex-col overflow-hidden focus-within:ring-2"
                  style={{ ...skin.input, height: 'auto', padding: 0, outline: on ? `2px solid ${skin.text}` : undefined, outlineOffset: on ? 1 : undefined }}>
                  
                <input id={i === 0 ? id : undefined} type="radio" name={id} checked={on} disabled={inert} tabIndex={tab} onChange={() => onChange(o.label)} className="sr-only" />
                <span className="block aspect-square w-full overflow-hidden" style={{ background: `color-mix(in srgb, ${skin.text} 6%, transparent)` }}>
                  {o.image ?
                    <img src={o.image} alt="" className="h-full w-full object-cover" /> :

                    <span className="flex h-full w-full items-center justify-center" style={{ color: skin.muted }}>
                      <ImageIcon size={22} aria-hidden />
                    </span>
                    }
                </span>
                <span className="flex min-h-[40px] items-center gap-2 px-2.5 py-2 text-[13.5px] leading-snug" style={{ color: skin.text }}>
                  <span className="min-w-0 flex-1 break-words">{o.label}</span>
                  {on && <CheckIcon size={16} className="shrink-0" aria-hidden />}
                </span>
              </label>);

            })}
        </div>);

      }

    case 'products':{
        const products = field.products ?? [];
        const max = field.maxQty ?? 10;
        const picks = parsePicks(list);
        const qtyOf = (pid: string) => picks.find((p) => p.id === pid)?.qty ?? 0;
        const setQty = (pid: string, q: number) => {
          const next = products.map((p) => ({ id: p.id, qty: p.id === pid ? Math.max(0, Math.min(max, q)) : qtyOf(p.id) })).filter((p) => p.qty > 0);
          onChange(next.map((p) => `${p.id}:${p.qty}`));
        };
        if (!products.length) {
          return (
            <p className="text-[13.5px]" style={{ color: skin.muted }}>
            Nothing to choose from yet.
          </p>);

        }
        const total = picksTotal(field, list);
        return (
          <div role="group" aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-col">
          <ul className="flex flex-col">
            {products.map((p, i) => {
                const q = qtyOf(p.id);
                return (
                  <li key={p.id} className="flex items-center gap-3 py-2.5" style={i > 0 ? { borderTop: `1px solid color-mix(in srgb, ${skin.text} 12%, transparent)` } : undefined}>
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md" style={{ background: `color-mix(in srgb, ${skin.text} 6%, transparent)` }}>
                    {p.imageUrl && <img src={p.imageUrl} alt={p.imageAlt} className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium" style={{ color: skin.text }}>
                      {p.name}
                    </span>
                    <span className="block text-[12.5px] tabular-nums" style={{ color: skin.muted }}>
                      {formatNgn(p.priceNgn)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                        id={i === 0 ? id : undefined}
                        type="button"
                        aria-label={`One fewer ${p.name}`}
                        disabled={inert || q === 0}
                        tabIndex={tab}
                        onClick={() => setQty(p.id, q - 1)}
                        className="flex h-10 w-10 items-center justify-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40"
                        style={{ ...skin.input, color: skin.text, padding: 0 }}>
                        
                      <MinusIcon size={16} aria-hidden />
                    </button>
                    <span className="w-7 text-center text-[14.5px] font-semibold tabular-nums" style={{ color: skin.text }} aria-live="polite" aria-label={`${q} ${p.name}`}>
                      {q}
                    </span>
                    <button
                        type="button"
                        aria-label={`One more ${p.name}`}
                        disabled={inert || q >= max}
                        tabIndex={tab}
                        onClick={() => setQty(p.id, q + 1)}
                        className="flex h-10 w-10 items-center justify-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40"
                        style={{ ...skin.input, color: skin.text, padding: 0 }}>
                        
                      <PlusIcon size={16} aria-hidden />
                    </button>
                  </span>
                </li>);

              })}
          </ul>
          <div className="mt-1 flex items-center justify-between pt-2.5 text-[14px]" style={{ borderTop: `1px solid color-mix(in srgb, ${skin.text} 20%, transparent)`, color: skin.text }}>
            <span>Total</span>
            <span className="font-semibold tabular-nums" aria-live="polite">
              {formatNgn(total)}
            </span>
          </div>
        </div>);

      }

    default:
      return null;
  }
}