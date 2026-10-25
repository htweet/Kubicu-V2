import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, CalculatorIcon } from 'lucide-react';
import type { FormField } from '../../types/forms';
import type { FormSkin } from './formSkin';
import { BookingSlotInput } from './BookingSlotInput';
import { formCountries, nigerianBanks, nigerianStates } from '../../data/formRegions';
import { formatNgn } from '../../utils/format';
import { announce } from '../../utils/announce';

interface MoreFieldControlProps {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  skin: FormSkin;
  inert: boolean;
  id: string;
  labelId: string;
  describedBy?: string;
  invalid: boolean;
  /** Calculated total: the current result. */
  computed?: number;
}

export const moreFieldTypes = ['ranking', 'grid', 'bookingSlot', 'bank', 'region', 'calculated'] as const;

/** Controls for Ranking, Grid, Booking time, Bank details, Country & state and Calculated total (D194). */
export function MoreFieldControl({ field, value, onChange, skin, inert, id, labelId, describedBy, invalid, computed = 0 }: MoreFieldControlProps) {
  const list = Array.isArray(value) ? value : [];
  const tab = inert ? -1 : undefined;
  const inputCls = 'h-11 w-full min-w-0 px-3.5 text-[14.5px] outline-none focus:ring-2';
  const common = { disabled: inert, tabIndex: tab, 'aria-invalid': invalid || undefined, 'aria-describedby': describedBy, style: skin.input };
  const rule = `1px solid color-mix(in srgb, ${skin.text} 12%, transparent)`;
  const sub = (htmlFor: string, t: string) =>
  <label htmlFor={htmlFor} className="text-[12px]" style={{ color: skin.muted }}>
      {t}
    </label>;


  switch (field.type) {
    case 'ranking':{
        const items = field.options.filter((o) => o.trim());
        const order = list.length === items.length && items.every((o) => list.includes(o)) ? list : items;
        const move = (i: number, dir: -1 | 1) => {
          const j = i + dir;
          if (j < 0 || j >= order.length) return;
          const next = [...order];
          [next[i], next[j]] = [next[j], next[i]];
          onChange(next);
          announce(`${order[i]} moved to position ${j + 1} of ${order.length}`);
        };
        return (
          <div className="flex flex-col gap-2">
          <ol aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-col">
            {order.map((o, i) =>
              <li key={o} className="flex items-center gap-2 py-1.5" style={i > 0 ? { borderTop: rule } : undefined}>
                <span className="w-6 shrink-0 text-center text-[13px] font-semibold tabular-nums" style={{ color: skin.muted }}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 break-words text-[14.5px]" style={{ color: skin.text }}>
                  {o}
                </span>
                {[-1, 1].map((dir) =>
                <button
                  key={dir}
                  id={i === 0 && dir === 1 ? id : undefined}
                  type="button"
                  aria-label={`Move ${o} ${dir < 0 ? 'up' : 'down'}`}
                  disabled={inert || (dir < 0 ? i === 0 : i === order.length - 1)}
                  tabIndex={tab}
                  onClick={() => move(i, dir as -1 | 1)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30"
                  style={{ ...skin.input, color: skin.text, padding: 0 }}>
                  
                    {dir < 0 ? <ArrowUpIcon size={16} aria-hidden /> : <ArrowDownIcon size={16} aria-hidden />}
                  </button>
                )}
              </li>
              )}
          </ol>
          {list.length === 0 ?
            <button type="button" disabled={inert} tabIndex={tab} onClick={() => onChange(items)} className="min-h-[36px] self-start text-[13px] font-medium underline" style={{ color: skin.text }}>
              This order is right
            </button> :

            <p className="text-[12px]" style={{ color: skin.muted }} role="status">
              Order saved. Move any item to change it.
            </p>
            }
        </div>);

      }

    case 'grid':{
        const rows = field.options.filter((o) => o.trim());
        const cols = (field.gridColumns ?? []).filter((c) => c.trim());
        const answer = (row: string) => list.find((x) => x.split('=')[0] === row)?.split('=').slice(1).join('=') ?? '';
        const set = (row: string, col: string) => onChange([...list.filter((x) => x.split('=')[0] !== row), `${row}=${col}`]);
        return (
          <div role="group" aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-col">
          {rows.map((r, ri) =>
            <div key={r} role="radiogroup" aria-label={r} className="flex flex-col gap-2 py-3" style={ri > 0 ? { borderTop: rule } : undefined}>
              <span className="text-[14px] font-medium" style={{ color: skin.text }}>
                {r}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cols.map((c, ci) => {
                  const on = answer(r) === c;
                  return (
                    <label key={c} className="flex min-h-[40px] min-w-[64px] flex-1 cursor-pointer items-center justify-center px-2.5 text-center text-[13.5px] focus-within:ring-2" style={on ? { ...skin.input, ...skin.button, height: 'auto' } : { ...skin.input, color: skin.text, height: 'auto' }}>
                      <input id={ri === 0 && ci === 0 ? id : undefined} type="radio" name={`${id}-${ri}`} checked={on} disabled={inert} tabIndex={tab} onChange={() => set(r, c)} className="sr-only" />
                      {c}
                    </label>);

                })}
              </div>
            </div>
            )}
        </div>);

      }

    case 'bookingSlot':
      return <BookingSlotInput field={field} value={list} onChange={onChange} skin={skin} inert={inert} id={id} labelId={labelId} describedBy={describedBy} invalid={invalid} />;

    case 'region':{
        const [country = '', state = ''] = list;
        return (
          <div role="group" aria-labelledby={labelId} className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1">
            {sub(id, 'Country')}
            <select id={id} {...common} autoComplete="country-name" value={country} onChange={(e) => onChange([e.target.value, ''])} className={inputCls}>
              <option value="">Choose…</option>
              {formCountries.map((c) =>
                <option key={c}>{c}</option>
                )}
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {sub(`${id}-state`, country === 'Nigeria' ? 'State' : 'State or region')}
            {country === 'Nigeria' ?
              <select id={`${id}-state`} {...common} value={state} onChange={(e) => onChange([country, e.target.value])} className={inputCls}>
                <option value="">Choose…</option>
                {nigerianStates.map((s) =>
                <option key={s}>{s}</option>
                )}
              </select> :

              <input id={`${id}-state`} {...common} autoComplete="address-level1" maxLength={60} value={state} disabled={inert || !country} onChange={(e) => onChange([country, e.target.value])} className={inputCls} />
              }
          </div>
        </div>);

      }

    case 'bank':{
        const [bank = '', acct = '', holder = ''] = list;
        return (
          <div role="group" aria-labelledby={labelId} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1">
              {sub(id, 'Bank')}
              <select id={id} {...common} value={bank} onChange={(e) => onChange([e.target.value, acct, holder])} className={inputCls}>
                <option value="">Choose…</option>
                {nigerianBanks.map((b) =>
                  <option key={b}>{b}</option>
                  )}
              </select>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              {sub(`${id}-acct`, 'Account number (10 digits)')}
              <input id={`${id}-acct`} {...common} inputMode="numeric" autoComplete="off" maxLength={10} value={acct} onChange={(e) => onChange([bank, e.target.value.replace(/\D/g, '').slice(0, 10), holder])} className={`${inputCls} tabular-nums`} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {sub(`${id}-holder`, 'Name on the account')}
            <input id={`${id}-holder`} {...common} autoComplete="name" maxLength={80} value={holder} onChange={(e) => onChange([bank, acct, e.target.value])} className={inputCls} />
          </div>
          <p className="text-[12px]" style={{ color: skin.muted }}>
            The account name isn’t checked with your bank in this preview — please double-check it.
          </p>
        </div>);

      }

    case 'calculated':{
        const ngn = field.calc?.unit !== 'number';
        return (
          <div id={id} tabIndex={-1} className="flex items-center justify-between gap-3 px-3.5 py-3" style={{ ...skin.input, height: 'auto' }}>
          <span className="inline-flex items-center gap-2 text-[13px]" style={{ color: skin.muted }}>
            <CalculatorIcon size={15} aria-hidden /> Worked out from your answers
          </span>
          <output aria-labelledby={labelId} aria-live="polite" className="text-[17px] font-semibold tabular-nums" style={{ color: skin.text }}>
            {ngn ? formatNgn(computed) : computed.toLocaleString('en-NG')}
          </output>
        </div>);

      }

    default:
      return null;
  }
}