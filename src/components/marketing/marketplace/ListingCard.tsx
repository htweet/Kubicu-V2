import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon, CheckIcon } from 'lucide-react';
import type { Listing } from '../../../utils/marketplaceListings';
import { listingKindById } from '../../../data/marketplaceKinds';
import { useT } from '../../../contexts/LocaleContext';
import { ListingPreview } from './ListingPreview';
import { ListingStatusLabel } from './ListingStatusLabel';

interface ListingCardProps {
  listing: Listing;
  installed?: boolean;
  /** Show the kind ("Theme", "Template") above the title — on mixed results. */
  showKind?: boolean;
}

/**
 * One Marketplace result (D268). The whole card is one link; footers share a baseline via mt-auto.
 * D334: labels are translated; the listing's group, title, summary and price line pass through the translator, so they
 * show translated wherever a draft already exists (app names and summaries from the app's Extensions screen, template
 * categories, theme descriptions) and in English otherwise.
 */
export function ListingCard({ listing, installed, showKind }: ListingCardProps) {
  const { t: tr } = useT();
  const kind = listingKindById[listing.kind];
  return (
    <li className="h-full">
      <Link
        to={`/marketplace/${listing.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-raised shadow-1 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
        <div className="h-[168px] shrink-0">
          <ListingPreview listing={listing} />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="truncate text-[12px] font-semibold text-fg-subtle">{showKind ? `${tr(kind.label)} · ${tr(listing.group)}` : tr(listing.group)}</p>
          <h3 className="mt-1 flex items-center gap-1.5 text-[17px] font-bold leading-tight text-fg">
            <span className="truncate">{tr(listing.title)}</span>
            {listing.verified === 'kubicu' && <BadgeCheckIcon size={15} className="shrink-0 text-action" aria-label={tr('Made by KUBICU')} />}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-fg-muted">{tr(listing.summary)}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <span className="truncate text-[13px] font-semibold text-fg">{tr(listing.priceLabel)}</span>
            {installed ?
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-success">
                <CheckIcon size={13} aria-hidden /> {tr('Installed')}
              </span> :

            <ListingStatusLabel status={listing.status} />
            }
          </div>
        </div>
      </Link>
    </li>);

}