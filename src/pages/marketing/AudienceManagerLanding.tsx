import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { PillarHero } from '../../components/marketing/PillarHero';
import { AudienceDashboardSample } from '../../components/marketing/audience/AudienceDashboardSample';
import { AudienceFlow } from '../../components/marketing/audience/AudienceFlow';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { FaqList } from '../../components/marketing/FaqList';
import { PillarCrossLinks } from '../../components/marketing/PillarCrossLinks';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';
import { useT } from '../../contexts/LocaleContext';

const capabilities = [
  { title: 'Every way in, one list', text: 'Forms, newsletter and waitlist blocks, bookings, orders, enquiries and imports all land in the same place — with where they came from.' },
  { title: 'Tags and notes', text: 'Your own tags and custom fields, notes and follow-ups, and who on your team looks after each person.' },
  { title: 'Segments that keep up', text: 'Save a filter like “subscribed, from Instagram, tagged regular”. People join and leave it as they change.' },
  { title: 'Sources you can trust', text: 'See which page, form, short link or QR code brought each person — and how many came from each.' },
  { title: 'Duplicates, reviewed', text: 'Likely duplicates are suggested when phone or email match exactly. You decide — nothing merges on its own.' },
  { title: 'Import and export', text: 'Bring contacts in from a spreadsheet with field matching, and take everyone out as a CSV whenever you like.' },
];

const sources = [
  { from: 'Newsletter & waitlist blocks', becomes: 'Subscribed, with your consent note' },
  { from: 'Enquiry and contact forms', becomes: 'A contact with their message' },
  { from: 'Bookings', becomes: 'A contact for updates about their booking' },
  { from: 'Orders and payment links', becomes: 'A customer, for updates about their order' },
  { from: 'Short links & QR codes', becomes: 'The source on the contact — never a contact on their own' },
  { from: 'Spreadsheet import', becomes: 'Contacts you confirm you’re allowed to contact' },
];

const consentParagraphs = [
  'Each sign-up stores the words the person saw, the version of that note and when they agreed — separately from where they came from.',
  '“Subscribed” means marketing is allowed. “Updates only” means messages about their own order or booking. Unsubscribed people are left out of every send and every sync, automatically.',
  'A click on a short link never counts as permission. Neither does an import, unless you confirm it.',
];

const integrations = [
  { label: 'Email marketing sync', to: '/marketplace/email-sync' },
  { label: 'Google Sheets sync', to: '/marketplace/sheets-sync' },
  { label: 'Automations', to: '/marketplace/automations' },
  { label: 'Forms', to: '/marketplace/forms' },
];

const faqs = [
  { q: 'Who owns the contacts?', a: 'You do. KUBICU stores them for you, never sells or shares them, and you can export or delete them at any time.' },
  { q: 'Can I message everyone I import?', a: 'Only people who agreed to hear from you. Imported contacts are marked “updates only” unless you confirm they subscribed, and anyone who unsubscribes is left out of every send.' },
  { q: 'Does it send emails or WhatsApp messages?', a: 'Automations can, once a messaging partner is connected. Until then, messages are previews — or you sync subscribed contacts to the email tool you already use.' },
  { q: 'Who on my team can see contacts?', a: 'Owners, Admins and Sales manage contacts; other roles can’t change them. Every export is recorded in the workspace activity log with who did it.' },
  { q: 'How long is data kept?', a: 'Until you delete it. When someone asks to be removed, delete their contact — it’s gone from Audience and future exports straight away.' },
];

/** /features/audience-manager — the public Audience Manager page (D268). Translated in D325. */
export function AudienceManagerLanding() {
  const { t: tr } = useT();
  return (
    <>
      <PillarHero
        id="am-hero"
        crumb={[{ label: 'Product', to: '/features' }, { label: 'Audience Manager' }]}
        title="Know the people your page brings in."
        lead="Everyone who signs up, books, buys or asks a question — in one list, with where they came from and what they agreed to."
        bg="rgb(var(--kb-peach))"
        fg="rgb(var(--kb-clay))"
        primary={{ label: 'Start collecting free', to: '/signup', bg: 'rgb(var(--kb-clay))', fg: '#ffffff' }}
        secondary={{ label: 'See how it works', to: '#flow' }}
        visual={<AudienceDashboardSample />}
      />

      <section id="flow" aria-labelledby="am-flow" className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 py-20 md:px-8 md:py-24">
        <SectionHeading id="am-flow" title={tr('From a tap to a contact')} lead={tr('Follow one person from your Instagram bio into your list. Tap a step to see their record change.')} />
        <div className="mt-10">
          <AudienceFlow />
        </div>
      </section>

      <section aria-labelledby="am-caps" className="border-y border-line bg-raised/60">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <SectionHeading id="am-caps" title={tr('Organised without the busywork')} />
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.title} className="border-t-2 border-fg pt-5">
                <h3 className="text-[19px] font-extrabold text-fg">{tr(c.title)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{tr(c.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="am-sources" className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionHeading id="am-sources" title={tr('What becomes a contact — and what doesn’t')} lead={tr('Anonymous visits and clicks stay in Analytics. Someone becomes a contact only when they give you their details.')} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <caption className="sr-only">{tr('Where contacts come from')}</caption>
            <thead>
              <tr className="border-b-2 border-fg text-[13px] font-bold uppercase tracking-[0.06em] text-fg-muted">
                <th scope="col" className="py-3 pr-6">
                  {tr('When someone uses')}
                </th>
                <th scope="col" className="py-3">
                  {tr('They become')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.from} className="border-b border-line">
                  <th scope="row" className="py-4 pr-6 text-[16px] font-bold text-fg">
                    {tr(s.from)}
                  </th>
                  <td className="py-4 text-[15px] text-fg-muted">{tr(s.becomes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="am-consent" className="bg-[rgb(var(--kb-plum))] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-2 lg:items-center">
          <h2 id="am-consent" className="kb-display text-[42px] leading-[0.98] text-[rgb(var(--kb-pink))] md:text-[60px]">
            {tr('Consent isn’t a checkbox you hide.')}
          </h2>
          <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-white/90">
            {consentParagraphs.map((p) => (
              <p key={p}>{tr(p)}</p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="am-connect" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
        <SectionHeading
          id="am-connect"
          title={tr('Plug in the tools you already use')}
          lead={tr('Send subscribed contacts to your email tool, copy new ones into a sheet, or start an automation when someone joins a segment.')}
          action={
            <Link to="/marketplace/apps?q=sync" className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
              {tr('See integrations')} <ArrowRightIcon size={16} aria-hidden />
            </Link>
          }
        />
        <ul className="mt-8 flex flex-wrap gap-3">
          {integrations.map((x) => (
            <li key={x.to}>
              <Link to={x.to} className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-raised px-5 text-[15px] font-semibold text-fg shadow-1 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {tr(x.label)} <ArrowRightIcon size={14} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PillarCrossLinks current="audience" />

      <section aria-labelledby="am-faq" className="mx-auto w-full max-w-4xl px-5 py-20 md:px-8">
        <SectionHeading id="am-faq" title={tr('Questions')} align="center" />
        <div className="mt-10">
          <FaqList items={faqs} />
        </div>
        <p className="mt-6 text-center text-[13px] text-fg-subtle">{tr('Prototype: contacts are stored on this device, and email or WhatsApp sends are previews until a messaging partner is connected.')}</p>
      </section>

      <ClosingCta title="Every sign-up, in one honest list." />
    </>
  );
}
