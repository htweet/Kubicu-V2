import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLinkIcon } from 'lucide-react';
import type { DisputeOutcome, SponsorBrief } from '../../types/sponsorship';
import { useSponsorships } from '../../hooks/useSponsorships';
import { appealOpen, decideAppeal, briefRules, decideDispute, disputeOpen, disputeRows, platformLabels, replyDueAt, replyMissed, reviewBrief, SPONSOR_DECIDE_DAYS, SPONSOR_REPLY_HOURS } from '../../utils/sponsorships';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { DeliverableStatusBadge } from '../../components/sponsorships/DeliverableStatusBadge';
import { cn } from '../../utils/cn';

type Row = ReturnType<typeof disputeRows>[number];
type Tab = 'briefs' | 'decide' | 'appeals' | 'decided';
type Tr = (s: string, v?: Record<string, string | number>) => string;
type Side = 'brand' | 'creator';

// English labels are also what the audit log records; the screen shows them translated.
const outcomeLabels: Record<DisputeOutcome, string> = { creator: 'Paid the creator', brand: 'Refunded the brand', split: 'Split half each' };
const DAY = 86_400_000;
const sideName = (t: Tr, s: Side) => t(s === 'brand' ? 'the brand' : 'the creator');

/**
 * Super admin → Sponsorships (D454): check new briefs and decide problems a brand or creator reported on a deal (D453).
 * Follows the console language (D493); what brands and creators wrote, staff notes and audit entries stay as recorded.
 */
export function AdminSponsorships() {
  const { t } = useT();
  const { briefs, update } = useSponsorships();
  const [, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('decide');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const toReview = briefs.filter((b) => b.status === 'review').sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const reviewing = reviewId ? briefs.find((b) => b.id === reviewId) ?? null : null;

  const review = (b: SponsorBrief, approve: boolean, note: string) => {
    if (!update((l) => reviewBrief(l, b.id, approve, note))) return;
    setStore((s) => audit(s, { area: 'sponsorships', action: approve ? 'Approved a sponsorship brief' : 'Didn’t approve a sponsorship brief', target: `${b.brandName} · ${b.title}`, reason: note.trim() || 'Meets the brief rules.' }));
    toast.success(t(approve ? 'Brief approved' : 'Brief not approved'), { description: t(approve ? 'Creators can see and apply to it now.' : 'The brand sees your note.') });
    setReviewId(null);
  };

  const rows = disputeRows(briefs);
  const toDecide = rows.filter((r) => disputeOpen(r.app)).sort((a, b) => Date.parse(a.app.dispute!.openedAt) - Date.parse(b.app.dispute!.openedAt));
  const decided = rows.filter((r) => r.app.dispute?.outcome).sort((a, b) => Date.parse(b.app.dispute!.decidedAt ?? '') - Date.parse(a.app.dispute!.decidedAt ?? ''));
  const late = (r: Row) => disputeOpen(r.app) && Date.now() - Date.parse(r.app.dispute!.openedAt) > SPONSOR_DECIDE_DAYS * DAY;
  const frozen = toDecide.reduce((s, r) => s + r.app.heldNgn, 0);
  const open = openId ? rows.find((r) => r.id === openId) ?? null : null;
  const appeals = rows.filter((r) => appealOpen(r.app)).sort((a, b) => Date.parse(a.app.dispute!.appeal!.at) - Date.parse(b.app.dispute!.appeal!.at));
  const list = tab === 'decide' ? toDecide : tab === 'appeals' ? appeals : decided;

  const decideAppealFor = (r: Row, outcome: DisputeOutcome | 'keep', note: string) => {
    if (!update((l) => decideAppeal(l, r.brief.id, r.app.id, outcome, note, staffActor()))) return;
    setStore((s) => audit(s, { area: 'sponsorships', action: outcome === 'keep' ? 'Kept a sponsorship decision on appeal' : `Changed a sponsorship decision on appeal → ${outcomeLabels[outcome]}`, target: `${r.brief.brandName} → ${r.app.creatorName} · ${r.brief.title}`, reason: note }));
    toast.success(t('Appeal decided'), { description: t('Brand and creator both see your note.') });
    setOpenId(null);
  };

  const columns: DataColumn<Row>[] = [
    {
      key: 'deal',
      header: t('Deal'),
      render: (r) => (
        <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">{r.brief.title}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {r.brief.brandName} → {r.app.creatorName}
          </span>
        </span>
      ),
    },
    { key: 'reason', header: t('Problem'), hideOnMobile: true, render: (r) => <span className="text-fg-muted">{`${t(r.app.dispute!.by === 'brand' ? 'Brand' : 'Creator')}: ${t(r.app.dispute!.reason)}`}</span> },
    {
      key: 'when',
      header: t(tab === 'decide' ? 'Waiting' : 'Decided'),
      hideOnMobile: true,
      sortValue: (r) => Date.parse((tab === 'decide' ? r.app.dispute!.openedAt : r.app.dispute!.decidedAt) ?? ''),
      render: (r) => {
        const at = tab === 'decide' ? r.app.dispute!.openedAt : r.app.dispute!.decidedAt;
        return <span className={late(r) ? 'font-medium text-danger' : 'text-fg-muted'}>{at ? `${formatRelative(at)}${late(r) ? ` · ${t('overdue')}` : ''}` : '—'}</span>;
      },
    },
    {
      key: 'amount',
      header: t(tab === 'decide' ? 'Frozen' : 'Outcome'),
      align: 'right',
      sortValue: (r) => r.app.heldNgn,
      render: (r) => (tab === 'decide' ? <span className="font-semibold tabular-nums text-fg">{formatNgn(r.app.heldNgn)}</span> : <Badge tone="neutral">{t(outcomeLabels[r.app.dispute!.outcome!])}</Badge>),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setOpenId(r.id)}>
          {t(disputeOpen(r.app) ? 'Decide' : appealOpen(r.app) ? 'Decide appeal' : 'View')}
        </Button>
      ),
    },
  ];

  const decide = (r: Row, outcome: DisputeOutcome, note: string) => {
    const amount = r.app.heldNgn;
    if (!update((l) => decideDispute(l, r.brief.id, r.app.id, outcome, note, staffActor()))) {
      toast.error(t('Couldn’t record the decision'), { description: t('Refresh and try again.') });
      return;
    }
    setStore((s) => audit(s, { area: 'sponsorships', action: `${outcomeLabels[outcome]} (${formatNgn(amount)} held)`, target: `${r.brief.brandName} → ${r.app.creatorName} · ${r.brief.title}`, reason: note }));
    toast.success(t('Decision recorded'), { description: t('Brand and creator both see your note word for word.') });
    setOpenId(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={t('Sponsorships')} description={t('Check new briefs before creators see them, and decide problems a brand or creator reported on a deal. Held money is frozen until you decide · Test mode.')} />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label={t('Problems to decide')} value={toDecide.length} hint={`${t('Target: within {days} days', { days: SPONSOR_DECIDE_DAYS })} · ${t('Briefs to check: {n}', { n: toReview.length })}`} />
        <Stat label={t('Overdue')} value={<span className={toDecide.some(late) ? 'text-danger' : undefined}>{toDecide.filter(late).length}</span>} hint={t('Past the decision target')} />
        <Stat label={t('Frozen in open problems')} value={formatNgn(frozen)} hint={t('Deals: {n}', { n: toDecide.length })} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Tabs<Tab>
          idPrefix="admin-sponsor"
          ariaLabel={t('Sponsorship problem queues')}
          value={tab}
          onChange={setTab}
          items={[
            { id: 'briefs', label: t('Briefs to check'), badge: toReview.length || undefined },
            { id: 'decide', label: t('Problems to decide'), badge: toDecide.length || undefined },
            { id: 'appeals', label: t('Appeals'), badge: appeals.length || undefined },
            { id: 'decided', label: t('Decided') },
          ]}
        />
        <div role="tabpanel" id={`admin-sponsor-panel-${tab}`} aria-labelledby={`admin-sponsor-tab-${tab}`}>
          {tab === 'briefs' ? (
            toReview.length === 0 ? (
              <p className="border-y border-line py-6 text-label text-fg-muted">{t('No briefs waiting. New briefs from brands arrive here before creators can see them.')}</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {toReview.map((b) => (
                  <li key={b.id} className="flex items-center gap-4 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-semibold text-fg">{b.title}</span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {[b.brandName, t(b.category), t('{amount} per creator', { amount: formatNgn(b.budgetNgn) }), t('Sent {when}', { when: formatRelative(b.createdAt) })].join(' · ')}
                      </span>
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => setReviewId(b.id)}>
                      {t('Check')}
                    </Button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <DataTable
              caption={t('Sponsorship problems')}
              rows={list}
              columns={columns}
              filterText={(r) => `${r.brief.title} ${r.brief.brandName} ${r.app.creatorName} ${r.app.handle}`}
              filterPlaceholder={t('Search deal, brand or creator')}
              emptyTitle={t(tab === 'decide' ? 'Nothing to decide' : 'No decisions yet')}
              emptyDescription={t('Problems arrive when a brand or creator reports one on a deal with money held.')}
            />
          )}
        </div>
      </div>

      <Sheet open={!!open} onClose={() => setOpenId(null)} side="right" size="lg" bodyClassName="px-5 py-6" title={open ? open.brief.title : t('Problem')} description={open ? `${open.brief.brandName} → ${open.app.creatorName} (${open.app.handle})` : undefined}>
        {open && <ProblemReview row={open} onDecide={decide} onAppeal={decideAppealFor} t={t} />}
      </Sheet>
      <Sheet open={!!reviewing} onClose={() => setReviewId(null)} side="right" size="lg" bodyClassName="px-5 py-6" title={reviewing ? reviewing.title : t('Brief')} description={reviewing ? `${reviewing.brandName} · ${t(reviewing.category)}` : undefined}>
        {reviewing && <BriefReview brief={reviewing} onReview={review} t={t} />}
      </Sheet>
    </div>
  );
}

function BriefReview({ brief, onReview, t }: { brief: SponsorBrief; onReview: (b: SponsorBrief, approve: boolean, note: string) => void; t: Tr }) {
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    setNote('');
    setTried(false);
  }, [brief.id]);
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <p className="rounded-md bg-sunken px-3 py-2.5 text-label text-fg">{brief.description}</p>
        <p className="text-caption text-fg-muted">
          {[
            t('Where: {list}', { list: brief.platforms.map((p) => t(platformLabels[p])).join(', ') }),
            t('Places: {n}', { n: brief.slots }),
            t('Apply by {date}', { date: brief.applyBy }),
            t('{amount} per creator', { amount: formatNgn(brief.budgetNgn) }),
          ].join(' · ')}
        </p>
        <ul className="list-disc pl-5 text-label text-fg">
          {brief.deliverables.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2 border-t border-line pt-6">
        <h3 className="text-label font-semibold text-fg">{t('Check before approving')}</h3>
        <ul className="flex flex-col gap-1.5 text-caption text-fg-muted">
          {briefRules.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden>•</span>
              {t(r)}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <TextArea
          id="sp-brief-note"
          label={t('Note to the brand')}
          optional
          rows={3}
          hint={t('Needed if you don’t approve — say what to change. Shown word for word.')}
          value={note}
          error={tried && note.trim().length < 10 ? t('Say what to change (10 characters or more)') : undefined}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onReview(brief, true, note)}>{t('Approve')}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setTried(true);
              if (note.trim().length >= 10) onReview(brief, false, note);
            }}
          >
            {t('Don’t approve')}
          </Button>
        </div>
      </section>
    </div>
  );
}

function AppealReview({ row, onAppeal, t }: { row: Row; onAppeal: (r: Row, o: DisputeOutcome | 'keep', note: string) => void; t: Tr }) {
  const d = row.app.dispute!;
  const ap = d.appeal!;
  const me = staffActor();
  const sameReviewer = !!d.decidedBy && d.decidedBy === me;
  const [choice, setChoice] = useState<DisputeOutcome | 'keep'>('keep');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const total = (d.toCreatorNgn ?? 0) + (d.toBrandNgn ?? 0);
  const split = (o: DisputeOutcome) =>
    o === 'creator' ? t('{amount} to the creator', { amount: formatNgn(total) }) : o === 'brand' ? t('{amount} back to the brand', { amount: formatNgn(total) }) : t('{amount} each', { amount: formatNgn(Math.round(total / 2)) });
  const options: { id: DisputeOutcome | 'keep'; label: string }[] = [
    { id: 'keep', label: t('Keep “{outcome}”', { outcome: t(outcomeLabels[d.outcome!]) }) },
    ...(Object.keys(outcomeLabels) as DisputeOutcome[]).filter((o) => o !== d.outcome).map((o) => ({ id: o, label: `${t('Change to “{outcome}”', { outcome: t(outcomeLabels[o]) })} · ${split(o)}` })),
  ];

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
      <h4 className="text-label font-semibold text-fg">{`${t('Appeal from {side}', { side: sideName(t, ap.by as Side) })} · ${formatRelative(ap.at)}`}</h4>
      <p className="rounded-md bg-sunken px-3 py-2.5 text-label text-fg">“{ap.reason}”</p>
      {ap.result ? (
        <p className="text-caption text-fg-muted">
          {`${t(ap.result === 'changed' ? 'Changed by {name}' : 'Kept by {name}', { name: ap.decidedBy ?? t('staff') })} · ${ap.decidedAt ? formatTimestamp(ap.decidedAt) : ''}${ap.note ? ` — “${ap.note}”` : ''}`}
        </p>
      ) : sameReviewer ? (
        <p className="text-caption text-warning">{t('You made the first decision, so a different reviewer has to decide the appeal.')}</p>
      ) : (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label font-semibold text-fg">{t('Appeal decision')}</legend>
            {options.map((o) => (
              <label key={o.id} className={cn('flex cursor-pointer items-center gap-3 rounded-md border px-4 py-2.5 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus', choice === o.id ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
                <input type="radio" name="sp-appeal" checked={choice === o.id} onChange={() => setChoice(o.id)} className="h-4 w-4 shrink-0 accent-[rgb(var(--action))] focus:outline-none" />
                <span className="text-label text-fg">{o.label}</span>
              </label>
            ))}
          </fieldset>
          <TextArea id="sp-appeal-note" label={t('Note to both sides')} rows={3} value={note} error={tried && note.trim().length < 10 ? t('Explain the appeal decision (10 characters or more)') : undefined} onChange={(e) => setNote(e.target.value)} />
          <Button
            className="self-start"
            onClick={() => {
              setTried(true);
              if (note.trim().length >= 10) onAppeal(row, choice, note);
            }}
          >
            {t('Record appeal decision')}
          </Button>
        </>
      )}
    </div>
  );
}

function ProblemReview({ row, onDecide, onAppeal, t }: { row: Row; onDecide: (r: Row, o: DisputeOutcome, note: string) => void; onAppeal: (r: Row, o: DisputeOutcome | 'keep', note: string) => void; t: Tr }) {
  const { brief, app } = row;
  const d = app.dispute!;
  const [outcome, setOutcome] = useState<DisputeOutcome>('creator');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    setOutcome('creator');
    setNote('');
    setTried(false);
  }, [row.id]);

  const half = Math.round(app.heldNgn / 2);
  const preview: Record<DisputeOutcome, string> = {
    creator: t('{amount} to the creator', { amount: formatNgn(app.heldNgn) }),
    brand: t('{amount} back to the brand', { amount: formatNgn(app.heldNgn) }),
    split: `${t('{amount} to the creator', { amount: formatNgn(half) })} · ${t('{amount} back to the brand', { amount: formatNgn(app.heldNgn - half) })}`,
  };
  const other = sideName(t, d.by === 'brand' ? 'creator' : 'brand');

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-label font-semibold text-fg">{`${t('Reported by {side}', { side: sideName(t, d.by as Side) })} · ${formatTimestamp(d.openedAt)}`}</h3>
        <p className="text-label text-fg">
          <strong>{t(d.reason)}</strong>
        </p>
        <p className="rounded-md bg-sunken px-3 py-2.5 text-label text-fg">“{d.note}”</p>
        <p className="text-caption text-fg-muted">
          {d.reply
            ? `${t('Reply from {side}:', { side: other })} “${d.reply}”`
            : replyMissed(d)
              ? t('No reply from {side} — the {hours}-hour reply time passed. Decide from what was sent.', { side: other, hours: SPONSOR_REPLY_HOURS })
              : t('No reply from {side} yet — they have until {date}.', { side: other, date: formatTimestamp(replyDueAt(d.openedAt)) })}
        </p>
      </section>

      <section className="flex flex-col gap-2 border-t border-line pt-6">
        <h3 className="text-label font-semibold text-fg">{t('Evidence')}</h3>
        {(d.evidence ?? []).length === 0 ? (
          <p className="text-caption text-fg-muted">{t('Neither side added files.')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {(d.evidence ?? []).map((e) => (
              <li key={e.id} className="text-caption text-fg">
                {e.name} <span className="text-fg-subtle">{`· ${t('from {side}', { side: sideName(t, e.by as Side) })} · ${formatRelative(e.at)}`}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-caption text-fg-subtle">{t('Prototype: file names only — nothing is uploaded.')}</p>
      </section>

      <section className="flex flex-col gap-2 border-t border-line pt-6">
        <h3 className="text-label font-semibold text-fg">{t('The deal')}</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-label sm:grid-cols-4">
          <div>
            <dt className="text-caption text-fg-subtle">{t('Creator’s fee')}</dt>
            <dd className="font-semibold tabular-nums text-fg">{formatNgn(app.rateNgn)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">{t('Already paid')}</dt>
            <dd className="font-semibold tabular-nums text-fg">{formatNgn(app.releasedNgn)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">{t('Held now')}</dt>
            <dd className="font-semibold tabular-nums text-fg">{formatNgn(app.heldNgn)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">{t('Accepted')}</dt>
            <dd className="text-fg">{app.acceptedAt ? formatRelative(app.acceptedAt) : '—'}</dd>
          </div>
        </dl>
        <p className="text-caption text-fg-muted">{brief.description}</p>
        <ul className="mt-1 divide-y divide-line border-y border-line">
          {app.deliverables.map((x) => (
            <li key={x.id} className="flex flex-col gap-1 py-2.5">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-label text-fg">{x.label}</span>
                <DeliverableStatusBadge status={x.status} />
              </span>
              {x.link && (
                <a href={x.link} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-caption text-action hover:underline">
                  <span className="truncate">{x.link}</span> <ExternalLinkIcon size={12} className="shrink-0" aria-hidden />
                </a>
              )}
              {x.note && <span className="text-caption text-fg-muted">{t('Brand’s change request:')} “{x.note}”</span>}
            </li>
          ))}
        </ul>
      </section>

      {d.outcome ? (
        <section className="flex flex-col gap-1 border-t border-line pt-6">
          <h3 className="text-label font-semibold text-fg">{t(outcomeLabels[d.outcome])}</h3>
          <p className="text-caption text-fg-muted">
            {[
              t('{amount} to the creator', { amount: formatNgn(d.toCreatorNgn ?? 0) }),
              t('{amount} back to the brand', { amount: formatNgn(d.toBrandNgn ?? 0) }),
              d.decidedBy ?? t('Staff'),
              d.decidedAt ? formatTimestamp(d.decidedAt) : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {d.decisionNote && <p className="mt-1 rounded-md bg-sunken px-3 py-2.5 text-label text-fg">“{d.decisionNote}”</p>}
          {d.appeal && <AppealReview row={row} onAppeal={onAppeal} t={t} />}
        </section>
      ) : (
        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label font-semibold text-fg">{t('Decision')}</legend>
            {(Object.keys(outcomeLabels) as DisputeOutcome[]).map((o) => (
              <label key={o} className={cn('flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus', outcome === o ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
                <input type="radio" name="sp-outcome" checked={outcome === o} onChange={() => setOutcome(o)} className="h-4 w-4 shrink-0 accent-[rgb(var(--action))] focus:outline-none" />
                <span className="min-w-0 flex-1">
                  <span className="block text-label font-medium text-fg">{t(outcomeLabels[o])}</span>
                  <span className="block text-caption text-fg-muted">{preview[o]}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <TextArea
            id="sp-decision-note"
            label={t('Note to both sides')}
            rows={3}
            hint={t('Shown word for word to the brand and the creator. Say what you looked at and why.')}
            value={note}
            error={tried && note.trim().length < 10 ? t('Explain the decision (10 characters or more)') : undefined}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            className="self-start"
            onClick={() => {
              setTried(true);
              if (note.trim().length >= 10) onDecide(row, outcome, note);
            }}
          >
            {t('Record decision')}
          </Button>
        </section>
      )}
    </div>
  );
}
