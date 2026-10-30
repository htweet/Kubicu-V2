import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useT } from '../../../contexts/LocaleContext';
import { priceLine, seatsTaken } from '../../../utils/commerce/subscriptions';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { useCheckoutAllowed } from './CatalogFields';
import { CHECKOUT_PLAN } from '../../../utils/commerce/linkIssues';

const coverCounts = [1, 2, 3, 4, 5, 8, 10];

/** Inspector for the Members-only section (D110). Translated in D301. */
export function MembersOnlyFields({ block, issues }: {block: BlockOf<'membersOnly'>;issues: ValidationIssue[];}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const { data } = useCommerce();
  const { allowed, needed } = useCheckoutAllowed();
  const c = block.content;
  const id = (f: string) => `${block.id}-${f}`;
  const err = (f: string) => {
    const m = issues.find((i) => i.field === f && i.severity === 'error')?.message;
    return m ? tr(m) : undefined;
  };
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'membersOnly', patch, f);
  const plans = data.subPlans;
  const coverOptions = [
  { value: '0', label: tr('Everything below it') },
  ...coverCounts.map((n) => ({ value: String(n), label: n === 1 ? tr('The next block') : tr('The next {n} blocks', { n }) }))];


  return (
    <div className="flex flex-col gap-4">
      {!allowed &&
      <InlineAlert tone="info" title={tr('Members-only content is on {plan}', { plan: needed })} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Members-only content" />}>
          {tr('Set it up now; it can’t be published on your current plan.')}
        </InlineAlert>
      }
      <SelectInput id={id('covers')} label={tr('What it hides')} value={String(c.covers)} options={coverOptions} onChange={(v) => set({ covers: Number(v) }, 'covers')} hint={tr('Blocks above it stay public. Move blocks below it in the layers list to hide them.')} />

      <Field id={id('access')} label={tr('Who can see it')}>
        <Segmented
          ariaLabel={tr('Who can see it')}
          fullWidth
          value={c.access}
          onChange={(v) => set({ access: v }, 'access')}
          options={[
          { value: 'any', label: tr('Any subscriber') },
          { value: 'plans', label: tr('Chosen plans') }]
          } />
        
      </Field>
      {c.access === 'plans' && (
      plans.length === 0 ?
      <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
            <p className="text-label font-semibold text-fg">{tr('No subscription plans yet')}</p>
            <Link to="/app/commerce/subscriptions" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
              {tr('Create a plan')} <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
          </div> :

      <fieldset>
            <legend className="sr-only">{tr('Plans that can see it')}</legend>
            <ul className="flex flex-col rounded-md border border-line">
              {plans.map((p) => {
            const on = c.planIds.includes(p.id);
            return (
              <li key={p.id} className="border-b border-line last:border-0">
                    <label className="flex min-h-[48px] cursor-pointer items-center gap-3 px-3 py-2 text-label hover:bg-sunken">
                      <input type="checkbox" className="h-4 w-4" checked={on} onChange={() => set({ planIds: on ? c.planIds.filter((x) => x !== p.id) : [...c.planIds, p.id] }, 'planIds')} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-fg">
                          {p.name}
                          {p.status === 'archived' ? ` (${tr('archived')})` : ''}
                        </span>
                        <span className="block truncate text-caption text-fg-subtle">
                          {priceLine(p)} · {tr('{n} subscribed', { n: seatsTaken(data, p.id) })}
                        </span>
                      </span>
                    </label>
                  </li>);

          })}
            </ul>
            {err('planIds') && <p className="mt-1.5 text-caption text-danger">{err('planIds')}</p>}
          </fieldset>)
      }

      <TextInput id={id('title')} label={tr('Title visitors see')} value={c.title} placeholder={tr('For members')} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={id('teaser')} label={tr('Teaser')} optional rows={3} value={c.teaser} placeholder={tr('e.g. Weekly styling videos, early access to new drops and members’ prices.')} hint={tr('Tell visitors what they’re missing. Shown with the sign-in button.')} onChange={(e) => set({ teaser: e.target.value }, 'teaser')} />
      <TextInput id={id('join')} label={tr('Join button')} value={c.joinLabel} error={err('joinLabel')} onChange={(e) => set({ joinLabel: e.target.value }, 'joinLabel')} hint={tr('Opens sign-up for the plan, or scrolls to your Subscription block if you offer several.')} />

      <div className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
        <p className="font-medium text-fg">{tr('How members get in')}</p>
        <p className="mt-0.5">{tr('They sign in with the phone number or email they subscribed with and get a one-time code on WhatsApp, by text or by email. Trials, active plans, plans ending at the period end and failed payments still in their grace period get in. Paused and ended plans don’t.')}</p>
        <p className="mt-1.5">{tr('Check it with Preview → View as a visitor or a member.')}</p>
      </div>
      <p className="text-caption text-fg-subtle">{tr('Prototype: content is hidden on the page, not protected on a server.')}</p>
    </div>);

}