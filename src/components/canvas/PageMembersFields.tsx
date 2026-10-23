import React from 'react';
import type { SitePage } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { TextArea } from '../ui/TextArea';
import { UpgradeButton } from '../ui/UpgradeButton';

/** Members-only switch for one page of a site (D110). Home can't be members-only. */
export function PageMembersFields({ page }: {page: SitePage;}) {
  const { actions } = useEditor();
  const { data } = useCommerce();
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const rule = page.membersOnly ?? null;
  const set = (patch: Partial<NonNullable<SitePage['membersOnly']>>) => rule && actions.setPageMembers(page.id, { ...rule, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <Switch
        id={`pg-members-${page.id}`}
        label="Members only"
        description={allowed ? 'Only signed-in subscribers see this page. Others see your teaser and a sign-in button.' : 'Pro and above. Set it up now; it can’t be published on your plan.'}
        checked={!!rule}
        onChange={(on) => actions.setPageMembers(page.id, on ? { access: 'any', planIds: [], teaser: '' } : null)} />
      
      {!allowed && rule && <UpgradeButton plan={CHECKOUT_PLAN} feature="Members-only content" className="self-start" />}
      {rule &&
      <div className="flex flex-col gap-3 border-l-2 border-line pl-3">
          <Segmented
          ariaLabel="Who can see this page"
          fullWidth
          value={rule.access}
          onChange={(v) => set({ access: v })}
          options={[
          { value: 'any', label: 'Any subscriber' },
          { value: 'plans', label: 'Chosen plans' }]
          } />
        
          {rule.access === 'plans' &&
        <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1 text-caption font-medium text-fg">Plans that can see it</legend>
              {data.subPlans.length === 0 && <p className="text-caption text-fg-subtle">No plans yet — create one in Commerce → Subscriptions.</p>}
              {data.subPlans.map((p) => {
            const on = rule.planIds.includes(p.id);
            return (
              <label key={p.id} className="flex min-h-[36px] cursor-pointer items-center gap-2.5 text-label text-fg">
                    <input type="checkbox" className="h-4 w-4" checked={on} onChange={() => set({ planIds: on ? rule.planIds.filter((x) => x !== p.id) : [...rule.planIds, p.id] })} />
                    <span className="truncate">
                      {p.name}
                      {p.status === 'archived' ? ' (archived)' : ''}
                    </span>
                  </label>);

          })}
            </fieldset>
        }
          <TextArea id={`pg-members-teaser-${page.id}`} label="Teaser" optional rows={2} value={rule.teaser} placeholder="What members get on this page" onChange={(e) => set({ teaser: e.target.value })} />
        </div>
      }
    </div>);

}