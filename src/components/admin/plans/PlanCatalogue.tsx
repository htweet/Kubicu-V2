import React, { useState } from 'react';
import { toast } from 'sonner';
import { PencilIcon } from 'lucide-react';
import type { WorkspacePlan } from '../../../types/plan';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useStaffSession } from '../../../hooks/useStaffSession';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { effectiveStatus, newApproval } from '../../../utils/admin/approvals';
import { aiAllowance, monthlyPrice } from '../../../utils/planCatalogue';
import { planOrder, plans } from '../../../data/plans';
import { monthlyPriceNgn } from '../../../data/billing';
import { aiCredits } from '../../../data/aiLimits';
import { pageLimits } from '../../../utils/sitePages';
import { kubicuRateByPlan } from '../../../utils/commerce/money';
import { formatNgn, formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { IconButton } from '../../ui/IconButton';
import { TextInput } from '../../ui/TextInput';
import { ReasonDialog } from '../ReasonDialog';

const digits = (s: string) => s.replace(/\D/g, '').slice(0, 7);

/** The plan catalogue with edits that wait for a second staff member (D135). */
export function PlanCatalogue() {
  const { workspaces } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const me = useStaffSession();
  const [editing, setEditing] = useState<WorkspacePlan | null>(null);
  const [price, setPrice] = useState('');
  const [credits, setCredits] = useState('');
  const [errors, setErrors] = useState<{price?: string;credits?: string;}>({});
  const th = 'px-3 py-2.5 text-left text-caption font-semibold text-fg-subtle';
  const td = 'px-3 py-3 text-label tabular-nums';
  const pendingFor = (p: WorkspacePlan) => store.approvals.find((a) => a.kind === 'plan_change' && a.plan === p && effectiveStatus(a) === 'pending');

  const open = (p: WorkspacePlan) => {
    setEditing(p);
    setPrice(String(monthlyPrice(p, store) ?? ''));
    setCredits(String(aiAllowance(p, store)));
    setErrors({});
  };

  const submit = (reason: string) => {
    if (!editing) return;
    const priceN = Number(price);
    const creditsN = Number(credits);
    const errs: typeof errors = {};
    if (editing !== 'free' && (!price || priceN < 500)) errs.price = 'Enter at least ₦500.';
    if (editing === 'free' && priceN !== 0) errs.price = 'Free must stay ₦0.';
    if (credits === '' || creditsN > 100000) errs.credits = 'Enter 0–100,000 credits.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (priceN === monthlyPrice(editing, store) && creditsN === aiAllowance(editing, store)) {
      setErrors({ price: 'Nothing has changed.' });
      return;
    }
    const name = plans[editing].name;
    const summary = `Change ${name}: ${formatNgn(monthlyPrice(editing, store) ?? 0)} → ${formatNgn(priceN)}/month, ${aiAllowance(editing, store)} → ${creditsN} AI credits`;
    const ok = setStore((s) =>
    audit(
      { ...s, approvals: [newApproval({ kind: 'plan_change', summary, targetId: editing, targetEmail: `${name} plan`, reason, requestedById: me?.id ?? 'unknown', requestedBy: staffActor(s).split(' ·')[0], plan: editing, priceNgn: priceN, aiCredits: creditsN }), ...s.approvals] },
      { area: 'plans', action: `Asked to ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`, target: `${name} plan`, reason }
    )
    );
    if (!ok) return toast.error('Couldn’t save the request');
    toast.success('Sent for approval', { description: 'Another Platform lead or Finance member must approve within 24 hours. Nothing changes until then.' });
    setEditing(null);
  };

  return (
    <>
      <Card id="catalogue" title="Plan catalogue" description="Changing a price or AI allowance needs a second staff member. Approved changes apply to new sign-ups straight away and to existing workspaces at their next renewal — nobody is charged more mid-period." body="flush" emphasis="primary" className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <caption className="sr-only">Plan catalogue</caption>
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className={`${th} pl-5 md:pl-6`}>Plan</th>
                <th scope="col" className={`${th} text-right`}>Monthly</th>
                <th scope="col" className={`${th} text-right`}>AI credits / month</th>
                <th scope="col" className={`${th} text-right`}>Pages per space</th>
                <th scope="col" className={`${th} text-right`}>KUBICU fee</th>
                <th scope="col" className={`${th} text-right`}>Workspaces</th>
                <th scope="col" className={`${th} pr-5 md:pr-6`}>
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planOrder.map((p) => {
                const o = store.planOverrides[p];
                const pending = pendingFor(p);
                const m = monthlyPrice(p, store);
                return (
                  <tr key={p}>
                    <th scope="row" className={`${td} pl-5 text-left font-semibold text-fg md:pl-6`}>
                      <span className="flex flex-wrap items-center gap-2">
                        {plans[p].name}
                        {o && <Badge tone="info">Changed {formatRelative(o.approvedAt)}</Badge>}
                        {pending && <Badge tone="warning">Change waiting</Badge>}
                      </span>
                      <span className="block text-caption font-normal text-fg-subtle">{plans[p].intendedFor}</span>
                    </th>
                    <td className={`${td} text-right text-fg`}>
                      {m === null ? 'Talk to us' : m === 0 ? 'Free' : formatNgn(m)}
                      {o && o.monthlyNgn !== monthlyPriceNgn[p] && <span className="block text-caption text-fg-subtle line-through">{formatNgn(monthlyPriceNgn[p] ?? 0)}</span>}
                    </td>
                    <td className={`${td} text-right text-fg-muted`}>
                      {aiAllowance(p, store).toLocaleString()}
                      {o && o.aiCredits !== aiCredits[p] && <span className="block text-caption text-fg-subtle line-through">{aiCredits[p].toLocaleString()}</span>}
                    </td>
                    <td className={`${td} text-right text-fg-muted`}>{pageLimits[p]}</td>
                    <td className={`${td} text-right text-fg-muted`}>{(kubicuRateByPlan[p] * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%</td>
                    <td className={`${td} text-right text-fg`}>{workspaces.filter((w) => w.plan === p).length}</td>
                    <td className={`${td} pr-5 text-right md:pr-6`}>{p !== 'enterprise' && <IconButton icon={PencilIcon} label={`Change ${plans[p].name}`} size="sm" disabled={!!pending} onClick={() => open(p)} />}</td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-5 py-3 text-caption text-fg-subtle md:px-6">Pages and the KUBICU fee are set by release — they shape how pages and payouts are built, so they aren’t edited here.</p>
      </Card>

      <ReasonDialog open={!!editing} onClose={() => setEditing(null)} onConfirm={submit} title={editing ? `Change ${plans[editing].name}` : ''} description="A second staff member must approve this. Customers see the new price on the Pricing page and in the plan-change window once it’s approved." confirmLabel="Send for approval">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="plan-price" label="Monthly price" prefix="₦" inputMode="numeric" value={price} disabled={editing === 'free'} error={errors.price} hint="Yearly is 10× this." onChange={(e) => setPrice(digits(e.target.value))} />
          <TextInput id="plan-credits" label="AI credits a month" inputMode="numeric" value={credits} error={errors.credits} onChange={(e) => setCredits(digits(e.target.value))} />
        </div>
      </ReasonDialog>
    </>);

}