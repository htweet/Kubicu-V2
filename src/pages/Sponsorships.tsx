import React, { useMemo, useState } from 'react';
import { MegaphoneIcon, PlusIcon } from 'lucide-react';
import type { SponsorBrief } from '../types/sponsorship';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useT } from '../contexts/LocaleContext';
import { useSponsorships } from '../hooks/useSponsorships';
import { isOpen, platformLabels, slotsLeft, sponsorCategories } from '../utils/sponsorships';
import { formatNgn } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Segmented';
import { SelectInput } from '../components/ui/SelectInput';
import { EmptyState } from '../components/ui/EmptyState';
import { SampleTag } from '../components/commerce/StatusBadges';
import { BriefSheet } from '../components/sponsorships/BriefSheet';
import { PostBriefSheet } from '../components/sponsorships/PostBriefSheet';
import { ManageBriefSheet } from '../components/sponsorships/ManageBriefSheet';

type Tab = 'find' | 'applied' | 'mine';
const shortDate = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** Sponsorships (D441): brands post briefs, creators apply, payment is held until each piece of work is approved. */
export function Sponsorships() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const { briefs } = useSponsorships();
  const [tab, setTab] = useState<Tab>('find');
  const [category, setCategory] = useState('all');
  const [viewing, setViewing] = useState<SponsorBrief | null>(null);
  const [managing, setManaging] = useState<SponsorBrief | null>(null);
  const [posting, setPosting] = useState(false);
  const [fixing, setFixing] = useState<SponsorBrief | null>(null);

  const find = useMemo(() => briefs.filter((b) => b.brandWorkspaceId !== current.id && isOpen(b) && (category === 'all' || b.category === category)), [briefs, current.id, category]);
  const applied = useMemo(() => briefs.filter((b) => b.applications.some((a) => a.creatorWorkspaceId === current.id && a.status !== 'withdrawn')), [briefs, current.id]);
  const mine = useMemo(() => briefs.filter((b) => b.brandWorkspaceId === current.id), [briefs, current.id]);
  const toReview = mine.reduce((s, b) => s + b.applications.filter((a) => a.status === 'applied').length + b.applications.reduce((x, a) => x + a.deliverables.filter((d) => d.status === 'submitted').length, 0), 0);

  const postButton = (
    <Button leadingIcon={PlusIcon} onClick={() => setPosting(true)}>
      {tr('Post a brief')}
    </Button>
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={tr('Sponsorships')} description={tr('Brands post paid briefs; creators apply with an idea and a fee. The fee is held when a creator is chosen and paid out as each piece of work is approved.')} actions={postButton} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-full overflow-x-auto overflow-y-hidden pb-px">
          <Segmented<Tab>
            ariaLabel={tr('Sponsorships')}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'find', label: `${tr('Find work')} · ${find.length}` },
              { value: 'applied', label: `${tr('Applied')} · ${applied.length}` },
              { value: 'mine', label: toReview ? `${tr('Your briefs')} · ${tr('To review: {n}', { n: toReview })}` : `${tr('Your briefs')} · ${mine.length}` },
            ]}
          />
        </div>
        {tab === 'find' && (
          <div className="sm:w-56">
            <SelectInput id="sp-cat" label={tr('Category')} value={category} onChange={setCategory} options={[{ value: 'all', label: tr('All categories') }, ...sponsorCategories.map((c) => ({ value: c, label: tr(c) }))]} />
          </div>
        )}
      </div>

      {tab === 'find' &&
        (find.length === 0 ? (
          <EmptyState framed className="mt-6" icon={MegaphoneIcon} title={tr('No open briefs here')} description={tr('New briefs from brands show up here. Try another category, or check back soon.')} />
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {find.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => setViewing(b)} className={`${rowClass} flex-col gap-1 sm:flex-row sm:items-center sm:gap-6`}>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-label font-semibold text-fg">{b.title}</span>
                      {b.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-muted">
                      {b.brandName} · {b.platforms.map((p) => tr(platformLabels[p])).join(', ')} · {b.deliverables.join(' + ')}
                    </span>
                  </span>
                  <span className="shrink-0 sm:text-right">
                    <span className="block text-label font-semibold tabular-nums text-fg">{formatNgn(b.budgetNgn)}</span>
                    <span className="block text-caption text-fg-subtle">{tr('Places left: {n} · apply by {date}', { n: slotsLeft(b), date: shortDate(b.applyBy) })}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}

      {tab === 'applied' &&
        (applied.length === 0 ? (
          <EmptyState framed className="mt-6" icon={MegaphoneIcon} title={tr('You haven’t applied yet')} description={tr('Open a brief in Find work and send your idea and fee.')} />
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {applied.map((b) => {
              const a = b.applications.find((x) => x.creatorWorkspaceId === current.id && x.status !== 'withdrawn');
              if (!a) return null;
              const toDo = a.deliverables.filter((d) => d.status === 'todo' || d.status === 'changes').length;
              return (
                <li key={b.id}>
                  <button type="button" onClick={() => setViewing(b)} className={`${rowClass} items-center gap-4`}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-semibold text-fg">{b.title}</span>
                      <span className="block truncate text-caption text-fg-muted">
                        {b.brandName} · {tr('your fee {amount}', { amount: formatNgn(a.rateNgn) })}
                        {a.releasedNgn ? ` · ${tr('{amount} paid', { amount: formatNgn(a.releasedNgn) })}` : ''}
                      </span>
                    </span>
                    <Badge className="shrink-0" tone={a.status === 'declined' ? 'neutral' : a.status === 'applied' ? 'info' : toDo ? 'warning' : 'success'}>
                      {a.status === 'applied' ? tr('Waiting') : a.status === 'declined' ? tr('Not this time') : a.status === 'completed' ? tr('Completed') : toDo ? tr('To deliver: {n}', { n: toDo }) : tr('With the brand')}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        ))}

      {tab === 'mine' &&
        (mine.length === 0 ? (
          <EmptyState framed className="mt-6" icon={MegaphoneIcon} title={tr('No briefs yet')} description={tr('Post a brief to find creators for a launch, a sale or an event. You pay only for work you approve.')} action={postButton} />
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {mine.map((b) => {
              const newApps = b.applications.filter((a) => a.status === 'applied').length;
              const toApprove = b.applications.reduce((x, a) => x + a.deliverables.filter((d) => d.status === 'submitted').length, 0);
              return (
                <li key={b.id}>
                  <button type="button" onClick={() => setManaging(b)} className={`${rowClass} items-center gap-4`}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-semibold text-fg">{b.title}</span>
                      <span className="block truncate text-caption text-fg-muted">
                        {tr('{amount} per creator', { amount: formatNgn(b.budgetNgn) })} · {tr('Chosen: {n} of {total}', { n: b.slots - slotsLeft(b), total: b.slots })} · {b.status === 'open' ? tr('apply by {date}', { date: shortDate(b.applyBy) }) : b.status === 'review' ? tr('KUBICU is checking it') : b.status === 'rejected' ? tr('not approved') : tr('closed')}
                      </span>
                    </span>
                    {newApps + toApprove > 0 ? (
                      <Badge tone="action" className="shrink-0">
                        {[newApps ? tr('New: {n}', { n: newApps }) : '', toApprove ? tr('To approve: {n}', { n: toApprove }) : ''].filter(Boolean).join(' · ')}
                      </Badge>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}

      <p className="mt-6 text-caption text-fg-subtle">{tr('Test mode: money is shown as held and paid but doesn’t move, and results for tracked links are simulated. Sponsored posts must be labelled as paid partnerships.')}</p>

      <BriefSheet brief={viewing} onClose={() => setViewing(null)} />
      <ManageBriefSheet
        brief={managing}
        onClose={() => setManaging(null)}
        onFix={(b) => {
          setManaging(null);
          setFixing(b);
        }}
      />
      <PostBriefSheet
        open={posting || !!fixing}
        edit={fixing}
        onClose={() => {
          setPosting(false);
          setFixing(null);
          setTab('mine');
        }}
      />
    </div>
  );
}

/** List rows bleed 8px either side so their text lines up with the page header while the hover fill has room. */
const rowClass = '-mx-2 flex w-[calc(100%+1rem)] rounded-md px-2 py-4 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';
