import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, ExternalLinkIcon, LockIcon } from 'lucide-react';
import type { SponsorBrief } from '../../types/sponsorship';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { useSponsorships } from '../../hooks/useSponsorships';
import { isOpen, newApplication, platformLabels, setAppStatus, slotsLeft, submitDeliverable, trackedPath, trackedResults } from '../../utils/sponsorships';
import { formatNgn } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { CurrencyInput } from '../ui/CurrencyInput';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';
import { DisputePanel } from './DisputePanel';
import { disputeOpen } from '../../utils/sponsorships';

const statusLabel = { applied: 'Waiting for the brand', accepted: 'Accepted', declined: 'Not this time', withdrawn: 'Withdrawn', completed: 'Completed' } as const;

/** A brief as a creator sees it: details, apply, then deliver and get paid (D441). */
export function BriefSheet({ brief, onClose }: {brief: SponsorBrief | null;onClose: () => void;}) {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const { briefs, update } = useSponsorships();
  const live = brief ? briefs.find((b) => b.id === brief.id) ?? brief : null;
  const mine = live?.applications.find((a) => a.creatorWorkspaceId === current.id && a.status !== 'withdrawn');
  const [handle, setHandle] = useState('');
  const [audience, setAudience] = useState('');
  const [pitch, setPitch] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!brief) return;
    setHandle('');
    setAudience('');
    setPitch('');
    setRate(brief.budgetNgn);
    setLinks({});
    setTried(false);
  }, [brief]);

  if (!live) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const errs = {
    handle: handle.trim().length < 2 ? tr('Where can the brand see your work?') : undefined,
    audience: audience.trim().length < 3 ? tr('e.g. 18k followers, mostly Lagos, 18–30') : undefined,
    pitch: pitch.trim().length < 30 ? tr('A few lines on your idea (30 characters or more)') : undefined,
    rate: !rate || rate < 5_000 ? tr('At least 5,000') : undefined
  };

  const apply = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean)) return;
    const ok = update((list) => list.map((b) => b.id !== live.id ? b : { ...b, applications: [...b.applications, newApplication(b, { creatorWorkspaceId: current.id, creatorName: current.name, handle: handle.trim(), audience: audience.trim(), pitch: pitch.trim(), rateNgn: rate as number })] }));
    if (ok) toast.success(tr('Application sent'), { description: tr('{brand} will reply here. You’re not committed until they accept.', { brand: live.brandName }) });
  };

  const submit = (dId: string) => {
    const link = (links[dId] ?? '').trim();
    if (!/^https?:\/\/\S+\.\S+/.test(link)) return toast.error(tr('Paste the link to the live post'));
    if (mine && update((list) => submitDeliverable(list, live.id, mine.id, dId, link))) toast.success(tr('Sent for approval'), { description: tr('The brand approves it or asks for changes. Approval releases this part of your fee.') });
  };

  const results = mine ? trackedResults(live, mine) : null;

  return (
    <Sheet
      open={!!brief}
      onClose={onClose}
      side="right"
      size="lg"
      bodyClassName="px-5 py-6"
      title={live.title}
      description={`${live.brandName} · ${tr(live.category)}`}
      footer={
      !mine && isOpen(live) ?
      <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {tr('Close')}
            </Button>
            <Button onClick={apply}>{tr('Apply')}</Button>
          </div> :
      undefined
      }>
      
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <p className="text-label text-fg">{live.description}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-label sm:grid-cols-4">
            <div>
              <dt className="text-caption text-fg-subtle">{tr('Budget per creator')}</dt>
              <dd className="font-semibold tabular-nums text-fg">{formatNgn(live.budgetNgn)}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">{tr('Places left')}</dt>
              <dd className="font-semibold tabular-nums text-fg">{tr('{n} of {total}', { n: slotsLeft(live), total: live.slots })}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">{tr('Apply by')}</dt>
              <dd className="font-semibold text-fg">{new Date(live.applyBy).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">{tr('Where')}</dt>
              <dd className="text-fg">{live.platforms.map((p) => tr(platformLabels[p])).join(', ')}</dd>
            </div>
          </dl>
          <div>
            <h3 className="text-caption font-semibold text-fg-subtle">{tr('You deliver')}</h3>
            <ul className="mt-1 list-disc pl-5 text-label text-fg">
              {live.deliverables.map((d) =>
              <li key={d}>{d}</li>
              )}
            </ul>
          </div>
          <p className="flex items-start gap-2 rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
            <LockIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
            {tr('When the brand accepts, your fee is held by KUBICU. Each deliverable they approve releases its share to you. Posts must say they’re a paid partnership.')}
          </p>
        </section>

        {!mine ?
        isOpen(live) ?
        <section aria-labelledby="apply-h" className="flex flex-col gap-4 border-t border-line pt-6">
              <h3 id="apply-h" className="text-heading font-semibold text-fg">
                {tr('Apply')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput id="sp-handle" label={tr('Your handle or page')} placeholder="@yourname" value={handle} error={tried ? errs.handle : undefined} onChange={(e) => setHandle(e.target.value)} />
                <TextInput id="sp-audience" label={tr('Your audience')} placeholder={tr('18k followers, mostly 18–30')} value={audience} error={tried ? errs.audience : undefined} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <TextArea id="sp-pitch" label={tr('Your idea')} rows={4} value={pitch} error={tried ? errs.pitch : undefined} onChange={(e) => setPitch(e.target.value)} />
              <div className="max-w-xs">
                <CurrencyInput id="sp-rate" label={tr('Your fee')} value={rate} hint={tr('The brand’s budget is {amount}.', { amount: formatNgn(live.budgetNgn) })} error={tried ? errs.rate : undefined} onChange={setRate} />
              </div>
            </section> :

        <p className="text-label text-fg-muted">{tr('This brief isn’t taking applications any more.')}</p> :


        <section aria-labelledby="mine-h" className="flex flex-col gap-4 border-t border-line pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="mine-h" className="text-heading font-semibold text-fg">
                {tr('Your application')}
              </h3>
              <Badge tone={mine.status === 'accepted' || mine.status === 'completed' ? 'success' : mine.status === 'declined' ? 'neutral' : 'info'}>{statusLabel[mine.status]}</Badge>
            </div>
            <p className="text-caption text-fg-muted">
              {tr('Fee {amount}', { amount: formatNgn(mine.rateNgn) })}
              {mine.heldNgn || mine.releasedNgn ? ` · ${tr('{paid} paid to you · {held} held', { paid: formatNgn(mine.releasedNgn), held: formatNgn(mine.heldNgn) })}` : ''}
            </p>
            {mine.status === 'applied' &&
          <Button variant="tertiary" className="self-start" onClick={() => update((list) => setAppStatus(list, live.id, mine.id, 'withdrawn')) && toast(tr('Application withdrawn'))}>
                {tr('Withdraw application')}
              </Button>
          }
            {mine.deliverables.length > 0 &&
          <ul className="divide-y divide-line border-y border-line">
                {mine.deliverables.map((d) =>
            <li key={d.id} className="flex flex-col gap-2 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-label font-medium text-fg">{d.label}</span>
                      <DeliverableStatusBadge status={d.status} />
                    </div>
                    {d.note && <p className="text-caption text-warning">{tr('Brand’s note: {note}', { note: d.note })}</p>}
                    {d.link && d.status !== 'changes' &&
              <a href={d.link} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-caption text-action hover:underline">
                        <span className="truncate">{d.link}</span> <ExternalLinkIcon size={12} className="shrink-0" aria-hidden />
                      </a>
              }
                    {(d.status === 'todo' || d.status === 'changes') && !disputeOpen(mine) &&
              <div className="flex items-end gap-2">
                        <div className="min-w-0 flex-1">
                          <TextInput id={`sp-link-${d.id}`} label={tr('Link to the live post')} placeholder="https://" value={links[d.id] ?? ''} onChange={(e) => setLinks({ ...links, [d.id]: e.target.value })} />
                        </div>
                        <Button variant="secondary" onClick={() => submit(d.id)}>
                          {tr('Send')}
                        </Button>
                      </div>
              }
                  </li>
            )}
              </ul>
          }
            {mine.status !== 'applied' && <DisputePanel brief={live} app={mine} side="creator" update={update} />}
            {mine.trackingCode && results &&
          <div className="flex flex-col gap-1">
                <p className="text-caption text-fg-muted">
                  {tr('Share this link in your posts so the brand sees results:')}{' '}
                  <a href={trackedPath(mine.trackingCode)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-action hover:underline">
                    kub.icu{trackedPath(mine.trackingCode)} <ExternalLinkIcon size={12} aria-hidden />
                  </a>
                </p>
                <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
                  <CheckCircle2Icon size={12} aria-hidden /> {tr('Visitors: {visits} · Taps: {clicks} · Sales: {sales} so far', { visits: results.visits, clicks: results.clicks, sales: results.sales })}
                </p>
              </div>
          }
          </section>
        }
      </div>
    </Sheet>);

}