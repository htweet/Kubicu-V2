import React from 'react';
import { ClockIcon, EyeIcon } from 'lucide-react';
import type { ListingStatus } from '../../../utils/marketplaceListings';

/** Shown only when a listing is not simply available — "Available" on every card would be noise (D268). */
export function ListingStatusLabel({ status }: {status: ListingStatus;}) {
  if (status === 'planned')
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-[12px] font-semibold text-fg-muted">
        <ClockIcon size={12} aria-hidden /> Planned
      </span>);

  if (status === 'preview')
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-[12px] font-semibold text-fg-muted">
        <EyeIcon size={12} aria-hidden /> Preview
      </span>);

  return null;
}