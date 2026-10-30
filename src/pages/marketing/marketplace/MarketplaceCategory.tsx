import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon, ChevronRightIcon, ClockIcon } from 'lucide-react';
import { MarketplaceBrowser } from '../../../components/marketing/marketplace/MarketplaceBrowser';
import { listingKindById, listingKinds, type ListingKind } from '../../../data/marketplaceKinds';
import { useT } from '../../../contexts/LocaleContext';

/** /marketplace/apps and /marketplace/categories/:category (D268). Translated in D334. */
export function MarketplaceCategory({ fixed }: {fixed?: ListingKind;}) {
  const { t: tr } = useT();
  const { category } = useParams();
  const id = (fixed ?? category) as ListingKind;
  const kind = listingKindById[id];

  if (!kind)
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center md:px-8">
        <h1 className="kb-display text-[44px] leading-[1] text-fg">{tr('No such category')}</h1>
        <p className="mt-4 text-[17px] text-fg-muted">{tr('“{name}” isn’t a Marketplace category. These are:', { name: category ?? '' })}</p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {listingKinds.map((k) =>
        <li key={k.id}>
              <Link to={k.id === 'apps' ? '/marketplace/apps' : `/marketplace/categories/${k.id}`} className="inline-flex h-11 items-center whitespace-nowrap rounded-full bg-raised px-5 text-[15px] font-semibold text-fg shadow-1 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {tr(k.label)}
              </Link>
            </li>
        )}
        </ul>
      </section>);


  const label = tr(kind.label);

  return (
    <>
      <header className="relative -mt-[88px] pt-[88px]" style={{ backgroundColor: kind.tone.bg, color: kind.tone.fg }}>
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-14 pt-8 md:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:pb-20 lg:pt-12">
          <div>
            <nav aria-label={tr('Breadcrumb')} className="flex items-center gap-1 text-[13px] font-semibold opacity-80">
              <Link to="/" className="rounded-sm hover:underline">
                KUBICU
              </Link>
              <ChevronRightIcon size={12} aria-hidden />
              <Link to="/marketplace" className="rounded-sm hover:underline">
                {tr('Marketplace')}
              </Link>
              <ChevronRightIcon size={12} aria-hidden />
              <span aria-current="page">{label}</span>
            </nav>
            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-[rgb(20_20_18)]">
                <kind.icon size={26} strokeWidth={2.1} aria-hidden />
              </span>
              <h1 className="kb-display text-[44px] leading-[0.98] md:text-[64px]">{label}</h1>
            </div>
            <p className="mt-5 max-w-xl text-[18px] font-medium leading-relaxed opacity-90">{tr(kind.description)}</p>
          </div>
          <p className="max-w-md rounded-[22px] p-5 text-[15px] font-medium leading-relaxed" style={{ backgroundColor: 'rgb(255 255 255 / 0.14)' }}>
            <span className="block text-[12px] font-bold uppercase tracking-[0.08em] opacity-80">{tr('What it changes')}</span>
            <span className="mt-1.5 block">{tr(kind.changes)}</span>
          </p>
        </div>
      </header>

      <section aria-label={tr('Listings: {kind}', { kind: label })} className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
        {id === 'ai' &&
        <div role="note" className="mb-8 flex gap-3 rounded-[22px] bg-raised p-5 shadow-1">
            <ClockIcon size={20} aria-hidden className="mt-0.5 shrink-0 text-fg-muted" />
            <div>
              <p className="text-[16px] font-bold text-fg">{tr('None of these can be installed yet')}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">
                {tr('AI workflow packs need an AI provider connection that KUBICU doesn’t have yet. Today’s AI drafting is rule-based and built into the canvas.')}{' '}
                <Link to="/ai" className="inline-flex items-center gap-1 font-semibold text-fg underline underline-offset-2">
                  {tr('How KUBICU AI works')} <ArrowRightIcon size={13} aria-hidden />
                </Link>
              </p>
            </div>
          </div>
        }
        <MarketplaceBrowser kind={id} label={tr('Results: {kind}', { kind: label })} />
      </section>
    </>);

}