import React from 'react';
import { CreditCardIcon, PaperclipIcon, StarIcon } from 'lucide-react';
import type { FormField } from '../../types/forms';
import type { FormSkin } from './formSkin';
import { formatNgn } from '../../utils/format';
import { currencySymbol } from '../../utils/currency';

interface FormFieldInputProps {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  error?: string;
  skin: FormSkin;
  inert: boolean;
  idPrefix: string;
  /** Payment field: the amount due. */
  amount?: number;
}

/** One answer control. Every control has a visible label; errors are linked by aria-describedby (D76). */
export function FormFieldInput({ field, value, onChange, error, skin, inert, idPrefix, amount = 0 }: FormFieldInputProps) {
  const id = `${idPrefix}-${field.id}`;
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const described = [field.help ? helpId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined;
  const text = typeof value === 'string' ? value : '';
  const list = Array.isArray(value) ? value : [];
  const common = {
    id,
    disabled: inert,
    tabIndex: inert ? -1 : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': described,
    'aria-required': field.required || undefined,
    style: skin.input
  };
  const inputCls = 'h-11 w-full px-3.5 text-[14.5px] outline-none focus:ring-2';
  const label =
  <span className="text-[13px] font-medium" style={{ color: skin.text }}>
      {field.label}
      {field.required && field.type !== 'payment' && <span aria-hidden> *</span>}
    </span>;


  const control = (() => {
    switch (field.type) {
      case 'longText':
      case 'address':
        return <textarea {...common} rows={field.type === 'address' ? 2 : 4} value={text} placeholder={field.placeholder} maxLength={field.maxLength ?? undefined} autoComplete={field.type === 'address' ? 'street-address' : 'off'} onChange={(e) => onChange(e.target.value)} className="w-full resize-none px-3.5 py-2.5 text-[14.5px] outline-none focus:ring-2" />;
      case 'dropdown':
        return (
          <select {...common} value={text} onChange={(e) => onChange(e.target.value)} className={inputCls}>
            <option value="">Choose…</option>
            {field.options.filter(Boolean).map((o) =>
            <option key={o}>{o}</option>
            )}
          </select>);

      case 'choice':
      case 'checkboxes':{
          const multi = field.type === 'checkboxes';
          return (
            <div role={multi ? 'group' : 'radiogroup'} aria-labelledby={`${id}-lbl`} aria-describedby={described} className="flex flex-col gap-2">
            {field.options.filter(Boolean).map((o) => {
                const on = multi ? list.includes(o) : text === o;
                return (
                  <label key={o} className="flex min-h-[40px] cursor-pointer items-center gap-2.5 px-3 text-[14px]" style={{ ...skin.input, color: skin.text }}>
                  <input
                      type={multi ? 'checkbox' : 'radio'}
                      name={id}
                      checked={on}
                      disabled={inert}
                      tabIndex={inert ? -1 : undefined}
                      onChange={() => onChange(multi ? on ? list.filter((x) => x !== o) : [...list, o] : o)}
                      className="h-4 w-4"
                      style={{ accentColor: skin.text }} />
                    
                  {o}
                </label>);

              })}
          </div>);

        }
      case 'rating':{
          const n = Number(text) || 0;
          return (
            <div role="radiogroup" aria-labelledby={`${id}-lbl`} aria-describedby={described} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) =>
              <button key={s} type="button" role="radio" aria-checked={n === s} aria-label={`${s} of 5`} disabled={inert} tabIndex={inert ? -1 : undefined} onClick={() => onChange(String(s))} className="flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2">
                <StarIcon size={24} strokeWidth={1.8} style={{ color: skin.text }} fill={s <= n ? 'currentColor' : 'none'} aria-hidden />
              </button>
              )}
          </div>);

        }
      case 'file':
        return (
          <label className="flex h-11 cursor-pointer items-center gap-2 px-3.5 text-[14px]" style={{ ...skin.input, color: text ? skin.text : skin.muted }}>
            <PaperclipIcon size={16} aria-hidden />
            <span className="truncate">{text || 'Choose a file (max 10 MB)'}</span>
            <input
              type="file"
              className="sr-only"
              id={id}
              disabled={inert}
              aria-invalid={error ? true : undefined}
              aria-describedby={described}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onChange(f.size > 10 * 1024 * 1024 ? '' : `${f.name} · ${Math.max(1, Math.round(f.size / 1024))} KB`);
              }} />
            
          </label>);

      case 'consent':
        return (
          <label className="flex min-h-[24px] items-start gap-2.5 text-[13px]" style={{ color: skin.muted }}>
            <input type="checkbox" id={id} checked={text === 'yes'} disabled={inert} tabIndex={inert ? -1 : undefined} onChange={(e) => onChange(e.target.checked ? 'yes' : '')} className="mt-0.5 h-4 w-4" style={{ accentColor: skin.text }} aria-describedby={described} />
            <span>
              <span style={{ color: skin.text }}>{field.label}</span>
            </span>
          </label>);

      case 'payment':
        return (
          <div className="flex flex-col gap-3 p-3.5" style={{ ...skin.input, height: 'auto' }}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[14px]" style={{ color: skin.text }}>
                <CreditCardIcon size={16} aria-hidden /> Amount due
              </span>
              <span className="text-[17px] font-semibold tabular-nums" style={{ color: skin.text }}>
                {amount > 0 ? formatNgn(amount) : '—'}
              </span>
            </div>
            {text === 'paid' ?
            <p role="status" className="text-[13px] font-medium" style={{ color: skin.text }}>
                Paid with test card ✓
              </p> :

            <div className="flex flex-wrap gap-2">
                <button type="button" disabled={inert || amount <= 0} tabIndex={inert ? -1 : undefined} onClick={() => onChange('paid')} className="h-10 flex-1 px-3 text-[13.5px] font-semibold disabled:opacity-50" style={skin.button}>
                  Pay with test card
                </button>
                <button type="button" disabled={inert || amount <= 0} tabIndex={inert ? -1 : undefined} onClick={() => onChange('declined')} className="h-10 px-3 text-[13px] underline" style={{ color: skin.muted }}>
                  Test a decline
                </button>
              </div>
            }
            {text === 'declined' &&
            <p className="text-[13px]" role="alert" style={{ color: skin.danger }}>
                Card declined (test). Nothing was charged — try again.
              </p>
            }
            <p className="text-[11.5px]" style={{ color: skin.muted }}>
              Test mode — no real money moves.
            </p>
          </div>);

      default:{
          const type = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text';
          const mode = field.type === 'number' || field.type === 'amount' ? 'decimal' : type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined;
          const auto = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : /name/i.test(field.label) ? 'name' : 'off';
          return (
            <div className="relative">
            {field.type === 'amount' &&
              <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14.5px]" style={{ color: skin.muted }}>
                {currencySymbol()}
              </span>
              }
            <input {...common} type={type} inputMode={mode} autoComplete={auto} value={text} placeholder={field.placeholder || (field.type === 'phone' ? '+234' : '')} maxLength={field.maxLength ?? undefined} onChange={(e) => onChange(e.target.value)} className={inputCls} style={field.type === 'amount' ? { ...skin.input, paddingLeft: `calc(1.25rem + ${currencySymbol().length}ch)` } : skin.input} />
          </div>);

        }
    }
  })();

  const grouped = field.type === 'choice' || field.type === 'checkboxes' || field.type === 'rating';
  return (
    <div className="flex flex-col gap-1.5">
      {field.type !== 'consent' && (
      grouped || field.type === 'payment' ?
      <span id={`${id}-lbl`}>{label}</span> :

      <label htmlFor={id} id={`${id}-lbl`}>
            {label}
          </label>)
      }
      {control}
      {field.help &&
      <p id={helpId} className="text-[12px]" style={{ color: skin.muted }}>
          {field.help}
        </p>
      }
      {error &&
      <p id={errId} className="text-[12.5px] font-medium" style={{ color: skin.danger }}>
          {error}
        </p>
      }
    </div>);

}