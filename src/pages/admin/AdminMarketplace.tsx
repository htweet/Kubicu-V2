import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, EyeOffIcon, InboxIcon, MessageSquareWarningIcon, XIcon } from 'lucide-react';
import type { ListingStatus, TemplateListing } from '../../types/templateListing';
import { PageHeader } from '../../components/shell/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { TextArea } from '../../components/ui/TextArea';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/layout/Card';
import { List } from '../../components/ui/layout/ListRow';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { licenceLabels } from '../../components/templates/CreatorListingInfo';
import { averageStars, creatorShare, listingEvent, useTemplateStore } from '../../utils/templateListings';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Segmented } from '../../components/ui/Segmented';
import { ExtensionReviews } from '../../components/admin/ExtensionReviews';
import { useSubmissions } from '../../utils/extensionSubmissions';

type Tab = 'queue' | 'listed' | 'closed';
type Kind = 'templates' | 'extensions';

const checklist = [
{ id: 'original', label: 'Original work — not a copy of another template or brand' },
{ id: 'readable', label: 'Readable: text contrast and sizes pass on a phone' },
{ id: 'personal', label: 'No personal data, real contacts or photos of people without consent' },
{ id: 'mobile', label: 'Works on a phone: nothing cut off, buttons reachable' }];


const tabStatuses: Record<Tab, ListingStatus[]> = { queue: ['in_review'], listed: ['listed', 'unlisted'], closed: ['changes_requested', 'rejected'] };

/** Super admin → Modules & marketplace: review creator templates before they’re sold (D70). */
export function AdminMarketplace() {
  const [store, update] = useTemplateStore();
  const [tab, setTab] = useState<Tab>('queue');
  const [kind, setKind] = useState<Kind>('templates');
  const [subs] = useSubmissions();
  const extQueue = subs.submissions.filter((s) => s.status === 'in_review' || s.status === 'listed' && s.pending).length;
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const queue = store.listings.filter((l) => l.status === 'in_review' || l.status === 'listed' && l.pendingDoc);
  const rows = tab === 'queue' ? queue : store.listings.filter((l) => tabStatuses[tab].includes(l.status));
  const open = store.listings.find((l) => l.id === openId) ?? null;
  const reviewing = !!open && !!open.pendingDoc;
  const allChecked = checklist.every((c) => checks[c.id]);

  const openListing = (l: TemplateListing) => {
    setOpenId(l.id);
    setChecks({});
    setNote('');
    setTried(false);
  };

  const decide = (kind: 'approve' | 'changes' | 'reject') => {
    if (!open) return;
    if (kind !== 'approve' && note.trim().length < 10) {
      setTried(true);
      return;
    }
    const ok = update((s) => ({
      ...s,
      listings: s.listings.map((l) => {
        if (l.id !== open.id) return l;
        if (kind === 'approve')
        return {
          ...l,
          status: 'listed' as const,
          listedDoc: l.pendingDoc ?? l.listedDoc,
          listedVersion: l.pendingVersion ?? l.listedVersion,
          pendingDoc: null,
          pendingVersion: null,
          reviewNote: null,
          listedAt: l.listedAt ?? new Date().toISOString(),
          events: [listingEvent(`Approved v${l.pendingVersion} and listed`, 'staff'), ...l.events]
        };
        const wasListed = !!l.listedDoc && l.status === 'listed';
        return {
          ...l,
          // An update that isn't approved leaves the listed version on sale.
          status: wasListed ? 'listed' as const : kind === 'changes' ? 'changes_requested' as const : 'rejected' as const,
          pendingDoc: wasListed ? null : l.pendingDoc,
          pendingVersion: wasListed ? null : l.pendingVersion,
          reviewNote: note.trim(),
          events: [listingEvent(`${kind === 'changes' ? 'Changes requested' : 'Not approved'}: ${note.trim()}`, 'staff'), ...l.events]
        };
      })
    }));
    if (ok) {
      toast.success(kind === 'approve' ? `“${open.name}” is listed` : kind === 'changes' ? 'Sent back with your note' : 'Not approved', { description: 'The creator sees the outcome in My templates and in their notifications.' });
      setOpenId(null);
    }
  };

  const unlist = (l: TemplateListing) =>
  update((s) => ({ ...s, listings: s.listings.map((x) => x.id === l.id ? { ...x, status: 'unlisted', reviewNote: 'Unlisted by KUBICU', events: [listingEvent('Unlisted by KUBICU', 'staff'), ...x.events] } : x) })) && toast('Unlisted', { description: 'Buyers keep what they bought.' });

  const sold = (id: string) => store.sales.filter((s) => s.listingId === id && !s.refundedAt);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Modules & marketplace" description="Review creator templates and developer extensions before any workspace can buy or install them." />

      <div className="mt-6">
        <Segmented<Kind> ariaLabel="What to review" value={kind} onChange={setKind} options={[{ value: 'templates', label: 'Templates' }, { value: 'extensions', label: `Extensions${extQueue ? ` (${extQueue})` : ''}` }]} />
      </div>

      {kind === 'extensions' ?
      <div className="mt-6">
          <ExtensionReviews />
        </div> :

      <>
      <div className="mt-6">
        <Tabs<Tab>
            items={[
            { id: 'queue', label: `Review queue (${queue.length})` },
            { id: 'listed', label: 'Listed' },
            { id: 'closed', label: 'Sent back' }]
            }
            value={tab}
            onChange={setTab}
            ariaLabel="Template reviews"
            idPrefix="adm-tpl" />
          
      </div>

      <div className="mt-6" role="tabpanel" id={`adm-tpl-panel-${tab}`} aria-labelledby={`adm-tpl-tab-${tab}`}>
        {rows.length === 0 ?
          <EmptyState icon={InboxIcon} title={tab === 'queue' ? 'Nothing waiting for review' : 'Nothing here'} description={tab === 'queue' ? 'New templates and updates from creators appear here.' : undefined} /> :

          <Card as="div" body="flush">
          <List label="Templates">
            {rows.map((l) => {
                const doc = (tab === 'queue' ? l.pendingDoc : l.listedDoc) ?? l.pendingDoc ?? l.listedDoc;
                const s = sold(l.id);
                return (
                  <li key={l.id}>
                  <button type="button" onClick={() => openListing(l)} className="flex w-full items-center gap-4 px-5 py-3 text-left md:px-6 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <span className="shrink-0 overflow-hidden rounded-[10px] border border-line">{doc && <TemplateThumb doc={doc} width={56} height={86} />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-fg">{l.name}</span>
                        {l.pendingVersion && <Badge tone="info">v{l.pendingVersion}{l.listedVersion ? ' update' : ''}</Badge>}
                        {l.status === 'unlisted' && <Badge tone="neutral">Unlisted</Badge>}
                        {l.status === 'rejected' && <Badge tone="danger">Not approved</Badge>}
                        {l.status === 'changes_requested' && <Badge tone="warning">Changes requested</Badge>}
                        {l.sample && <Badge tone="neutral">Sample</Badge>}
                      </span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {l.kind === 'theme' ? 'Theme · ' : ''}{l.creatorName} · {l.category} · {l.region} · {l.priceNgn ? formatNgn(l.priceNgn) : 'Free'} · submitted {formatTimestamp(l.submittedAt)}
                      </span>
                    </span>
                    {tab === 'listed' && <span className="text-label tabular-nums text-fg-muted">{s.length} sold</span>}
                  </button>
                </li>);

              })}
          </List>
          </Card>
          }
      </div>
      </>
      }

      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        side="right"
        size="lg"
        title={open?.name ?? ''}
        description={open ? `${open.kind === 'theme' ? 'Theme (look only) · ' : ''}${open.creatorName} · ${open.category} · ${open.region}` : undefined}
        footer={
        reviewing ?
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button variant="tertiary" leadingIcon={XIcon} onClick={() => decide('reject')}>
                Don’t approve
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" leadingIcon={MessageSquareWarningIcon} onClick={() => decide('changes')}>
                  Ask for changes
                </Button>
                <Button leadingIcon={CheckIcon} disabled={!allChecked} onClick={() => decide('approve')}>
                  Approve and list
                </Button>
              </div>
            </div> :
        open?.status === 'listed' ?
        <Button variant="secondary" leadingIcon={EyeOffIcon} onClick={() => open && unlist(open)}>
              Unlist
            </Button> :
        undefined
        }>
        
        {open &&
        <div className="flex flex-col gap-6 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {open.listedDoc && open.pendingDoc &&
            <figure className="flex flex-col items-center gap-2">
                  <div className="overflow-hidden rounded-[16px] border border-line">
                    <TemplateThumb doc={open.listedDoc} width={220} height={380} />
                  </div>
                  <figcaption className="text-caption text-fg-muted">On sale now · v{open.listedVersion}</figcaption>
                </figure>
            }
              <figure className="flex flex-col items-center gap-2">
                <div className="overflow-hidden rounded-[16px] border-2 border-action">{(open.pendingDoc ?? open.listedDoc) && <TemplateThumb doc={(open.pendingDoc ?? open.listedDoc)!} width={220} height={380} />}</div>
                <figcaption className="text-caption font-medium text-fg">{open.pendingDoc ? `Submitted · v${open.pendingVersion}` : `Listed · v${open.listedVersion}`}</figcaption>
              </figure>
            </div>

            <dl className="grid gap-3 text-label sm:grid-cols-2">
              <div>
                <dt className="text-caption text-fg-subtle">Price</dt>
                <dd className="text-fg">{open.priceNgn ? `${formatNgn(open.priceNgn)} · creator gets ${formatNgn(creatorShare(open.priceNgn))}` : 'Free'}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Licence</dt>
                <dd className="text-fg">{licenceLabels[open.licence]}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-caption text-fg-subtle">Description</dt>
                <dd className="text-fg">{open.description}</dd>
              </div>
              {open.status === 'listed' &&
            <div>
                  <dt className="text-caption text-fg-subtle">Sales · rating</dt>
                  <dd className="text-fg">
                    {sold(open.id).length} · {averageStars(open) ?? '—'}
                  </dd>
                </div>
            }
            </dl>

            {reviewing &&
          <>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-label font-semibold text-fg">Checklist — all four to approve</legend>
                  {checklist.map((c) =>
              <label key={c.id} className="flex min-h-[40px] cursor-pointer items-start gap-3 text-label text-fg">
                      <input type="checkbox" className="mt-0.5 h-4 w-4" checked={!!checks[c.id]} onChange={(e) => setChecks((x) => ({ ...x, [c.id]: e.target.checked }))} />
                      {c.label}
                    </label>
              )}
                </fieldset>
                <TextArea id="adm-note" label="Note to the creator" optional={false} rows={3} value={note} error={tried && note.trim().length < 10 ? 'Explain what to change (at least 10 characters).' : undefined} hint="Needed to ask for changes or not approve. The creator sees it word for word." onChange={(e) => setNote(e.target.value)} />
              </>
          }

            <section aria-labelledby="adm-tpl-hist">
              <h3 id="adm-tpl-hist" className="text-label font-semibold text-fg">
                History
              </h3>
              <ol className="mt-2 flex flex-col gap-2">
                {open.events.map((e) =>
              <li key={e.id} className="text-caption">
                    <span className="text-fg">{e.label}</span>
                    <span className="block text-fg-subtle">
                      {formatTimestamp(e.at)} · {e.by === 'staff' ? 'KUBICU staff' : open.creatorName}
                    </span>
                  </li>
              )}
              </ol>
            </section>
          </div>
        }
      </Sheet>
    </div>);

}