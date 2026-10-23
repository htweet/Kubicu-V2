import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trash2Icon } from 'lucide-react';
import type { Discount, DiscountKind, DiscountScope, DiscountValue } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useEditor } from '../../contexts/EditorContext';
import { discountKindLabel, discountOrders, normaliseCode, suggestReferralCode, valueLabel } from '../../utils/commerce/discounts';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { DateTimeInput } from '../ui/DateTimeInput';
import { Segmented } from '../ui/Segmented';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';
import { cn } from '../../utils/cn';

interface DiscountEditorProps {
  /** Existing discount to edit, or the kind of a new one. */
  target: {discount: Discount;} | {kind: DiscountKind;} | null;
  onClose: () => void;
}

type ValueType = DiscountValue['type'];
type ScopeType = DiscountScope['scope'];

interface Form {
  code: string;
  title: string;
  valueType: ValueType;
  percent: string;
  amountNgn: number | null;
  scope: ScopeType;
  productIds: string[];
  collectionIds: string[];
  minSubtotalNgn: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: string;
  perCustomerLimit: string;
  active: boolean;
  referrerName: string;
  rewardNote: string;
}

function toForm(d: Discount | null, kind: DiscountKind): Form {
  return {
    code: d?.code ?? '',
    title: d?.title ?? '',
    valueType: d?.value.type ?? 'percent',
    percent: d?.value.type === 'percent' ? String(d.value.percent) : '10',
    amountNgn: d?.value.type === 'fixed' ? d.value.amountNgn : null,
    scope: d?.appliesTo.scope ?? 'all',
    productIds: d?.appliesTo.scope === 'products' ? d.appliesTo.productIds : [],
    collectionIds: d?.appliesTo.scope === 'collections' ? d.appliesTo.collectionIds : [],
    minSubtotalNgn: d?.minSubtotalNgn ?? (kind === 'automatic' ? 50000 : null),
    startsAt: d?.startsAt ?? null,
    endsAt: d?.endsAt ?? null,
    usageLimit: d?.usageLimit != null ? String(d.usageLimit) : '',
    perCustomerLimit: d?.perCustomerLimit != null ? String(d.perCustomerLimit) : kind === 'automatic' ? '' : '1',
    active: d?.active ?? true,
    referrerName: d?.referrerName ?? '',
    rewardNote: d?.rewardNote ?? ''
  };
}

const intOrNull = (s: string) => s.trim() === '' ? null : Math.max(0, Math.floor(Number(s)));

/** Create or edit a code, automatic offer or referral code (D51). */
export function DiscountEditor({ target, onClose }: DiscountEditorProps) {
  const { data, apply } = useCommerce();
  const { state } = useEditor();
  const existing = target && 'discount' in target ? target.discount : null;
  const kind: DiscountKind = existing?.kind ?? (target && 'kind' in target ? target.kind : 'code');
  const [form, setForm] = useState<Form>(() => toForm(existing, kind));
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!target) return;
    setForm(toForm(existing, kind));
    setTried(false);
    setConfirmDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const set = <K extends keyof Form,>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const uses = existing ? discountOrders(data, existing.id).length : 0;
  // Event tickets are listed too, so a code can apply to one event (D73).
  const products = data.products.filter((p) => p.status !== 'archived');
  const productLabel = (p: (typeof products)[number]) => p.kind === 'ticket' ? `Tickets · ${p.name}` : p.name;

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (kind !== 'automatic') {
      const c = normaliseCode(form.code);
      if (!/^[A-Z0-9-]{3,20}$/.test(c)) e.code = '3–20 characters: letters, numbers and hyphens.';else
      if (data.discounts.some((d) => d.id !== existing?.id && d.code === c)) e.code = 'Another discount already uses this code.';
    }
    if (kind === 'referral' && !form.referrerName.trim()) e.referrerName = 'Who shares this code?';
    if (!form.title.trim()) e.title = 'Customers see this at checkout.';
    if (form.valueType === 'percent') {
      const p = Number(form.percent);
      if (!Number.isFinite(p) || p < 1 || p > 90) e.percent = 'Between 1% and 90%.';
    }
    if (form.valueType === 'fixed' && (!form.amountNgn || form.amountNgn <= 0)) e.amountNgn = 'Enter an amount.';
    if (form.scope === 'products' && form.productIds.length === 0) e.productIds = 'Pick at least one product.';
    if (form.scope === 'collections' && form.collectionIds.length === 0) e.collectionIds = 'Pick at least one collection.';
    if (form.startsAt && form.endsAt && Date.parse(form.endsAt) <= Date.parse(form.startsAt)) e.endsAt = 'End after it starts.';
    if (kind === 'automatic' && form.scope === 'all' && form.minSubtotalNgn === null && form.valueType !== 'free_delivery') e.minSubtotalNgn = 'Automatic offers on everything need a minimum spend, or every order is discounted.';
    return e;
  }, [form, kind, data.discounts, existing?.id]);
  const err = (k: keyof Form) => tried ? errors[k] : undefined;

  const save = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    const value: DiscountValue = form.valueType === 'percent' ? { type: 'percent', percent: Number(form.percent) } : form.valueType === 'fixed' ? { type: 'fixed', amountNgn: form.amountNgn ?? 0 } : { type: 'free_delivery' };
    const appliesTo: DiscountScope = form.scope === 'all' ? { scope: 'all' } : form.scope === 'products' ? { scope: 'products', productIds: form.productIds } : { scope: 'collections', collectionIds: form.collectionIds };
    const next: Discount = {
      id: existing?.id ?? uid('disc'),
      kind,
      code: kind === 'automatic' ? '' : normaliseCode(form.code),
      title: form.title.trim(),
      value,
      appliesTo,
      minSubtotalNgn: form.minSubtotalNgn,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      usageLimit: intOrNull(form.usageLimit),
      perCustomerLimit: intOrNull(form.perCustomerLimit),
      active: form.active,
      referrerName: kind === 'referral' ? form.referrerName.trim() : undefined,
      rewardNote: kind === 'referral' ? form.rewardNote.trim() || undefined : undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      sample: existing?.sample
    };
    const ok = apply((d) => ({ ...d, discounts: existing ? d.discounts.map((x) => x.id === next.id ? next : x) : [next, ...d.discounts] }));
    if (!ok) return;
    toast.success(existing ? 'Discount saved' : `${discountKindLabel[kind]} created`, { description: existing && uses ? 'Changes apply to new orders only.' : next.code ? `Share ${next.code} with customers.` : 'It applies automatically at checkout.' });
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    if (apply((d) => ({ ...d, discounts: d.discounts.filter((x) => x.id !== existing.id) }))) {
      toast('Discount deleted');
      onClose();
    }
  };

  const toggleIn = (k: 'productIds' | 'collectionIds', id: string) => set(k, form[k].includes(id) ? form[k].filter((x) => x !== id) : [...form[k], id]);

  const titleFor = existing ? `Edit ${existing.code || existing.title}` : kind === 'automatic' ? 'New automatic offer' : kind === 'referral' ? 'New referral code' : 'New discount code';

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      side="right"
      title={titleFor}
      description={kind === 'automatic' ? 'Applies at checkout without a code when the conditions are met.' : kind === 'referral' ? 'A personal code for someone who sends you customers. Their tally shows on this page.' : 'Customers type this code at checkout.'}
      footer={
      <div className="flex w-full items-center justify-between gap-2">
          {existing && uses === 0 ?
        confirmDelete ?
        <Button variant="destructive" leadingIcon={Trash2Icon} onClick={remove}>
                Confirm delete
              </Button> :

        <Button variant="tertiary" leadingIcon={Trash2Icon} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button> :


        <span />
        }
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>{existing ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      }>
      
      <div className="flex flex-col gap-5 px-5 py-5">
        {existing && uses > 0 &&
        <InlineAlert tone="info" title={`Used on ${uses} order${uses === 1 ? '' : 's'}`}>
            Changes apply to new orders only. Discounts with orders can be paused but not deleted, so your records stay complete.
          </InlineAlert>
        }

        {kind === 'referral' &&
        <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
            id="disc-referrer"
            label="Who shares it"
            value={form.referrerName}
            error={err('referrerName')}
            placeholder="e.g. Chioma Okafor"
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, referrerName: name, code: existing || f.code && f.code !== suggestReferralCode(state.draft.handle, f.referrerName) ? f.code : suggestReferralCode(state.draft.handle, name) }));
            }} />
          
            <TextInput id="disc-reward" label="Their reward" optional value={form.rewardNote} placeholder="e.g. Free scarf after 5 orders" hint="A note for you. Nothing is paid out automatically." onChange={(e) => set('rewardNote', e.target.value)} />
          </div>
        }

        {kind !== 'automatic' &&
        <TextInput
          id="disc-code"
          label="Code"
          value={form.code}
          error={err('code')}
          className="font-mono uppercase"
          placeholder="EID20"
          hint="Not case-sensitive for customers."
          onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))} />

        }
        <TextInput id="disc-title" label="What customers see" value={form.title} error={err('title')} placeholder={kind === 'automatic' ? '10% off orders over ₦50,000' : 'Eid sale — 20% off'} onChange={(e) => set('title', e.target.value)} />

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-label font-medium text-fg">Discount</legend>
          <Segmented<ValueType>
            ariaLabel="Discount type"
            fullWidth
            value={form.valueType}
            onChange={(v) => set('valueType', v)}
            options={[
            { value: 'percent', label: 'Percentage' },
            { value: 'fixed', label: 'Fixed amount' },
            { value: 'free_delivery', label: 'Free delivery' }]
            } />
          
          {form.valueType === 'percent' && <TextInput id="disc-percent" label="Percentage off" type="number" inputMode="numeric" min={1} max={90} value={form.percent} error={err('percent')} fieldClassName="max-w-[180px]" onChange={(e) => set('percent', e.target.value)} />}
          {form.valueType === 'fixed' && <CurrencyInput id="disc-amount" label="Amount off" value={form.amountNgn} error={err('amountNgn')} onChange={(v) => set('amountNgn', v)} hint="Never more than the items it applies to." />}
          {form.valueType === 'free_delivery' && <p className="text-caption text-fg-muted">Removes the delivery fee. Doesn’t apply to pickup or digital orders.</p>}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-label font-medium text-fg">Applies to</legend>
          <Segmented<ScopeType>
            ariaLabel="Applies to"
            fullWidth
            value={form.scope}
            onChange={(v) => set('scope', v)}
            options={[
            { value: 'all', label: 'Everything' },
            { value: 'products', label: 'Products & events' },
            { value: 'collections', label: 'Collections' }]
            } />
          
          {form.scope !== 'all' &&
          <div>
              <ul className="scroll-quiet flex max-h-56 flex-col overflow-y-auto rounded-md border border-line">
                {(form.scope === 'products' ? products.map((p) => ({ id: p.id, name: productLabel(p) })) : data.collections.map((c) => ({ id: c.id, name: c.name }))).map((item) => {
                const key = form.scope === 'products' ? 'productIds' : 'collectionIds';
                const checked = form[key].includes(item.id);
                return (
                  <li key={item.id} className="border-b border-line last:border-0">
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-3 py-2 text-label text-fg hover:bg-sunken">
                        <input type="checkbox" checked={checked} onChange={() => toggleIn(key, item.id)} className="h-4 w-4" />
                        <span className="truncate">{item.name}</span>
                      </label>
                    </li>);

              })}
                {(form.scope === 'products' ? products : data.collections).length === 0 && <li className="px-3 py-3 text-caption text-fg-subtle">Nothing here yet.</li>}
              </ul>
              {(err('productIds') || err('collectionIds')) && <p className="mt-1.5 text-caption font-medium text-danger">{err('productIds') ?? err('collectionIds')}</p>}
            </div>
          }
          <CurrencyInput id="disc-min" label="Minimum spend" optional value={form.minSubtotalNgn} error={err('minSubtotalNgn')} onChange={(v) => set('minSubtotalNgn', v)} hint="Based on the items’ total before delivery." />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-label font-medium text-fg">When</legend>
          <DateTimeInput id="disc-start" label="Starts" optional clearable value={form.startsAt} onChange={(v) => set('startsAt', v)} hint="Empty = now" />
          <DateTimeInput id="disc-end" label="Ends" optional clearable value={form.endsAt} error={err('endsAt')} onChange={(v) => set('endsAt', v)} hint="Empty = no end" />
        </fieldset>

        {kind !== 'automatic' &&
        <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-label font-medium text-fg">Limits</legend>
            <TextInput id="disc-limit" label="Total uses" optional type="number" inputMode="numeric" min={1} value={form.usageLimit} placeholder="No limit" onChange={(e) => set('usageLimit', e.target.value)} />
            <TextInput id="disc-per" label="Uses per customer" optional type="number" inputMode="numeric" min={1} value={form.perCustomerLimit} placeholder="No limit" hint="Matched by phone number." onChange={(e) => set('perCustomerLimit', e.target.value)} />
          </fieldset>
        }

        <Switch id="disc-active" label="Active" description={form.active ? 'Can be used within its dates and limits.' : 'Paused — no one can use it until you turn it back on.'} checked={form.active} onChange={(v) => set('active', v)} />

        <p className={cn('rounded-md bg-sunken px-3.5 py-3 text-caption text-fg-muted')}>
          <span className="font-semibold text-fg">Summary: </span>
          {valueLabel(form.valueType === 'percent' ? { type: 'percent', percent: Number(form.percent) || 0 } : form.valueType === 'fixed' ? { type: 'fixed', amountNgn: form.amountNgn ?? 0 } : { type: 'free_delivery' })}
          {form.scope === 'all' ? ' on everything' : form.scope === 'products' ? ` on ${form.productIds.length} product${form.productIds.length === 1 ? '' : 's'}` : ` on ${form.collectionIds.length} collection${form.collectionIds.length === 1 ? '' : 's'}`}
          {form.minSubtotalNgn ? ` when the items come to ₦${form.minSubtotalNgn.toLocaleString('en-NG')} or more` : ''}. One discount per order — if another applies, the customer gets whichever saves them more.
        </p>
      </div>
    </Sheet>);

}