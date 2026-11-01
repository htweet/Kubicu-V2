import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AwardIcon, BadgeCheckIcon, CopyIcon, HammerIcon, MessageCircleIcon, PlusIcon, StarIcon } from 'lucide-react';
import { certificateCode } from '../utils/proofCertificate';
import { toast } from 'sonner';
import type { WorkItem } from '../types/proof';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan } from '../contexts/TeamContext';
import { useProof } from '../hooks/useProof';
import { useMainLink } from '../hooks/useMainLink';
import { matchedLabel, ratingSummary, shortDay, showable } from '../utils/proof';
import { whatsappLink } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/layout/Card';
import { SampleTag } from '../components/commerce/StatusBadges';
import { MediaImage } from '../components/media/MediaImage';
import { Stars } from '../components/proof/Stars';
import { ReviewRow } from '../components/proof/ReviewRow';
import { WorkEditor } from '../components/proof/WorkEditor';
import { AskReviewDialog, requestLink, requestMessage } from '../components/proof/AskReviewDialog';

type Tab = 'reviews' | 'work';

/** Proof of work (D91): verified reviews from real records and a timeline of delivered work. */
export function Proof() {
  const { current } = useWorkspace();
  const can = useCan('pages.edit');
  const { data, update } = useProof(current.id);
  const { mainHandle } = useMainLink();
  const [tab, setTab] = useState<Tab>('reviews');
  const [asking, setAsking] = useState(false);
  const [editing, setEditing] = useState<WorkItem | 'new' | null>(null);

  if (!data) return null;
  const { count, average } = ratingSummary(data.reviews);
  const shown = data.reviews.filter(showable).length;
  const waiting = data.requests.filter((r) => !r.reviewId);
  const published = data.work.filter((w) => w.published).length;
  const reviews = [...data.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const work = [...data.work].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Proof of work"
        context={current.name}
        description="Reviews that can only come from real orders, bookings and jobs, and a record of the work you’ve delivered. Add a Proof block to show them on your page."
        actions={
        tab === 'reviews' ?
        <Button leadingIcon={StarIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setAsking(true)}>
              Ask for a review
            </Button> :

        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing('new')}>
              Add delivered work
            </Button>

        } />
      

      <section aria-label="Summary" className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">Verified rating</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{count ? average.toFixed(1) : '—'}</span>
            {count > 0 &&
            <span className="text-warning">
                <Stars rating={average} size={16} />
              </span>
            }
          </p>
          <p className="mt-1 text-caption text-fg-subtle">{count ? `From ${count} verified review${count === 1 ? '' : 's'} · hidden ones still count` : 'No reviews yet'}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Waiting for a review</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{waiting.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{shown} review{shown === 1 ? '' : 's'} can show on your page</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Delivered work</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{published}</p>
          <p className="mt-1 text-caption text-fg-subtle">{data.work.length - published} not shown yet</p>
        </div>
      </section>

      <Tabs<Tab>
        idPrefix="proof"
        ariaLabel="Reviews and delivered work"
        value={tab}
        onChange={setTab}
        className="mt-6"
        items={[
        { id: 'reviews', label: 'Reviews', badge: waiting.length || undefined },
        { id: 'work', label: 'Delivered work' }]
        } />
      

      <div role="tabpanel" id={`proof-panel-${tab}`} aria-labelledby={`proof-tab-${tab}`} className="mt-6 flex flex-col gap-6">
        {tab === 'reviews' &&
        <>
            {waiting.length > 0 &&
          <Card title="Waiting for a review" description="Links you’ve sent that haven’t been used yet." body="flush">
                <ul className="divide-y divide-line">
                  {waiting.map((r) => {
                const link = requestLink(mainHandle, r);
                return (
                  <li key={r.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center md:px-6">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-label font-medium text-fg">{r.customerName}</span>
                          <span className="block truncate text-caption text-fg-subtle">
                            {r.source.label} · asked {shortDay(r.createdAt)}
                          </span>
                        </span>
                        <span className="flex shrink-0 gap-2">
                          <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => (void navigator.clipboard?.writeText(link), toast('Link copied'))}>
                            Copy link
                          </Button>
                          {r.phone &&
                      <Button size="sm" variant="tertiary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink(r.phone, requestMessage(current.name, link, r)), '_blank', 'noopener')}>
                              Remind
                            </Button>
                      }
                        </span>
                      </li>);

              })}
                </ul>
              </Card>
          }

            {reviews.length === 0 ?
          <EmptyState icon={BadgeCheckIcon} title="No reviews yet" description="Ask a customer with a completed order, booking or job. Their review is labelled verified because it’s tied to that record." /> :

          <Card title="Reviews" description="You can reply or hide a review with a reason. You can’t change what someone wrote." body="flush">
                <ul className="divide-y divide-line">
                  {reviews.map((r) =>
              <ReviewRow key={r.id} review={r} canEdit={can.allowed} update={update} />
              )}
                </ul>
              </Card>
          }
          </>
        }

        {tab === 'work' && (
        work.length === 0 ?
        <EmptyState icon={HammerIcon} title="No delivered work yet" description="Add jobs you’ve finished, with a photo. Match each to a real order, booking or job so visitors know it happened." /> :

        <ol className="relative flex flex-col gap-6 border-l border-line pl-6">
              {work.map((w) =>
          <li key={w.id} className="relative">
                  <span aria-hidden className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-canvas ${w.published ? 'bg-action' : 'bg-line-strong'}`} />
                  <button type="button" onClick={() => setEditing(w)} className="group flex w-full flex-col gap-3 rounded-lg border border-line bg-raised p-5 text-left transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:flex-row">
                    {w.imageUrl && <MediaImage src={w.imageUrl} alt={w.imageAlt} className="h-28 w-full shrink-0 rounded-md object-cover sm:w-44" />}
                    <span className="min-w-0 flex-1">
                      <span className="text-caption text-fg-subtle">{shortDay(w.date)}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-label font-semibold text-fg">{w.title}</span>
                        {w.sample && <SampleTag />}
                        {!w.published && <Badge tone="neutral">Not shown</Badge>}
                      </span>
                      {w.description && <span className="mt-1 block text-label text-fg-muted">{w.description}</span>}
                      <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-caption text-fg-subtle">
                        {w.source ?
                  <span className="inline-flex items-center gap-1 text-success">
                            <BadgeCheckIcon size={13} aria-hidden /> {matchedLabel[w.source.kind]}
                          </span> :

                  <span>Not matched to a record</span>
                  }
                        {w.clientName && <span>For {w.clientName}</span>}
                      </span>
                    </span>
                  </button>
                  {w.source && w.published && mainHandle &&
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-1 text-caption">
                      <span className="font-mono text-fg-subtle">{certificateCode(w.id)}</span>
                      <Link to={`/p/${mainHandle}/work/${w.id}`} target="_blank" className="inline-flex items-center gap-1 font-medium text-action hover:underline">
                        <AwardIcon size={13} aria-hidden /> Certificate
                      </Link>
                      <button
                type="button"
                className="font-medium text-fg-muted hover:text-fg hover:underline"
                onClick={() => {
                  void navigator.clipboard?.writeText(`${window.location.origin}/p/${mainHandle}/work/${w.id}`);
                  toast('Certificate link copied', { description: 'Send it to a client or a new customer who wants proof.' });
                }}>
                
                        Copy link
                      </button>
                    </div>
            }
                </li>
          )}
            </ol>)
        }
      </div>

      <AskReviewDialog open={asking} data={data} update={update} onClose={() => setAsking(false)} />
      <WorkEditor item={editing} canEdit={can.allowed} update={update} onClose={() => setEditing(null)} />
    </div>);

}