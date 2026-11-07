import React, { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheckIcon, StarIcon } from 'lucide-react';
import type { TemplateListing, TemplateStore } from '../../types/templateListing';
import { activeSale, averageStars, canRefundSale, REFUND_DAYS } from '../../utils/templateListings';
import { uid } from '../../utils/id';
import { formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { cn } from '../../utils/cn';

interface Props {
  listing: TemplateListing;
  store: TemplateStore;
  update: (fn: (s: TemplateStore) => TemplateStore) => boolean;
  workspaceId: string;
  workspaceName: string;
  canBuy: boolean;
}

export const licenceLabels = { standard: 'Use in your own workspace', extended: 'Use for your own and client workspaces' };

/** Creator credit, licence, ratings and reviews, plus refund within the window (D70). */
export function CreatorListingInfo({ listing, store, update, workspaceId, workspaceName, canBuy }: Props) {
  const sale = activeSale(store, listing.id, workspaceId);
  const mine = listing.workspaceId === workspaceId;
  const reviewed = listing.reviews.some((r) => r.workspaceId === workspaceId);
  const avg = averageStars(listing);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [confirmRefund, setConfirmRefund] = useState(false);
  const canReview = (!!sale || (listing.priceNgn === 0 && !mine)) && !reviewed;

  return (
    <section aria-label="About this creator template" className="flex flex-col gap-4 border-t border-line pt-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label">
        <span className="flex items-center gap-1.5 font-medium text-fg">
          <BadgeCheckIcon size={15} className="text-action" aria-hidden /> By {listing.creatorName}
        </span>
        <span className="text-fg-muted">Reviewed by KUBICU · v{listing.listedVersion}</span>
        {avg !== null && (
          <span className="flex items-center gap-1 text-fg-muted">
            <StarIcon size={14} className="fill-current text-warning" aria-hidden /> {avg} ({listing.reviews.length})
          </span>
        )}
      </div>
      <p className="text-caption text-fg-muted">Licence: {licenceLabels[listing.licence]}. Never resell the template itself.</p>

      {mine && <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">This is your template. Manage it under My templates.</p>}

      {sale && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-sunken px-3 py-2.5">
          <p className="text-caption text-fg-muted">
            You bought v{sale.version} on {formatTimestamp(sale.at)}. Applying uses that version{listing.listedVersion > sale.version ? ` — the creator has since released v${listing.listedVersion}` : ''}.
          </p>
          {canRefundSale(sale) &&
            canBuy &&
            (confirmRefund ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (update((s) => ({ ...s, sales: s.sales.map((x) => (x.id === sale.id ? { ...x, refundedAt: new Date().toISOString() } : x)) })))
                    toast.success('Refunded (test mode)', { description: 'The licence is removed and the creator’s share is reversed. Pages you already built keep their layout.' });
                  setConfirmRefund(false);
                }}
              >
                Confirm refund
              </Button>
            ) : (
              <Button size="sm" variant="tertiary" onClick={() => setConfirmRefund(true)}>
                Refund (within {REFUND_DAYS} days)
              </Button>
            ))}
        </div>
      )}

      <div>
        <h3 className="text-label font-semibold text-fg">Reviews</h3>
        {listing.reviews.length === 0 ? (
          <p className="mt-1 text-caption text-fg-muted">No reviews yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-line">
            {listing.reviews.map((r) => (
              <li key={r.id} className="py-2.5">
                <p className="flex items-center gap-2 text-label font-medium text-fg">
                  <span aria-label={`${r.stars} out of 5 stars`} className="flex text-warning">
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon key={i} size={12} className={cn(i < r.stars ? 'fill-current' : 'text-line-strong')} aria-hidden />
                    ))}
                  </span>
                  {r.buyerName}
                </p>
                <p className="mt-0.5 text-caption text-fg-muted">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
        {canReview && (
          <form
            className="mt-3 flex flex-col gap-3 rounded-md border border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              if (update((s) => ({ ...s, listings: s.listings.map((l) => (l.id === listing.id ? { ...l, reviews: [{ id: uid('trv'), workspaceId, buyerName: workspaceName, stars, text: text.trim(), at: new Date().toISOString() }, ...l.reviews] } : l)) })))
                toast.success('Thanks — your review is posted', { description: 'Reviews are checked by KUBICU and can be removed if they break the rules.' });
              setText('');
            }}
          >
            <fieldset className="flex items-center gap-1">
              <legend className="mb-1 text-label font-medium text-fg">Your rating</legend>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} star${n === 1 ? '' : 's'}`} aria-pressed={stars === n} onClick={() => setStars(n)} className="flex h-9 w-9 items-center justify-center rounded-md text-warning hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <StarIcon size={18} className={n <= stars ? 'fill-current' : 'text-line-strong'} aria-hidden />
                </button>
              ))}
            </fieldset>
            <TextArea id={`review-${listing.id}`} label="Review" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="What worked, what didn’t" />
            <Button size="sm" type="submit" disabled={!text.trim()} className="self-start">
              Post review
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
