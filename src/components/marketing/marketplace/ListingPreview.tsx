import React from 'react';
import type { Listing } from '../../../utils/marketplaceListings';
import { listingKindById } from '../../../data/marketplaceKinds';
import { signatureTheme } from '../../../data/signatureThemes';
import { findExampleById } from '../../../data/examples';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { ExtensionIcon } from '../../extensions/ExtensionIcon';

const reference = findExampleById('elite-signature-creator') ?? findExampleById('adaeze-atelier');

/**
 * The visual half of a listing card (D268). Templates and themes show a real miniature page; everything
 * else shows its icon on its kind's colour, with what's inside as a short stack — never a stock image.
 */
export function ListingPreview({ listing, size = 'card' }: {listing: Listing;size?: 'card' | 'hero';}) {
  const tone = listingKindById[listing.kind].tone;
  const hero = size === 'hero';
  const thumbW = hero ? 200 : 120;
  const thumbH = hero ? 360 : 190;

  if (listing.example || listing.theme && reference) {
    const doc = listing.example ? listing.example.doc : { ...reference!.doc, theme: signatureTheme(listing.theme!) };
    return (
      <div aria-hidden className="flex h-full items-end justify-center overflow-hidden pt-5" style={{ backgroundColor: tone.bg }}>
        <div className="overflow-hidden rounded-t-[18px] border-[4px] border-b-0 border-[rgb(18_18_20)] bg-[rgb(18_18_20)] shadow-3">
          <TemplateThumb doc={doc} width={thumbW} height={thumbH} />
        </div>
      </div>);

  }

  const Icon = listing.icon;
  return (
    <div aria-hidden className="flex h-full flex-col justify-between p-5" style={{ backgroundColor: tone.bg, color: tone.fg }}>
      {listing.ext ?
      <span className="w-fit rounded-xl bg-white p-1 shadow-1">
          <ExtensionIcon ext={listing.ext} size={hero ? 'lg' : 'md'} />
        </span> :

      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-[rgb(20_20_18)] shadow-1">
          <Icon size={21} strokeWidth={2.1} />
        </span>
      }
      {listing.inside.length > 0 &&
      <ul className="mt-4 flex flex-col gap-1.5">
          {listing.inside.slice(0, hero ? 6 : 3).map((x) =>
        <li key={x} className="truncate rounded-lg px-2.5 py-1.5 text-[12px] font-semibold" style={{ backgroundColor: 'rgb(255 255 255 / 0.16)' }}>
              {x}
            </li>
        )}
        </ul>
      }
    </div>);

}