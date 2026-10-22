import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { priceLine, seatsTaken } from '../../../utils/commerce/subscriptions';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { useCheckoutAllowed } from './CatalogFields';
import { CHECKOUT_PLAN } from '../../../utils/commerce/linkIssues';

/** Inspector for the Subscription block: pick 1–3 plans from Commerce (D69). */
export function SubscriptionFields({ block, issues }: {block: BlockOf<'subscription'>;issues: ValidationIssue[];}) {
  const { actions } = useEditor();
  const { data } = useCommerce();
  const { allowed, needed } = useCheckoutAllowed();
  const c = block.content;
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const warn = (f: string) => issues.find((i) => i.field === f && i.severity === 'warning')?.message;
  const id = (f: string) => `${block.id}-${f}`;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'subscription', patch, f);
  const plans = data.subPlans;
  const chosen = c.planIds.map((pid) => plans.find((p) => p.id === pid)).filter((p): p is NonNullable<typeof p> => !!p);

  const toggle = (pid: string) => {
    const on = c.planIds.includes(pid);
    const planIds = on ? c.planIds.filter((x) => x !== pid) : [...c.planIds, pid].slice(0, 3);
    set({ planIds, highlightPlanId: planIds.includes(c.highlightPlanId ?? '') ? c.highlightPlanId : null }, 'planIds');
  };

  return (
    <div className="flex flex-col gap-4">
      {!allowed &&
      <InlineAlert tone="info" title={`Subscriptions are on ${needed}`} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Subscriptions and recurring payments" />}>
          Set it up now; it can’t be published on your current plan.
        </InlineAlert>
      }
      <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextInput id={id('intro')} label="Intro" optional value={c.intro} placeholder="One line on why people join" onChange={(e) => set({ intro: e.target.value }, 'intro')} />

      <fieldset>
        <legend className="mb-2 text-label font-medium text-fg">Plans to show (up to 3)</legend>
        {plans.length === 0 ?
        <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
            <p className="text-label font-semibold text-fg">No plans yet</p>
            <Link to="/app/commerce/subscriptions" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
              Create a plan <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
          </div> :

        <ul className="flex flex-col rounded-md border border-line">
            {plans.map((p) => {
            const on = c.planIds.includes(p.id);
            const disabled = !on && c.planIds.length >= 3 || !on && p.status === 'archived';
            return (
              <li key={p.id} className="border-b border-line last:border-0">
                  <label className={`flex min-h-[48px] items-center gap-3 px-3 py-2 text-label ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-sunken'}`}>
                    <input type="checkbox" className="h-4 w-4" checked={on} disabled={disabled} onChange={() => toggle(p.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fg">
                        {p.name}
                        {p.status === 'archived' ? ' (archived)' : ''}
                      </span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {p.kind === 'box' ? 'Box' : 'Membership'} · {priceLine(p)} · {seatsTaken(data, p.id)} subscribed
                      </span>
                    </span>
                  </label>
                </li>);

          })}
          </ul>
        }
        {err('planIds') && <p className="mt-1.5 text-caption text-danger">{err('planIds')}</p>}
        {!err('planIds') && warn('planIds') && <p className="mt-1.5 text-caption text-warning">{warn('planIds')}</p>}
      </fieldset>

      {chosen.length > 1 &&
      <SelectInput id={id('highlight')} label="Highlight" value={c.highlightPlanId ?? ''} onChange={(v) => set({ highlightPlanId: v || null }, 'highlightPlanId')} options={[{ value: '', label: 'None' }, ...chosen.map((p) => ({ value: p.id, label: p.name }))]} />
      }
      <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} error={err('ctaLabel')} hint="Plans with a free trial say “Start free trial” instead." onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />

      {chosen.length > 0 &&
      <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
          <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-label font-semibold text-fg">Synced with Subscriptions</p>
            <p className="text-caption text-fg-muted">Prices, trials and benefits update here when you edit the plan. Full plans show “Full right now”.</p>
            <Link to="/app/commerce/subscriptions" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
              Edit in Commerce <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
          </div>
        </div>
      }
    </div>);

}