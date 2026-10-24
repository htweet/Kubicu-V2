import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';
import type { Coupon, CouponKind } from '../../../types/admin';
import type { WorkspacePlan } from '../../../types/plan';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { COUPON_MAX_SHARE, couponLabel } from '../../../utils/planCatalogue';
import { planOrder, plans } from '../../../data/plans';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { ReasonDialog } from '../ReasonDialog';

const sellable = planOrder.filter((p) => p !== 'free' && p !== 'enterprise');

function status(c: Coupon): {label: string;tone: 'success' | 'neutral' | 'warning';} {
  if (!c.active) return { label: 'Switched off', tone: 'neutral' };
  if (c.expiresAt && Date.parse(c.expiresAt) < Date.now()) return { label: 'Expired', tone: 'neutral' };
  if (c.maxUses !== null && c.uses >= c.maxUses) return { label: 'Used up', tone: 'warning' };
  return { label: 'Live', tone: 'success' };
}

/** Codes customers enter in the plan-change window (D135). One per payment; capped at half the charge. */
export function CouponsCard() {
  const [store, setStore] = useAdminStore();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [kind, setKind] = useState<CouponKind>('percent');
  const [value, setValue] = useState('');
  const [selPlans, setSelPlans] = useState<WorkspacePlan[]>(sellable);
  const [maxUses, setMaxUses] = useState('');
  const [days, setDays] = useState('30');
  const [duration, setDuration] = useState<Coupon['duration']>('first');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toggling, setToggling] = useState<Coupon | null>(null);

  const reset = () => {
    setCode('');
    setKind('percent');
    setValue('');
    setSelPlans(sellable);
    setMaxUses('');
    setDays('30');
    setDuration('first');
    setErrors({});
  };

  const create = (note: string) => {
    const c = code.trim().toUpperCase();
    const v = Number(value);
    const e: Record<string, string> = {};
    if (!/^[A-Z0-9]{4,16}$/.test(c)) e.code = '4–16 letters or numbers, no spaces.';else
    if (store.coupons.some((x) => x.code === c)) e.code = 'That code already exists.';
    if (kind === 'percent' && (!v || v > 100)) e.value = 'Enter 1–100%.';
    if (kind === 'fixed' && (!v || v > 1000000)) e.value = 'Enter ₦1–₦1,000,000.';
    if (selPlans.length === 0) e.plans = 'Choose at least one plan.';
    if (days && (Number(days) < 1 || Number(days) > 365)) e.days = '1–365 days, or leave empty for no end.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const coupon: Coupon = { id: `cpn_${Date.now().toString(36)}`, code: c, kind, value: v, plans: selPlans, maxUses: maxUses ? Number(maxUses) : null, uses: 0, expiresAt: days ? new Date(Date.now() + Number(days) * 86400000).toISOString() : null, duration, active: true, createdAt: new Date().toISOString(), createdBy: staffActor(store), note };
    setStore((s) => audit({ ...s, coupons: [coupon, ...s.coupons] }, { area: 'plans', action: `Created code ${c} (${couponLabel(coupon)})`, target: c, reason: note }));
    toast.success(`${c} is live`, { description: 'Customers can enter it under “Have a code?” when changing plan.' });
    setOpen(false);
    reset();
  };

  const toggle = (reason: string) => {
    if (!toggling) return;
    const c = toggling;
    setStore((s) => audit({ ...s, coupons: s.coupons.map((x) => x.id === c.id ? { ...x, active: !x.active } : x) }, { area: 'plans', action: `${c.active ? 'Switched off' : 'Switched on'} code ${c.code}`, target: c.code, reason }));
    toast(c.active ? `${c.code} switched off` : `${c.code} switched on`, { description: c.active ? 'Anyone already using it at renewal keeps it.' : undefined });
    setToggling(null);
  };

  return (
    <>
      <Card id="coupons" title="Codes" description={`One code per payment. It never takes more than ${COUPON_MAX_SHARE * 100}% off, even with yearly savings.`} actions={<Button size="sm" leadingIcon={PlusIcon} onClick={() => setOpen(true)}>New code</Button>} body="flush">
        {store.coupons.length === 0 ?
        <p className="px-5 py-5 text-label text-fg-muted md:px-6">No codes yet.</p> :

        <ul className="divide-y divide-line">
            {store.coupons.map((c) => {
            const st = status(c);
            return (
              <li key={c.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-label font-semibold tracking-wide text-fg">{c.code}</span>
                      <Badge tone={st.tone} dot>
                        {st.label}
                      </Badge>
                      {c.sample && <Badge tone="neutral">Sample</Badge>}
                    </span>
                    <span className="block text-caption text-fg-muted">
                      {couponLabel(c)} · {c.plans.map((p) => plans[p].name).join(', ')}
                    </span>
                    <span className="block text-caption text-fg-subtle">
                      Used {c.uses}
                      {c.maxUses !== null && ` of ${c.maxUses}`} · {c.expiresAt ? `ends ${new Date(c.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'no end date'} · made {formatRelative(c.createdAt)}
                    </span>
                  </span>
                  <Button size="sm" variant="tertiary" onClick={() => setToggling(c)}>
                    {c.active ? 'Switch off' : 'Switch on'}
                  </Button>
                </li>);

          })}
          </ul>
        }
      </Card>

      <ReasonDialog open={open} onClose={() => (setOpen(false), reset())} onConfirm={create} title="New code" description="Live as soon as you create it. The reason is kept in the audit log, not shown to customers." confirmLabel="Create code">
        <TextInput id="cpn-code" label="Code" placeholder="e.g. OWAMBE15" value={code} error={errors.code} autoComplete="off" onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))} />
        <div className="flex flex-col gap-2">
          <p className="text-label font-medium text-fg">Discount</p>
          <div className="flex flex-wrap items-start gap-3">
            <Segmented<CouponKind>
              ariaLabel="Discount type"
              size="sm"
              value={kind}
              onChange={setKind}
              options={[
              { value: 'percent', label: 'Percent' },
              { value: 'fixed', label: 'Naira off' }]
              } />
            
            <TextInput id="cpn-value" label={kind === 'percent' ? 'Percent off' : 'Naira off'} placeholder={kind === 'percent' ? 'e.g. 20 (%)' : 'e.g. 1000'} prefix={kind === 'fixed' ? '₦' : undefined} inputMode="numeric" value={value} error={errors.value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 7))} fieldClassName="w-36 [&>div:first-child]:sr-only" />
          </div>
        </div>
        <fieldset>
          <legend className="text-label font-medium text-fg">Plans</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {sellable.map((p) =>
            <label key={p} className="flex items-center gap-2 text-label text-fg">
                <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--action))]" checked={selPlans.includes(p)} onChange={(e) => setSelPlans((xs) => e.target.checked ? [...xs, p] : xs.filter((x) => x !== p))} />
                {plans[p].name}
              </label>
            )}
          </div>
          {errors.plans && <p className="mt-1 text-caption text-danger">{errors.plans}</p>}
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="cpn-uses" label="Most uses" hint="Empty = no limit" inputMode="numeric" value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <TextInput id="cpn-days" label="Ends after (days)" hint="Empty = no end" inputMode="numeric" value={days} error={errors.days} onChange={(e) => setDays(e.target.value.replace(/\D/g, '').slice(0, 3))} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-label font-medium text-fg">Applies to</p>
          <Segmented<Coupon['duration']>
            ariaLabel="How long the code applies"
            size="sm"
            value={duration}
            onChange={setDuration}
            options={[
            { value: 'first', label: 'First payment' },
            { value: 'every', label: 'Every payment' }]
            } />
          
        </div>
      </ReasonDialog>

      <ReasonDialog open={!!toggling} onClose={() => setToggling(null)} onConfirm={toggle} destructive={toggling?.active} title={toggling?.active ? `Switch off ${toggling.code}?` : `Switch on ${toggling?.code}?`} description={toggling?.active ? 'New customers can’t use it. Workspaces already getting it at every renewal keep it.' : 'Customers can use it again, within its limits and end date.'} confirmLabel={toggling?.active ? 'Switch off' : 'Switch on'} />
    </>);

}