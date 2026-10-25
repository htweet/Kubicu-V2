import React from 'react';
import { Link } from 'react-router-dom';
import { RepeatIcon } from 'lucide-react';
import type { MembersAreaSettings } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { Badge } from '../../ui/Badge';
import { TextArea } from '../../ui/TextArea';
import { TextInput } from '../../ui/TextInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { membersWithAccess, membershipPlans } from '../../../utils/membersArea';
import { formatNgn } from '../../../utils/format';

const linkClass = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/** Members area settings (D185): which membership plans get in, and the welcome card for everyone else. */
export function MembersAreaSettingsPanel() {
  const { state, actions } = useEditor();
  const { data } = useCommerce();
  const s = state.site.membersArea;
  if (!s) return null;

  const patch = (next: Partial<MembersAreaSettings>) => actions.transformDocument((doc) => doc.membersArea ? { ...doc, membersArea: { ...doc.membersArea, ...next } } : doc);
  const plansList = membershipPlans(data).filter((p) => p.status === 'active' || s.rule.planIds.includes(p.id));
  const count = membersWithAccess(s, data);
  const toggle = (id: string) => {
    const ids = s.rule.planIds.includes(id) ? s.rule.planIds.filter((x) => x !== id) : [...s.rule.planIds, id];
    patch({ rule: { access: 'plans', planIds: ids } });
  };

  return (
    <section aria-labelledby="ma-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="ma-heading" className="text-label font-semibold text-fg">
            Members area
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">
            <span className="font-semibold tabular-nums text-fg">{count}</span> {count === 1 ? 'person has' : 'people have'} access right now
          </p>
        </div>
        <Badge tone="info" dot>
          Members only
        </Badge>
      </div>

      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-label font-medium text-fg">Who gets in</legend>
        {plansList.length === 0 ?
        <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">
            No membership plans yet.{' '}
            <Link to="/app/commerce/subscriptions" className="font-semibold text-action hover:underline">
              Create one in Subscriptions
            </Link>
          </p> :

        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {plansList.map((p) =>
          <li key={p.id}>
                <label className="flex min-h-[48px] cursor-pointer items-center gap-2.5 px-3 py-1.5">
                  <input type="checkbox" className="h-4 w-4" checked={s.rule.planIds.includes(p.id)} onChange={() => toggle(p.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label text-fg">{p.name}</span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {formatNgn(p.priceNgn)} a {p.interval}
                      {p.status === 'archived' ? ' · archived, nobody new can join' : ''}
                    </span>
                  </span>
                </label>
              </li>
          )}
          </ul>
        }
        <p className="mt-1.5 text-caption text-fg-subtle">
          Active and trial subscribers get in. Cancelled members keep access until the end of the period they paid for; failed payments keep access during the grace period. Paused and ended subscriptions don’t get in.
        </p>
      </fieldset>

      <div className="flex flex-col gap-3">
        <h4 className="text-label font-medium text-fg">Welcome card for everyone else</h4>
        <TextInput id="ma-title" label="Heading" value={s.title} placeholder="Members get the full course here" onChange={(e) => patch({ title: e.target.value })} />
        <TextArea id="ma-teaser" label="What members get" optional rows={3} value={s.teaser} onChange={(e) => patch({ teaser: e.target.value })} hint="Shown above Join and Sign in. Only promise what you actually provide." />
        <TextInput id="ma-join" label="Join button" value={s.joinLabel} placeholder="Become a member" onChange={(e) => patch({ joinLabel: e.target.value })} hint="With more than one plan, visitors see a Join button per plan instead." />
      </div>

      <InlineAlert tone="info" title="Privacy is simulated in this prototype">
        One-time sign-in codes aren’t really sent, and page content and files aren’t stored privately — so this area is only as private as that simulation. Don’t put anything truly confidential here yet.
      </InlineAlert>

      <Link to="/app/commerce/subscriptions" className={linkClass}>
        <RepeatIcon size={13} aria-hidden /> Subscriptions & members
      </Link>
    </section>);

}