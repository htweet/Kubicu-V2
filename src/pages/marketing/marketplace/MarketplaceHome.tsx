import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { PillarHero } from '../../../components/marketing/PillarHero';
import { MarketplaceHeroVisual } from '../../../components/marketing/marketplace/MarketplaceHeroVisual';
import { MarketplaceBrowser } from '../../../components/marketing/marketplace/MarketplaceBrowser';
import { ListingCard } from '../../../components/marketing/marketplace/ListingCard';
import { SectionHeading } from '../../../components/marketing/SectionHeading';
import { Reveal } from '../../../components/marketing/Reveal';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { useT } from '../../../contexts/LocaleContext';
import { listingKinds } from '../../../data/marketplaceKinds';
import { allListings } from '../../../utils/marketplaceListings';

const journey = [
{ title: 'Find it', text: 'Search by the job you need done — “bookings”, “email”, “ads” — or browse a category.' },
{ title: 'Look inside', text: 'See what it adds, which parts of KUBICU it works with, and a real preview.' },
{ title: 'Check permissions', text: 'Exactly what it can read or change, listed before anything is installed.' },
{ title: 'Check your plan', text: 'If it needs a higher plan or a bigger role, you’re told here — not after paying.' },
{ title: 'Install and set up', text: 'In your workspace: confirm, pay if it’s paid (test mode), and fill in any setup.' },
{ title: 'Manage', text: 'Pause, update, roll back or uninstall. What it created is listed so removal is clean.' }];


const rules = [
'Every extension connects to at least two parts of KUBICU — or it isn’t listed.',
'No extension gets access to every workspace or your whole audience by default.',
'Ratings appear only when real customers can leave them. There are none yet.',
'Anything planned or preview-only says so on its card.'];


/**
 * Public Marketplace (D268): everything you can add to KUBICU — not the place your customers shop.
 * D333: the page, the seven kinds and the journey are translated; listing cards and the browser are translated separately.
 */
export function MarketplaceHome() {
  const { t: tr } = useT();
  const market = useMarketplace();
  const listings = allListings();
  const picks = listings.filter((l) => l.ext?.staffPick).slice(0, 4);
  const featured = picks.length >= 4 ? picks : [...picks, ...listings.filter((l) => l.kind === 'apps' && !l.ext?.staffPick)].slice(0, 4);

  return (
    <>
      <PillarHero
        id="mp-hero"
        crumb={[{ label: 'Marketplace' }]}
        title="Add exactly what your business needs."
        lead="Apps, templates, themes, ready-made sections, automation recipes and industry kits — each one shows what it does, what it touches and what it costs before you add it."
        bg="rgb(var(--kb-cobalt))"
        fg="#ffffff"
        primary={{ label: 'Browse everything', to: '#browse', bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' }}
        secondary={{ label: 'Apps & integrations', to: '/marketplace/apps' }}
        visual={<MarketplaceHeroVisual />} />
      

      <section aria-labelledby="mp-kinds" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <SectionHeading id="mp-kinds" title={tr('Seven kinds of add-on')} lead={tr('Each kind changes something different, so each one says what it changes.')} />
        <ul className="mt-10 flex flex-col border-t border-line">
          {listingKinds.map((k, i) => {
            const count = listings.filter((l) => l.kind === k.id).length;
            const to = k.id === 'apps' ? '/marketplace/apps' : `/marketplace/categories/${k.id}`;
            return (
              <Reveal key={k.id} delay={Math.min(i * 0.04, 0.2)}>
                <li className="border-b border-line">
                  <Link
                    to={to}
                    className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl px-2 py-5 transition-colors duration-150 hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:grid-cols-[56px_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:gap-6 md:px-4">
                    
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl md:h-14 md:w-14" style={{ backgroundColor: k.tone.bg, color: k.tone.fg }}>
                      <k.icon size={22} strokeWidth={2.1} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[18px] font-extrabold text-fg md:text-[20px]">{tr(k.label)}</span>
                      <span className="block text-[14px] text-fg-muted md:hidden">{tr(k.description)}</span>
                    </span>
                    <span className="hidden text-[15px] leading-snug text-fg-muted md:block">{tr(k.description)}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap text-[14px] font-bold text-fg">
                      <span className="tabular-nums">{k.id === 'ai' ? tr('Planned') : count}</span>
                      <ArrowRightIcon size={18} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              </Reveal>);

          })}
        </ul>
      </section>

      <section aria-labelledby="mp-picks" className="bg-[rgb(var(--kb-sky))]">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <SectionHeading
            id="mp-picks"
            title={tr('Picked by the KUBICU team')}
            lead={tr('Chosen because they connect deeply to how small businesses here sell — not because anyone paid to be here.')}
            action={
            <Link to="/marketplace/apps" className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
                {tr('All apps')} <ArrowRightIcon size={16} aria-hidden />
              </Link>
            } />
          
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((l) =>
            <ListingCard key={l.slug} listing={l} installed={!!l.ext && market.isActive(l.ext.id)} />
            )}
          </ul>
        </div>
      </section>

      <section aria-labelledby="mp-journey" className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="mp-journey" title={tr('From finding it to managing it')} lead={tr('The same six steps for every app, so nothing surprises you after you click Install.')} />
        </div>
        <ol className="flex flex-col">
          {journey.map((s, i) =>
          <li key={s.title} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-t border-line py-6 last:border-b">
              <span className="kb-display text-[32px] leading-none text-[rgb(var(--kb-cobalt))]">{i + 1}</span>
              <div>
                <h3 className="text-[19px] font-extrabold text-fg">{tr(s.title)}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-fg-muted">{tr(s.text)}</p>
              </div>
            </li>
          )}
        </ol>
      </section>

      <section id="browse" aria-labelledby="mp-browse" className="scroll-mt-28 border-t border-line">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <SectionHeading id="mp-browse" title={tr('Browse everything')} />
          <div className="mt-8">
            <MarketplaceBrowser label={tr('Marketplace results')} />
          </div>
        </div>
      </section>

      <section aria-labelledby="mp-rules" className="bg-[rgb(var(--kb-forest))] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-2">
          <div>
            <h2 id="mp-rules" className="kb-display text-[40px] leading-[1] text-[rgb(var(--kb-lime))] md:text-[56px]">
              {tr('The rules every listing follows')}
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/85">{tr('This Marketplace adds to KUBICU itself. The products you sell to your own customers live in Commerce, on your own page.')}</p>
            <Link to="/developers" className="mt-7 inline-flex items-center gap-2 rounded-sm text-[15px] font-bold text-[rgb(var(--kb-lime))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-lime))]">
              {tr('Build for KUBICU')} <ArrowRightIcon size={16} aria-hidden />
            </Link>
          </div>
          <ul className="flex flex-col gap-4">
            {rules.map((r) =>
            <li key={r} className="flex gap-3 border-b border-white/15 pb-4 text-[16px] leading-relaxed">
                <CheckIcon size={20} aria-hidden className="mt-0.5 shrink-0 text-[rgb(var(--kb-lime))]" />
                {tr(r)}
              </li>
            )}
          </ul>
        </div>
      </section>
    </>);

}