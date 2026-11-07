import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon, BadgeCheckIcon, CheckIcon, ChevronRightIcon, EyeOffIcon, InfoIcon } from 'lucide-react';
import { InstallPanel } from '../../../components/marketing/marketplace/InstallPanel';
import { ListingPreview } from '../../../components/marketing/marketplace/ListingPreview';
import { ListingCard } from '../../../components/marketing/marketplace/ListingCard';
import { ListingStatusLabel } from '../../../components/marketing/marketplace/ListingStatusLabel';
import { KitShowcase } from '../../../components/marketing/marketplace/KitShowcase';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { useT } from '../../../contexts/LocaleContext';
import { listingKindById } from '../../../data/marketplaceKinds';
import { coreModules } from '../../../data/coreModules';
import { findListingBySlug, relatedListings } from '../../../utils/marketplaceListings';

const publisherLabel = { kubicu: 'Made by KUBICU', partner: 'Reviewed partner', community: 'Reviewed independent developer' } as const;

/**
 * /marketplace/:slug — one listing, everything you need to decide before adding it (D268).
 * D335: the page frame is translated. The listing's own wording (description, contents, permissions, limits, version notes)
 * passes through the translator, so it shows a draft where one already exists and stays as written otherwise.
 */
export function MarketplaceListing() {
  const { t: tr } = useT();
  const { slug = '' } = useParams();
  const market = useMarketplace();
  const listing = findListingBySlug(slug);

  if (!listing)
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center md:px-8">
        <h1 className="kb-display text-[44px] leading-[1] text-fg">{tr('This listing isn’t here')}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">{tr('It may have moved into a core feature, or the link has a typo. Everything currently listed is in the Marketplace.')}</p>
        <Link to="/marketplace" className="mt-8 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
          {tr('Back to Marketplace')} <ArrowRightIcon size={16} aria-hidden />
        </Link>
      </section>
    );

  const kind = listingKindById[listing.kind];
  const related = relatedListings(listing);
  const kindHref = listing.kind === 'apps' ? '/marketplace/apps' : `/marketplace/categories/${listing.kind}`;
  const title = tr(listing.title);

  return (
    <article className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 md:px-8 md:pt-10">
      <nav aria-label={tr('Breadcrumb')} className="flex flex-wrap items-center gap-1 text-[13px] font-semibold text-fg-subtle">
        <Link to="/marketplace" className="rounded-sm hover:text-fg">
          {tr('Marketplace')}
        </Link>
        <ChevronRightIcon size={12} aria-hidden />
        <Link to={kindHref} className="rounded-sm hover:text-fg">
          {tr(kind.label)}
        </Link>
        <ChevronRightIcon size={12} aria-hidden />
        <span aria-current="page" className="text-fg">
          {title}
        </span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <div className="min-w-0">
          <header className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-end">
            <div className="h-[180px] overflow-hidden rounded-[28px] shadow-2 sm:h-[220px] md:h-[300px]">
              <ListingPreview listing={listing} size="hero" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-fg-subtle">
                {tr(kind.label)} · {tr(listing.group)}
              </p>
              <h1 className="kb-display mt-2 text-[34px] leading-[1] text-fg [overflow-wrap:anywhere] sm:text-[40px] md:text-[56px]">{title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-fg-muted">
                <span className="inline-flex items-center gap-1 font-semibold text-fg">
                  {listing.verified === 'kubicu' && <BadgeCheckIcon size={15} aria-hidden className="text-action" />}
                  {listing.publisher}
                </span>
                <span>{tr(publisherLabel[listing.verified])}</span>
                {listing.version && <span>{tr('Version {n}', { n: listing.version })}</span>}
                <ListingStatusLabel status={listing.status} />
              </p>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-fg">{tr(listing.summary)}</p>
            </div>
            {/* Phones and tablets: the price and install action sit right under the title instead of after every section (D565). */}
            <div className="md:col-span-2 lg:hidden">
              <InstallPanel listing={listing} />
            </div>
          </header>

          <div className="mt-12 flex flex-col gap-12">
            <Section id="about" title={tr('About')}>
              <p className="max-w-2xl text-[16px] leading-relaxed text-fg-muted">{tr(listing.description)}</p>
            </Section>

            {listing.kit && <KitShowcase kit={listing.kit} />}

            {listing.inside.length > 0 && !listing.kit && (
              <Section id="inside" title={tr(listing.kind === 'blocks' ? 'Blocks inside' : 'What you get')}>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {listing.inside.map((x) => (
                    <li key={x} className="flex gap-2.5 border-b border-line pb-3 text-[15px] text-fg">
                      <CheckIcon size={17} aria-hidden className="mt-0.5 shrink-0 text-success" />
                      {tr(x)}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section id="access" title={tr('What it can read or change')}>
              {listing.permissions.length === 0 ? (
                <p className="flex max-w-2xl gap-2.5 text-[15px] leading-relaxed text-fg-muted">
                  <EyeOffIcon size={18} aria-hidden className="mt-0.5 shrink-0" />
                  <span>
                    {tr('Nothing beyond the page you use it on.')} {tr(kind.changes)}
                  </span>
                </p>
              ) : (
                <div className="max-w-2xl">
                  <ul className="flex flex-col gap-2">
                    {listing.permissions.map((p) => (
                      <li key={p} className="rounded-2xl bg-raised px-4 py-3 text-[15px] text-fg shadow-1">
                        {tr(p)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
                    {tr('Only in the workspace you install it in — never other workspaces, and never more than listed here. You confirm this list again before installing.')}
                  </p>
                </div>
              )}
            </Section>

            {listing.worksWith.length > 0 && (
              <Section id="works" title={tr('Works with')}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {listing.worksWith.map((w) => (
                    <li key={w.module + w.how} className="flex flex-col rounded-2xl border border-line p-4">
                      <span className="text-[15px] font-bold text-fg">{tr(coreModules[w.module].label)}</span>
                      <span className="mt-0.5 text-[14px] leading-snug text-fg-muted">{tr(w.how)}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {listing.limitations.length > 0 && (
              <Section id="limits" title={tr('Good to know')}>
                <ul className="flex max-w-2xl flex-col gap-3">
                  {listing.limitations.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] leading-relaxed text-fg-muted">
                      <InfoIcon size={17} aria-hidden className="mt-1 shrink-0 text-fg-subtle" />
                      {tr(x)}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {listing.versions && listing.versions.length > 0 && (
              <Section id="changes" title={tr('Version history')}>
                <ol className="flex max-w-2xl flex-col border-l-2 border-line pl-5">
                  {listing.versions.map((v) => (
                    <li key={v.version} className="relative pb-5 last:pb-0">
                      <span aria-hidden className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-fg" />
                      <p className="text-[14px] font-bold text-fg">
                        {v.version} <span className="font-medium text-fg-subtle">· {v.date}</span>
                      </p>
                      <p className="mt-0.5 text-[14px] text-fg-muted">{tr(v.notes)}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <Section id="support" title={tr('Support and terms')}>
              <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">
                {listing.verified === 'kubicu'
                  ? tr('Supported by the KUBICU team through the Help menu in your workspace.')
                  : tr('Supported by {publisher}. KUBICU reviewed it before listing and can pause it if something goes wrong.', { publisher: listing.publisher })}{' '}
                {tr('Reviews and ratings will appear once real customers can leave them.')}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">
                <Link to="/about/terms" className="text-fg underline underline-offset-2">
                  {tr('Terms')}
                </Link>
                <Link to="/about/privacy" className="text-fg underline underline-offset-2">
                  {tr('Privacy')}
                </Link>
                {listing.kind === 'apps' && listing.verified !== 'kubicu' && (
                  <Link to="/about/developer-terms" className="text-fg underline underline-offset-2">
                    {tr('Developer terms')}
                  </Link>
                )}
                <Link to="/about/report" className="text-fg underline underline-offset-2">
                  {tr('Report a problem')}
                </Link>
              </div>
            </Section>
          </div>
        </div>

        <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <InstallPanel listing={listing} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-20 border-t border-line pt-12">
          <h2 id="related" className="kb-display text-[32px] leading-[1.05] text-fg md:text-[40px]">
            {tr('You might also look at')}
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ListingCard key={r.slug} listing={r} installed={!!r.ext && market.isActive(r.ext.id)} />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`l-${id}`}>
      <h2 id={`l-${id}`} className="text-[22px] font-extrabold text-fg">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
