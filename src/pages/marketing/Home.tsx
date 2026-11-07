import React from 'react';
import { CalendarCheckIcon, ShoppingBagIcon, TicketIcon, UsersIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { HomeHero } from '../../components/marketing/home/HomeHero';
import { ColourBand } from '../../components/marketing/home/ColourBand';
import { CanvasVisual } from '../../components/marketing/home/CanvasVisual';
import { ShareVisual } from '../../components/marketing/home/ShareVisual';
import { SellVisual } from '../../components/marketing/home/SellVisual';
import { InsightsVisual } from '../../components/marketing/home/InsightsVisual';
import { PeopleSection } from '../../components/marketing/home/PeopleSection';
import { LocalSection } from '../../components/marketing/home/LocalSection';
import { ExampleMarquee } from '../../components/marketing/home/ExampleMarquee';
import { StatusFaqSection } from '../../components/marketing/home/StatusFaqSection';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';

const sellList = [
  { icon: ShoppingBagIcon, text: 'Products, stock, checkout and discounts' },
  { icon: CalendarCheckIcon, text: 'Bookings with deposits and reschedule links' },
  { icon: TicketIcon, text: 'Event tickets with QR check-in at the door' },
  { icon: UsersIcon, text: 'Group buys and campaign pages with real progress' },
];

/** Website home (D260): colour-blocked chapters, each answering one question a new seller has. Top chapters translated in D318. */
export function Home() {
  const { t: tr } = useT();
  return (
    <>
      <HomeHero />

      <ColourBand
        id="canvas-heading"
        bg="rgb(var(--kb-cobalt))"
        fg="rgb(255 255 255)"
        title={tr('Make it yours in minutes.')}
        lead={tr('Start from a layout built for your goal, then arrange blocks on a real canvas. Edit text in place, pick a theme, and a publish check catches broken links before anyone sees them.')}
        cta={{ label: tr('Start building — free'), to: '/signup', bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' }}
        visual={<CanvasVisual />}
        flip
      />

      <ColourBand
        id="share-heading"
        bg="rgb(var(--kb-pink))"
        fg="rgb(var(--kb-plum))"
        title={tr('Share it everywhere they already are.')}
        lead={tr('Put your kub.icu link in your WhatsApp status and Instagram bio, or print the QR code on your stall, flyers and receipts. Every visit lands on one page that’s ready to sell.')}
        cta={{ label: tr('Claim your link'), to: '/signup', bg: 'rgb(var(--kb-plum))', fg: 'rgb(255 255 255)' }}
        visual={<ShareVisual />}
      />

      <ColourBand
        id="sell-heading"
        bg="rgb(var(--kb-peach))"
        fg="rgb(var(--kb-clay))"
        title={tr('Sell anything and get paid.')}
        lead={tr('Grow from a link-in-bio into a shop for whatever you sell: products, services, tickets or downloads, all without changing tools. Every order shows exactly what you receive.')}
        visual={<SellVisual />}
        flip
      >
        <ul className="mt-8 flex flex-col gap-3">
          {sellList.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[16px] font-semibold">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--kb-clay))] text-[rgb(var(--kb-peach))]">
                <Icon size={18} aria-hidden />
              </span>
              {tr(text)}
            </li>
          ))}
        </ul>
      </ColourBand>

      <ColourBand
        id="insights-heading"
        bg="rgb(var(--kb-forest))"
        fg="rgb(var(--kb-lime))"
        title={tr('See what’s working.')}
        lead={tr('Visits, where they came from and where people drop off — with plain suggestions that show their evidence. No personal data, and your own visits can be left out.')}
        cta={{ label: tr('See plans'), to: '/pricing', bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' }}
        visual={<InsightsVisual />}
      />

      <PeopleSection />
      <LocalSection />
      <ExampleMarquee />
      <StatusFaqSection />
      <ClosingCta />
    </>
  );
}
