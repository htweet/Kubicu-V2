import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArchiveIcon, ArchiveRestoreIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { SubBoxItem, SubInterval, SubPlan, SubPlanKind } from '../../types/subscriptions';
import { useCommerce } from '../../contexts/CommerceContext';
import { useT } from '../../contexts/LocaleContext';
import { emptySubPlan, intervalWord, seatsTaken } from '../../utils/commerce/subscriptions';
import { variantLabel } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';
import { withSymbol } from '../../utils/currency';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { CurrencyInput } from '../ui/CurrencyInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';

interface Props {
  /** Plan to edit, or the kind of a new one. */
  target: { plan: SubPlan } | { kind: SubPlanKind } | null;
  onClose: () => void;
}

const intOr = (s: string, fallback: number) => (s.trim() === '' || !Number.isFinite(Number(s)) ? fallback : Math.max(0, Math.floor(Number(s))));

/** Create or edit a membership or product box plan (D69). Follows the interface language (D133n). */
export function SubPlanEditor({ target, onClose }: Props) {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const existing = target && 'plan' in target ? target.plan : null;
  const [form, setForm] = useState<SubPlan>(() => existing ?? emptySubPlan(target && 'kind' in target ? target.kind : 'membership'));
  const [cap, setCap] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!target) return;
    const next = existing ?? emptySubPlan('kind' in target ? target.kind : 'membership');
    setForm(next);
    setCap(next.memberCap !== null ? String(next.memberCap) : '');
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const set = <K extends keyof SubPlan>(k: K, v: SubPlan[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setRule = <K extends keyof SubPlan['rules']>(k: K, v: SubPlan['rules'][K]) => setForm((f) => ({ ...f, rules: { ...f.rules, [k]: v } }));
  const taken = existing ? seatsTaken(data, existing.id) : 0;
  const physical = data.products.filter((p) => p.status === 'active' && p.kind === 'physical');
  const options = physical.flatMap((p) => p.variants.map((v) => ({ value: `${p.id}::${v.id}`, label: Object.keys(v.options).length ? `${p.name} — ${variantLabel(v)}` : p.name })));
  const unit = tr(intervalWord[form.interval]);

  const errors = useMemo(() => {
    const e: Partial<Record<'name' | 'priceNgn' | 'items' | 'cap' | 'trialDays', string>> = {};
    if (!form.name.trim()) e.name = tr('Subscribers see this name.');
    if (!form.priceNgn || form.priceNgn < 100) e.priceNgn = withSymbol(tr('Enter a price of at least ₦100.'));
    if (form.kind === 'box' && form.items.length === 0) e.items = tr('Add at least one product to the box.');
    const c = cap.trim() === '' ? null : Number(cap);
    if (c !== null && (!Number.isFinite(c) || c < 1)) e.cap = tr('At least 1, or leave empty for no limit.');
    else if (c !== null && c < taken) e.cap = tr('{n} people already subscribe. Set at least {n}.', { n: taken });
    if (form.trialDays > 90) e.trialDays = tr('Up to 90 days.');
    return e;
  }, [form, cap, taken, tr]);
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined);

  const save = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    const next: SubPlan = { ...form, name: form.name.trim(), memberCap: cap.trim() === '' ? null : Math.floor(Number(cap)) };
    const ok = apply((d) => ({ ...d, subPlans: existing ? d.subPlans.map((p) => (p.id === next.id ? next : p)) : [next, ...d.subPlans] }));
    if (!ok) return;
    toast.success(tr(existing ? 'Plan saved' : 'Plan created'), {
      description: existing && taken ? tr('New prices apply to new subscribers. Current subscribers keep their price until you tell them otherwise.') : tr('Add a Subscription block to your page to start taking sign-ups.'),
    });
    onClose();
  };

  const setArchived = (archived: boolean) => {
    if (!existing) return;
    if (apply((d) => ({ ...d, subPlans: d.subPlans.map((p) => (p.id === existing.id ? { ...p, status: archived ? 'archived' : 'active' } : p)) }))) {
      toast(tr(archived ? 'Plan archived' : 'Plan restored'), { description: tr(archived ? 'No new sign-ups. Current subscribers carry on until they cancel.' : 'It can take new sign-ups again.') });
      onClose();
    }
  };

  const remove = () => {
    if (!existing) return;
    if (apply((d) => ({ ...d, subPlans: d.subPlans.filter((p) => p.id !== existing.id) }))) {
      toast(tr('Plan deleted'));
      onClose();
    }
  };

  const updateItem = (i: number, patch: Partial<SubBoxItem>) => set('items', form.items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const boxValue = form.items.reduce((s, it) => {
    const p = data.products.find((x) => x.id === it.productId);
    const v = p?.variants.find((x) => x.id === it.variantId);
    return s + (p && v ? (v.priceNgn ?? p.priceNgn) * it.qty : 0);
  }, 0);

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      side="right"
      title={existing ? tr('Edit {name}', { name: existing.name }) : tr(form.kind === 'box' ? 'New product box' : 'New membership')}
      description={tr(form.kind === 'box' ? 'Repeat delivery of products from your catalogue. Each renewal creates an order.' : 'Recurring access or a service — classes, coaching, a members’ group.')}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {existing ? (
            taken === 0 && existing.status === 'archived' ? (
              <Button variant="tertiary" leadingIcon={Trash2Icon} onClick={remove}>
                {tr('Delete')}
              </Button>
            ) : (
              <Button variant="tertiary" leadingIcon={existing.status === 'active' ? ArchiveIcon : ArchiveRestoreIcon} onClick={() => setArchived(existing.status === 'active')}>
                {tr(existing.status === 'active' ? 'Archive' : 'Restore')}
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {tr('Cancel')}
            </Button>
            <Button onClick={save}>{tr(existing ? 'Save' : 'Create plan')}</Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-5 py-5">
        {existing && taken > 0 && (
          <InlineAlert tone="info" title={tr(taken === 1 ? '{n} current subscriber' : '{n} current subscribers', { n: taken })}>
            {tr('Price changes apply to new subscribers. Archive the plan to stop new sign-ups; current subscribers carry on.')}
          </InlineAlert>
        )}

        {!existing && (
          <Segmented<SubPlanKind>
            ariaLabel={tr('Plan type')}
            fullWidth
            value={form.kind}
            onChange={(k) => set('kind', k)}
            options={[
              { value: 'membership', label: tr('Membership') },
              { value: 'box', label: tr('Product box') },
            ]}
          />
        )}

        <div className="flex flex-col gap-4">
          <TextInput id="sp-name" label={tr('Plan name')} value={form.name} error={err('name')} placeholder={tr(form.kind === 'box' ? 'Weekly bread box' : 'Studio membership')} onChange={(e) => set('name', e.target.value)} />
          <TextInput id="sp-desc" label={tr('Short description')} optional value={form.description} placeholder={tr('One line about what people get')} onChange={(e) => set('description', e.target.value)} />
          <TextArea id="sp-benefits" label={tr('Benefits')} optional value={form.benefits} rows={4} hint={tr('One per line. Shown as a checklist on your page.')} onChange={(e) => set('benefits', e.target.value)} />
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-label font-semibold text-fg">{tr('Price')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencyInput id="sp-price" label={tr('Price')} value={form.priceNgn || null} error={err('priceNgn')} onChange={(v) => set('priceNgn', v ?? 0)} />
            <SelectInput<SubInterval>
              id="sp-interval"
              label={tr('Charged every')}
              value={form.interval}
              onChange={(v) => set('interval', v)}
              options={[
                { value: 'week', label: tr('Week') },
                { value: 'month', label: tr('Month') },
                { value: 'year', label: tr('Year') },
              ]}
            />
            <TextInput
              id="sp-trial"
              label={tr('Free trial')}
              optional
              type="number"
              inputMode="numeric"
              min={0}
              value={form.trialDays ? String(form.trialDays) : ''}
              placeholder={tr('No trial')}
              hint={tr('Days before the first charge.')}
              error={err('trialDays')}
              onChange={(e) => set('trialDays', intOr(e.target.value, 0))}
            />
            <CurrencyInput id="sp-setup" label={tr('Setup fee')} optional value={form.setupFeeNgn || null} hint={tr('Charged once at sign-up.')} onChange={(v) => set('setupFeeNgn', v ?? 0)} />
          </div>
          <TextInput
            id="sp-cap"
            label={tr('Most subscribers at once')}
            optional
            type="number"
            inputMode="numeric"
            min={1}
            value={cap}
            placeholder={tr('No limit')}
            error={err('cap')}
            hint={existing ? tr('{n} now.', { n: taken }) : tr('Sign-ups close when it’s full.')}
            fieldClassName="max-w-[260px]"
            onChange={(e) => setCap(e.target.value)}
          />
        </fieldset>

        {form.kind === 'box' && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-label font-semibold text-fg">{tr('What’s in the box')}</legend>
            {options.length === 0 ? (
              <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">{tr('Add an active physical product in Products first.')}</p>
            ) : (
              <>
                <ul className="flex flex-col gap-2">
                  {form.items.map((it, i) => (
                    <li key={`${it.productId}-${i}`} className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <SelectInput<string>
                          id={`sp-item-${i}`}
                          label={tr('Item {n}', { n: i + 1 })}
                          value={`${it.productId}::${it.variantId}`}
                          onChange={(v) => {
                            const [productId, variantId] = v.split('::');
                            updateItem(i, { productId, variantId });
                          }}
                          options={options}
                        />
                      </div>
                      <TextInput id={`sp-qty-${i}`} label={tr('Qty')} type="number" inputMode="numeric" min={1} value={String(it.qty)} fieldClassName="w-[80px]" onChange={(e) => updateItem(i, { qty: Math.max(1, intOr(e.target.value, 1)) })} />
                      <IconButton icon={XIcon} label={tr('Remove item {n}', { n: i + 1 })} onClick={() => set('items', form.items.filter((_, j) => j !== i))} />
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={PlusIcon}
                  className="self-start"
                  onClick={() => {
                    const [productId, variantId] = options[0].value.split('::');
                    set('items', [...form.items, { productId, variantId, qty: 1 }]);
                  }}
                >
                  {tr('Add a product')}
                </Button>
                {err('items') && <p className="text-caption font-medium text-danger">{err('items')}</p>}
                {form.items.length > 0 && (
                  <p className="text-caption text-fg-muted">
                    {tr('Bought separately: {amount}. Delivery is added from your delivery zones; stock is taken each cycle, and a cycle is skipped (not charged) if the box can’t be filled.', { amount: formatNgn(boxValue) })}
                  </p>
                )}
              </>
            )}
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-label font-semibold text-fg">{tr('What subscribers can do themselves')}</legend>
          <Switch
            id="sp-pause"
            label={tr('Pause')}
            description={form.rules.pause ? tr('Up to {n} × {unit} at a time.', { n: form.rules.maxPauseCycles, unit }) : tr('Only you can pause.')}
            checked={form.rules.pause}
            onChange={(v) => setRule('pause', v)}
          />
          {form.rules.pause && (
            <TextInput
              id="sp-maxpause"
              label={tr('Longest pause ({unit})', { unit })}
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={String(form.rules.maxPauseCycles)}
              fieldClassName="max-w-[220px]"
              onChange={(e) => setRule('maxPauseCycles', Math.min(12, Math.max(1, intOr(e.target.value, 1))))}
            />
          )}
          <Switch id="sp-skip" label={tr('Skip a cycle')} description={tr('Move the next charge on by one cycle.')} checked={form.rules.skip} onChange={(v) => setRule('skip', v)} />
          <Switch id="sp-switch" label={tr('Switch plan')} description={tr('Change to another of your active plans from the next renewal.')} checked={form.rules.switchPlan} onChange={(v) => setRule('switchPlan', v)} />
          <Switch
            id="sp-cancel"
            label={tr('Cancel any time')}
            description={form.rules.cancelAnyTime ? tr('Ends at the end of the paid period.') : tr('Needs {n} days’ notice before a charge.', { n: form.rules.noticeDays })}
            checked={form.rules.cancelAnyTime}
            onChange={(v) => setRule('cancelAnyTime', v)}
          />
          {!form.rules.cancelAnyTime && (
            <TextInput
              id="sp-notice"
              label={tr('Notice needed (days)')}
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              value={String(form.rules.noticeDays || '')}
              fieldClassName="max-w-[220px]"
              onChange={(e) => setRule('noticeDays', Math.min(30, Math.max(1, intOr(e.target.value, 1))))}
            />
          )}
        </fieldset>

        <p className="rounded-md bg-sunken px-3.5 py-3 text-caption text-fg-muted">
          <span className="font-semibold text-fg">{tr('Customers see:')} </span>
          {form.priceNgn ? tr('{amount} every {interval}', { amount: formatNgn(form.priceNgn), interval: unit }) : tr('Set a price')}
          {form.trialDays ? ` · ${tr('{n}-day trial', { n: form.trialDays })}` : ''}
          {form.setupFeeNgn ? ` · ${tr('{amount} setup', { amount: formatNgn(form.setupFeeNgn) })}` : ''}. {tr('Payments are test mode in this prototype.')}
        </p>
      </div>
    </Sheet>
  );
}
