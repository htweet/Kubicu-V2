import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, FlagIcon, GavelIcon, LifeBuoyIcon, LockIcon, ShieldCheckIcon, ShoppingBagIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { useT } from '../../contexts/LocaleContext';

const pillars = [
  { icon: ShoppingBagIcon, title: 'Safety tips for buyers', text: 'How to shop safely and what to look for in a seller.', to: '/about/safety' },
  { icon: FlagIcon, title: 'Report a page', text: 'Tell us about scams, counterfeits or harmful content.', to: '/about/report' },
  { icon: GavelIcon, title: 'Takedowns and appeals', text: 'What happens after a report, and how to ask us to look again.', to: '/about/takedown' },
  { icon: LockIcon, title: 'Security', text: 'How payments, accounts and data are protected.', to: '/about/security' },
];

const promises = [
  { title: 'Counters are real', text: 'DealRoom progress, “only 6 left” and seat counts only ever use real orders and stock.' },
  { title: 'No invented reviews', text: 'Reviews link to real purchases. AI never writes testimonials, prices or qualifications.' },
  { title: 'Refunds are automatic when promised', text: 'Missed group goals and cancelled events refund every buyer in full.' },
  { title: 'Reporters stay anonymous', text: 'Sellers are never told who reported their page.' },
];

/** /about/trust. Translated in D331. */
export function TrustCentre() {
  const { t: tr } = useT();
  return (
    <>
      <InfoHero crumb="Trust & safety" title="Trust centre" intro="KUBICU is built so buyers can trust the pages they visit and sellers can trust the tools they run their business on. Here’s how." />

      <section aria-labelledby="pillars-h" className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
        <h2 id="pillars-h" className="sr-only">
          {tr('Trust and safety topics')}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <span className="nm-edge block h-full rounded-2xl">
                  <span className="flex h-full items-start gap-4 rounded-[15px] bg-raised p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sunken">
                      <p.icon size={21} strokeWidth={2.2} className="text-[rgb(var(--nm-1))]" aria-hidden />
                    </span>
                    <span className="flex-1">
                      <span className="block text-heading font-semibold text-fg">{tr(p.title)}</span>
                      <span className="mt-1 block text-label leading-relaxed text-fg-muted">{tr(p.text)}</span>
                    </span>
                    <ArrowRightIcon size={18} className="mt-1 shrink-0 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="promises-h" className="border-y border-line bg-raised/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <SectionHeading
            id="promises-h"
            title={
              <>
                {tr('Our')} <span className="nm-text">{tr('honesty rules')}</span>
              </>
            }
            lead={tr('Built into the product, not just written in a policy.')}
          />
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {promises.map((p) => (
              <li key={p.title} className="flex gap-3 border-t border-line py-5">
                <ShieldCheckIcon size={20} strokeWidth={2.2} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <div>
                  <h3 className="text-heading font-semibold text-fg">{tr(p.title)}</h3>
                  <p className="mt-1 text-label leading-relaxed text-fg-muted">{tr(p.text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action: stays open on phones (D562). */}
      <section data-mbar-skip="" className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-start gap-3">
          <LifeBuoyIcon size={20} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <p className="text-label text-fg-muted">
            <span className="font-semibold text-fg">{tr('Lost money?')}</span> {tr('Contact your bank first — they can act faster than we can — then report the page.')}
          </p>
        </div>
        <Link to="/about/report" className="inline-flex items-center gap-1.5 whitespace-nowrap text-label font-semibold text-fg hover:underline">
          {tr('Report a page')} <ArrowRightIcon size={15} aria-hidden />
        </Link>
      </section>
    </>
  );
}
