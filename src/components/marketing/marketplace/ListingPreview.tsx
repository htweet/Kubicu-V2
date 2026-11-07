import React from 'react';
import type { Listing } from '../../../utils/marketplaceListings';
import { listingKindById } from '../../../data/marketplaceKinds';
import { signatureTheme } from '../../../data/signatureThemes';
import { findExampleById } from '../../../data/examples';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { ExtensionIcon } from '../../extensions/ExtensionIcon';
import { kitPhotos } from '../../../data/kitPhotos';
import { kitTemplateFor } from '../../../data/businessKits';
import { countryForLanguage } from '../../../utils/country';
import { useT } from '../../../contexts/LocaleContext';

const reference = findExampleById('elite-signature-creator') ?? findExampleById('adaeze-atelier');

/**
 * The visual half of a listing card (D268). Templates and themes show a real miniature page; everything
 * else shows its icon on its kind's colour, with what's inside as a short stack. Industry kits show an
 * illustrative photo of the trade with their real starter page on top (D279).
 */
export function ListingPreview({ listing, size = 'card' }: { listing: Listing; size?: 'card' | 'hero' }) {
  const { lang } = useT();
  const tone = listingKindById[listing.kind].tone;
  const hero = size === 'hero';
  const thumbW = hero ? 200 : 120;
  const thumbH = hero ? 360 : 190;

  // Industry kits (D279): a photo of the kind of business, with the kit's real starter page in a phone on top.
  if (listing.kit) {
    const photo = kitPhotos[listing.kit.id];
    const starter = findExampleById(kitTemplateFor(listing.kit, countryForLanguage(lang)));
    return (
      <div aria-hidden className="relative h-full overflow-hidden" style={{ backgroundColor: tone.bg }}>
        {photo && <img src={photo.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
        {starter && (
          <div className={hero ? 'absolute bottom-0 right-6' : 'absolute bottom-0 right-4'}>
            <div className="overflow-hidden rounded-t-[16px] border-[4px] border-b-0 border-[rgb(18_18_20)] bg-[rgb(18_18_20)] shadow-3">
              <TemplateThumb doc={starter.doc} width={hero ? 150 : 86} height={hero ? 230 : 128} />
            </div>
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-semibold text-white">Illustration</span>
      </div>
    );
  }

  if (listing.example || (listing.theme && reference)) {
    const doc = listing.example ? listing.example.doc : { ...reference!.doc, theme: signatureTheme(listing.theme!) };
    return (
      <div aria-hidden className="flex h-full items-end justify-center overflow-hidden pt-5" style={{ backgroundColor: tone.bg }}>
        <div className="overflow-hidden rounded-t-[18px] border-[4px] border-b-0 border-[rgb(18_18_20)] bg-[rgb(18_18_20)] shadow-3">
          <TemplateThumb doc={doc} width={thumbW} height={thumbH} />
        </div>
      </div>
    );
  }

  const Icon = listing.icon;
  return (
    <div aria-hidden className="flex h-full min-w-0 flex-col justify-between overflow-hidden p-5" style={{ backgroundColor: tone.bg, color: tone.fg }}>
      {listing.ext ? (
        <span className="w-fit rounded-xl bg-white p-1 shadow-1">
          <ExtensionIcon ext={listing.ext} size={hero ? 'lg' : 'md'} />
        </span>
      ) : (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-[rgb(20_20_18)] shadow-1">
          <Icon size={21} strokeWidth={2.1} />
        </span>
      )}
      {listing.inside.length > 0 && (
        <ul className="mt-4 flex min-w-0 flex-col gap-1.5">
          {listing.inside.slice(0, hero ? 6 : 3).map((x) => (
            <li key={x} className="truncate rounded-lg px-2.5 py-1.5 text-[12px] font-semibold" style={{ backgroundColor: 'rgb(255 255 255 / 0.16)' }}>
              {x}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
