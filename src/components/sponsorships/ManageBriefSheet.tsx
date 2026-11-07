import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLinkIcon } from 'lucide-react';
import type { SponsorBrief, SponsorApplication } from '../../types/sponsorship';
import { useT } from '../../contexts/LocaleContext';
import { useSponsorships } from '../../hooks/useSponsorships';
import { accept, approve, brandFee, requestChanges, setAppStatus, slotsLeft, trackedPath, trackedResults } from '../../utils/sponsorships';
import { formatNgn, formatRelative } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';
import { DisputePanel } from './DisputePanel';
import { InlineAlert } from '../ui/InlineAlert';
import { CreatorRecordLine } from './CreatorRecordLine';
import { disputeOpen } from '../../utils/sponsorships';

/** A brand's own brief: choose creators, approve their work, see results (D441). */
export function ManageBriefSheet({ brief, onClose, onFix }: { brief: SponsorBrief | null; onClose: () => void; /** Open a declined brief to fix and send again (D460). */ onFix?: (b: SponsorBrief) => void }) {
  const { t: tr } = useT();
  const { briefs, update } = useSponsorships();
  const live = brief ? briefs.find((b) => b.id === brief.id) ?? brief : null;
  const [asking, setAsking] = useState<string | null>(null);
  const [note, setNote] = useState('');

  if (!live) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const working = live.applications.filter((a) => a.status === 'accepted' || a.status === 'completed');
  const waiting = live.applications.filter((a) => a.status === 'applied');
  const held = working.reduce((s, a) => s + a.heldNgn, 0);
  const paid = working.reduce((s, a) => s + a.releasedNgn, 0);

  const acceptApp = (a: SponsorApplication) => {
    if (slotsLeft(live) <= 0) return toast.error(tr('All places are filled'), { description: tr('Close the brief or add places before accepting more.') });
    if (update((l) => accept(l, live.id, a.id))) toast.success(tr('{name} accepted', { name: a.creatorName }), { description: tr('{amount} held (test mode) — fee plus marketplace fee. It’s paid out as you approve each deliverable.', { amount: formatNgn(a.rateNgn + brandFee(a.rateNgn)) }) });
  };

  const sendChanges = (a: SponsorApplication, dId: string) => {
    if (note.trim().length < 5) return toast.error(tr('Say what needs changing'));
    if (update((l) => requestChanges(l, live.id, a.id, dId, note))) {
      toast(tr('Changes asked'), { description: tr('{name} can send a new link.', { name: a.creatorName }) });
      setAsking(null);
      setNote('');
    }
  };

  return (
    <Sheet
      open={!!brief}
      onClose={onClose}
      side="right"
      size="lg"
      bodyClassName="px-5 py-6"
      title={live.title}
      description={tr('Applied: {n} · Chosen: {chosen} of {total}', { n: live.applications.length, chosen: working.length, total: live.slots })}
      footer={
        <div className="flex w-full justify-between gap-2">
          {live.status === 'open' || live.status === 'closed' ? (
            <Button
              variant="tertiary"
              onClick={() => update((l) => l.map((b) => (b.id === live.id ? { ...b, status: b.status === 'open' ? 'closed' : 'open' } : b))) && toast(live.status === 'open' ? tr('Brief closed to new applications') : tr('Brief reopened'))}
            >
              {live.status === 'open' ? tr('Close to applications') : tr('Reopen')}
            </Button>
          ) : (
            <span />
          )}
          <Button variant="secondary" onClick={onClose}>
            {tr('Done')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        {live.status === 'review' && (
          <InlineAlert tone="info" title={tr('KUBICU is checking this brief')}>
            {tr('Creators can see it once it’s approved — usually within a day. We check it’s labelled as paid, the product is allowed and the budget is real.')}
          </InlineAlert>
        )}
        {live.status === 'rejected' && (
          <InlineAlert tone="danger" title={tr('This brief wasn’t approved')}>
            {live.reviewNote ? `“${live.reviewNote}” ` : ''}
            {tr('Make the changes and send it again. Nothing was charged.')}
            {onFix && (
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => onFix(live)}>
                {tr('Fix and send again')}
              </Button>
            )}
          </InlineAlert>
        )}
        {working.length > 0 && <p className="text-label text-fg-muted">{tr('Paid out: {paid} · Still held for work not yet approved: {held}', { paid: formatNgn(paid), held: formatNgn(held) })}</p>}

        <section aria-labelledby="mb-working">
          <h3 id="mb-working" className="text-heading font-semibold text-fg">
            {tr('Working with you')}
          </h3>
          {working.length === 0 ? (
            <p className="mt-2 text-label text-fg-muted">{tr('Accept a creator below to start.')}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-6">
              {working.map((a) => {
                const r = trackedResults(live, a);
                return (
                  <li key={a.id} className="border-t border-line pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="min-w-0 text-label font-semibold text-fg">
                        {a.creatorName} <span className="font-normal text-fg-muted">· {a.handle}</span>
                      </p>
                      {a.status === 'completed' ? <Badge tone="success">Completed</Badge> : <Badge tone="info">{tr('Held: {amount}', { amount: formatNgn(a.heldNgn) })}</Badge>}
                    </div>
                    <p className="mt-0.5 text-caption text-fg-subtle">
                      {a.trackingCode && (
                        <a href={trackedPath(a.trackingCode)} target="_blank" rel="noreferrer" className="font-mono text-action hover:underline">
                          kub.icu{trackedPath(a.trackingCode)}
                        </a>
                      )}{' '}
                      · {tr('Visitors: {visits} · Taps: {clicks} · Sales: {sales} so far', { visits: r.visits, clicks: r.clicks, sales: r.sales })}
                    </p>
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                      {a.deliverables.map((d) => (
                        <li key={d.id} className="flex flex-col gap-2 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-label text-fg">{d.label}</span>
                            <DeliverableStatusBadge status={d.status} />
                          </div>
                          {d.link && (
                            <a href={d.link} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-caption text-action hover:underline">
                              <span className="truncate">{d.link}</span> <ExternalLinkIcon size={12} className="shrink-0" aria-hidden />
                            </a>
                          )}
                          {d.status === 'submitted' &&
                            !disputeOpen(a) &&
                            (asking === d.id ? (
                              <div className="flex items-end gap-2">
                                <div className="min-w-0 flex-1">
                                  <TextInput id={`mb-note-${d.id}`} label={tr('What needs changing?')} value={note} onChange={(e) => setNote(e.target.value)} />
                                </div>
                                <Button variant="secondary" onClick={() => sendChanges(a, d.id)}>
                                  {tr('Send')}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={() => update((l) => approve(l, live.id, a.id, d.id)) && toast.success(tr('Approved'), { description: tr('{name}’s share for this is released (test mode).', { name: a.creatorName }) })}>
                                  {tr('Approve and pay')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="tertiary"
                                  onClick={() => {
                                    setAsking(d.id);
                                    setNote('');
                                  }}
                                >
                                  {tr('Ask for changes')}
                                </Button>
                              </div>
                            ))}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-col">
                      <DisputePanel brief={live} app={a} side="brand" update={update} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="mb-applied">
          <h3 id="mb-applied" className="text-heading font-semibold text-fg">
            {tr('Applications')}
          </h3>
          {waiting.length === 0 ? (
            <p className="mt-2 text-label text-fg-muted">{tr('No new applications.')}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {waiting.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="min-w-0 text-label font-semibold text-fg">
                      {a.creatorName} <span className="font-normal text-fg-muted">· {a.handle} · {a.audience}</span>
                    </p>
                    <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(a.rateNgn)}</span>
                  </div>
                  <p className="text-label text-fg-muted">{a.pitch}</p>
                  <CreatorRecordLine briefs={briefs} creatorWorkspaceId={a.creatorWorkspaceId} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => acceptApp(a)}>
                      {tr('Accept')}
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => update((l) => setAppStatus(l, live.id, a.id, 'declined')) && toast(tr('{name} declined', { name: a.creatorName }))}>
                      {tr('Decline')}
                    </Button>
                    <span className="text-caption text-fg-subtle">{tr('Applied {when}', { when: formatRelative(a.appliedAt) })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Sheet>
  );
}
