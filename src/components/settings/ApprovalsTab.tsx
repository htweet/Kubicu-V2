import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CalendarClockIcon, SendIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { formatRelative } from '../../utils/format';
import { formatSchedule } from '../../utils/schedule';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { ReviewDetail } from './ReviewDetail';
import { Card } from '../ui/layout/Card';

const statusBadge = {
  pending: { tone: 'info', label: 'Waiting' },
  approved: { tone: 'success', label: 'Approved' },
  changes: { tone: 'warning', label: 'Changes requested' },
  withdrawn: { tone: 'neutral', label: 'Withdrawn' }
} as const;

/** Settings → Approvals: the switch, the rules and the review queue (D58). */
export function ApprovalsTab() {
  const team = useTeam();
  const [params, setParams] = useSearchParams();
  const manage = team.can('team.manage');
  const reviewer = team.can('approvals.review').allowed;
  const openId = params.get('review');
  const mine = team.data.reviews.filter((r) => r.requestedById === team.me.id);
  const list = reviewer ? team.data.reviews : mine;
  const pending = list.filter((r) => r.status === 'pending');
  const recent = list.filter((r) => r.status !== 'pending').slice(0, 12);

  const row = (r: (typeof list)[number]) =>
  <li key={r.id}>
      <button
      type="button"
      onClick={() => setParams({ review: r.id })}
      className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
      
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
          <SendIcon size={15} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label font-medium text-fg">{r.spaceName}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {r.requestedBy} · {formatRelative(r.createdAt)}
            {r.updatedAt !== r.createdAt && r.status === 'pending' ? ' · updated since' : ''}
            {r.note ? ` · “${r.note}”` : ''}
          </span>
        </span>
        {r.scheduleAt &&
      <span className="hidden items-center gap-1 text-caption text-fg-muted sm:inline-flex">
            <CalendarClockIcon size={13} aria-hidden /> {formatSchedule(r.scheduleAt)}
          </span>
      }
        <Badge tone={statusBadge[r.status].tone}>{statusBadge[r.status].label}</Badge>
        <ArrowRightIcon size={15} className="shrink-0 text-fg-subtle" aria-hidden />
      </button>
    </li>;


  return (
    <div className="flex flex-col gap-8">
      <Card as="div" emphasis="primary" className="max-w-2xl">
        <Switch
          id="approvals-on"
          label="Editors need approval to publish"
          description={manage.allowed ? 'Owners and Admins still publish directly. Scheduled publishes are reviewed too.' : manage.reason}
          checked={team.data.approvalsOn}
          disabled={!manage.allowed}
          onChange={(approvalsOn) => team.update({ approvalsOn })} />
        
        <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-caption text-fg-muted">
          <li>Editors press <span className="font-semibold text-fg">Send for review</span> instead of Publish. Their live page doesn’t change until it’s approved.</li>
          <li>Approving publishes exactly the version that was sent. If the Editor keeps editing, the request updates and the reviewer is told.</li>
          <li>Request changes needs a comment, which the Editor sees in the canvas.</li>
        </ul>
      </Card>

      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading" className="text-label font-semibold text-fg">
          {reviewer ? 'Waiting for review' : 'Your requests'}
        </h2>
        {pending.length === 0 && recent.length === 0 ?
        <div className="mt-3 rounded-lg border border-line bg-raised">
            <EmptyState icon={SendIcon} title={reviewer ? 'Nothing to review' : 'No requests yet'} description={team.data.approvalsOn ? 'Requests appear here when an Editor sends a page, campaign or DealRoom for review.' : 'Turn on approvals to have Editors send their changes for review.'} />
          </div> :

        <>
            {pending.length > 0 ? <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">{pending.map(row)}</ul> : <p className="mt-2 text-caption text-fg-muted">Nothing waiting right now.</p>}
            {recent.length > 0 &&
          <>
                <h3 className="mt-8 text-caption font-semibold text-fg-subtle">Recently decided</h3>
                <ul className="mt-2 flex flex-col divide-y divide-line border-y border-line">{recent.map(row)}</ul>
              </>
          }
          </>
        }
      </section>

      <ReviewDetail reviewId={openId} onClose={() => setParams({})} />
    </div>);

}