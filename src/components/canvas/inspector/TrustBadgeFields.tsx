import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { usePublicPassport } from '../../../hooks/usePublicPassport';
import { levelLabels } from '../../../utils/trustPassport';
import { useVerifiedTick } from '../../../hooks/useVerifiedTick';
import { Segmented } from '../../ui/Segmented';
import { Switch } from '../../ui/Switch';
import { Field } from '../../ui/Field';
import { InlineAlert } from '../../ui/InlineAlert';

/** Inspector for the Trust Passport badge (D111). The level itself can't be edited. */
export function TrustBadgeFields({ block }: {block: BlockOf<'trustBadge'>;}) {
  const { actions } = useEditor();
  const { current } = useWorkspace();
  const { data } = useCommerce();
  const { passport } = usePublicPassport(current.id, data.orders);
  const tick = useVerifiedTick(current.id);
  const c = block.content;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'trustBadge', patch, f);

  return (
    <div className="flex flex-col gap-4">
      <Field id={`${block.id}-style`} label="Show">
        <Segmented
          ariaLabel="Badge style"
          fullWidth
          value={c.style}
          onChange={(v) => set({ style: v }, 'style')}
          options={[
          { value: 'compact', label: 'Compact' },
          { value: 'full', label: 'Full' },
          { value: 'verified', label: 'Verified' }]
          } />
        
      </Field>
      {c.style === 'verified' ?
      tick.shown ?
      <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
            Visitors see <span className="font-semibold text-fg">Verified by KUBICU</span> — {tick.label.replace(' by KUBICU', '').toLowerCase()}. It links to your passport.
          </p> :
      tick.hiddenByKubicu ?
      <InlineAlert tone="warning" title="KUBICU has hidden the verified seal">
            Your verification and payouts aren’t affected. Contact support if you think this is a mistake.
          </InlineAlert> :

      <InlineAlert tone="info" title="Shows once you’re verified">
            Visitors see nothing here until KUBICU approves your verification. Nobody can add this seal themselves.{' '}
            <Link to="/app/commerce/verification" className="font-semibold underline-offset-2 hover:underline">
              Go to Verification
            </Link>
          </InlineAlert> :


      <>
          <Switch id={`${block.id}-score`} label="Show the score" description="Out of 100. The level always shows. Off is kinder to new sellers." checked={c.showScore} onChange={(on) => set({ showScore: on }, 'showScore')} />
          <Switch id={`${block.id}-below`} label="Hide until “Building trust”" description="Visitors don’t see the badge while you’re “Just starting”." checked={!!c.hideBelow} onChange={(on) => set({ hideBelow: on }, 'hideBelow')} />
        </>
      }
      {c.style === 'verified' ? null : passport.level === 'starting' ?
      <InlineAlert tone="info" title="Your level is “Just starting”">
          {c.hideBelow ? 'Visitors don’t see this badge yet. It appears once verification or a few completed orders lift you to “Building trust”.' : 'You can publish it now, but it may help to wait until verification and a few completed orders lift you to “Building trust”.'}
        </InlineAlert> :

      <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
          Visitors see <span className="font-semibold text-fg">{levelLabels[passport.level]}</span> ({passport.score}/100) today. It’s worked out again every time the page opens, so it rises and falls with your records.
        </p>
      }
      <p className="text-caption text-fg-subtle">Tapping the badge opens your public passport with the checks you’ve met. Revenue and refund amounts are never shown.</p>
      <Link to="/app/trust" className="inline-flex items-center gap-1 text-label font-semibold text-fg hover:underline">
        Open Trust Passport <ArrowUpRightIcon size={14} aria-hidden />
      </Link>
    </div>);

}