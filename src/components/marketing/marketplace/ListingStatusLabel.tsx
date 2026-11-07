import React from 'react';
import { ClockIcon, EyeIcon } from 'lucide-react';
import type { ListingStatus } from '../../../utils/marketplaceListings';
import { useT } from '../../../contexts/LocaleContext';

/** Shown only when a listing is not simply available — "Available" on every card would be noise (D268). Translated in D334. */
export function ListingStatusLabel({ status }: { status: ListingStatus }) {
  const { t: tr } = useT();
  if (status === 'planned')
    return (
      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-sunken px-2 py-0.5 text-[12px] font-semibold text-fg-muted">
        <ClockIcon size={12} aria-hidden /> {tr('Planned')}
      </span>
    );
  if (status === 'preview')
    return (
      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-sunken px-2 py-0.5 text-[12px] font-semibold text-fg-muted">
        <EyeIcon size={12} aria-hidden /> {tr('Preview')}
      </span>
    );
  return null;
}
