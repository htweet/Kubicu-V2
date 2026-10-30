import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, HistoryIcon, QrCodeIcon } from 'lucide-react';
import { PillarHero } from '../../components/marketing/PillarHero';
import { ShortLinkDemo } from '../../components/marketing/shortlinks/ShortLinkDemo';
import { LinkStatsSample } from '../../components/marketing/shortlinks/LinkStatsSample';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { Reveal } from '../../components/marketing/Reveal';
import { FaqList } from '../../components/marketing/FaqList';
import { PillarCrossLinks } from '../../components/marketing/PillarCrossLinks';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';
import { useT } from '../../contexts/LocaleContext';

const uses = [
{ place: 'WhatsApp status', link: 'kub.icu/bisikitchen/s/menu-wa', learn: 'How many people opened your menu from status' },
{ place: 'Instagram bio', link: 'kub.icu/bisikitchen/s/ig', learn: 'Taps from your bio, separate from story links' },
{ place: 'TikTok video', link: 'kub.icu/bisikitchen/s/jollof-tt', learn: 'Which video sent people to order' },
{ place: 'Stall poster (QR)', link: 'kub.icu/bisikitchen/s/stall', learn: 'Scans at the stall, counted apart from taps' },
{ place: 'Packaging sticker', link: 'kub.icu/bisikitchen/s/reorder', learn: 'Repeat orders from people who kept the sticker' },
{ place: 'Paid ad', link: 'kub.icu/bisikitchen/s/dec-ad', learn: 'Visits and orders from the ad, with UTM tags for your ad tool' }];


const statsList = ['Clicks over time, by day', 'Source and campaign tag', 'Phone, tablet or computer', 'Rough region — never an exact location', 'Orders and bookings that followed'];

const history = [
{ when: 'Today', what: 'Christmas menu', who: 'Bisi' },
{ when: '3 Nov', what: 'November menu', who: 'Bisi' },
{ when: '12 Oct', what: 'Main page', who: 'Tunde (Editor)' }];


const safety = [
'Only web addresses (https) — no app links, files or scripts.',
'Addresses inside private networks are refused, so links can’t be used to probe them.',
'A short link can’t point at another short link, so nobody goes in circles.',
'Addresses reported as phishing or scams are blocked, and links can be paused by KUBICU staff.',
'Every change of destination is recorded with who changed it and when.',
'Short names can’t be guessed in bulk: repeated misses are slowed down.'];


const faqs = [
{ q: 'Is it free?', a: 'Short links and QR codes are on every plan. Your own short domain needs a connected custom domain, which starts on Creator.' },
{ q: 'Can I change where a link goes after I’ve printed it?', a: 'Yes. The QR code encodes the short link, not the destination, so you can point it somewhere new without reprinting. The change is recorded in the link’s history.' },
{ q: 'Does a click give me the person’s details?', a: 'No. A click is anonymous: we count it with its source, time, device type and rough region. Someone only becomes a contact when they fill in a form or buy — and they see what they’re agreeing to.' },
{ q: 'What about bots?', a: 'Obvious bots and link-preview fetchers are counted separately from real clicks, and the numbers say when they’re estimates.' },
{ q: 'Can links expire?', a: 'Yes — set an end date and the link sends people to your main page afterwards instead of a dead end. You can also pause a link at any time.' }];


/** /tools/short-links — the public Short Links page (D268). Translated in D324; sample link addresses and names stay as written. */
export function ShortLinksLanding() {
  const { t: tr } = useT();
  return (
    <>
      <PillarHero
        id="sl-hero"
        crumb={[{ label: 'Product', to: '/features' }, { label: 'Short links & QR' }]}
        title="Short links that tell you what worked."
        lead="Turn any long address into a clean link and QR code, label where you shared it, and see which post, poster or ad actually brought people in."
        bg="rgb(var(--kb-lime))"
        fg="rgb(var(--kb-forest))"
        primary={{ label: 'Make real links free', to: '/signup', bg: 'rgb(var(--kb-forest))', fg: 'rgb(var(--kb-lime))' }}
        secondary={{ label: 'See the stats', to: '#stats' }}
        visual={<ShortLinkDemo />} />
      

      <section aria-labelledby="sl-uses" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <SectionHeading
          id="sl-uses"
          title={tr('One link for every place you share')}
          lead={tr('Same destination, a different short link per place — so each one’s numbers stay apart. Example business: Bisi’s Kitchen (fictional).')} />
        
        <Reveal className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">{tr('Example short links by where they’re shared')}</caption>
            <thead>
              <tr className="border-b-2 border-fg text-[13px] font-bold uppercase tracking-[0.06em] text-fg-muted">
                <th scope="col" className="py-3 pr-6">
                  {tr('Shared on')}
                </th>
                <th scope="col" className="py-3 pr-6">
                  {tr('Short link')}
                </th>
                <th scope="col" className="py-3">
                  {tr('What you learn')}
                </th>
              </tr>
            </thead>
            <tbody>
              {uses.map((u) =>
              <tr key={u.place} className="border-b border-line">
                  <th scope="row" className="whitespace-nowrap py-5 pr-6 text-[16px] font-bold text-fg">
                    {tr(u.place)}
                  </th>
                  <td className="whitespace-nowrap py-5 pr-6 font-mono text-[14px] text-fg">{u.link}</td>
                  <td className="py-5 text-[15px] text-fg-muted">{tr(u.learn)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section id="stats" aria-labelledby="sl-stats" className="scroll-mt-28 bg-[rgb(var(--kb-forest))] text-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 id="sl-stats" className="kb-display text-[40px] leading-[1] text-[rgb(var(--kb-lime))] md:text-[56px]">
              {tr('Every click, labelled honestly')}
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/85">
              {tr('Clicks, estimated visitors, QR scans and filtered bot traffic are kept apart — and anything estimated says so. Clicks that lead to an order or booking are credited to the link.')}
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-[15px]">
              {statsList.map((x) =>
              <li key={x} className="flex gap-2.5">
                  <CheckIcon size={18} aria-hidden className="mt-0.5 shrink-0 text-[rgb(var(--kb-lime))]" />
                  {tr(x)}
                </li>
              )}
            </ul>
          </div>
          <LinkStatsSample />
        </div>
      </section>

      <section aria-labelledby="sl-qr" className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            id="sl-qr"
            title={tr('Change the destination. Keep the poster.')}
            lead={tr('Your QR code holds the short link, so when the menu, price list or event page changes, you point the link somewhere new — nothing to reprint.')} />
          
          <Link to="/signup" className="mt-8 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
            {tr('Design your QR code')} <ArrowRightIcon size={16} aria-hidden />
          </Link>
        </div>
        <Reveal>
          <div className="rounded-[28px] bg-raised p-6 shadow-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]">
                <QrCodeIcon size={22} aria-hidden />
              </span>
              <div>
                <p className="text-[16px] font-extrabold text-fg">kub.icu/bisikitchen/s/stall</p>
                <p className="text-[13px] text-fg-muted">{tr('Printed on {n} posters · example', { n: 40 })}</p>
              </div>
            </div>
            <p className="mt-6 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-fg-muted">
              <HistoryIcon size={13} aria-hidden /> {tr('Destination history')}
            </p>
            <ol className="mt-3 flex flex-col">
              {history.map((h, i) =>
              <li key={h.when} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-t border-line py-3 text-[14px]">
                  <span className="text-fg-subtle">{tr(h.when)}</span>
                  <span className="text-fg">
                    <span className="font-bold">{tr(h.what)}</span>
                    {i === 0 && <span className="ml-2 whitespace-nowrap rounded-full bg-[rgb(var(--kb-lime))] px-2 py-0.5 text-[11px] font-bold text-[rgb(var(--kb-forest))]">{tr('Now')}</span>}
                    <span className="block text-[13px] text-fg-muted">{tr('Changed by {name}', { name: tr(h.who) })}</span>
                  </span>
                </li>
              )}
            </ol>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="sl-safe" className="bg-[rgb(var(--kb-sky))]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading id="sl-safe" title={tr('Safe to tap')} lead={tr('Short links hide where they go, so every destination is checked before it’s saved — and again before anyone is sent there.')} />
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {safety.map((s) =>
            <li key={s} className="flex gap-2.5 border-b border-[rgb(var(--kb-cobalt)/0.2)] pb-4 text-[15px] leading-relaxed text-fg">
                <CheckIcon size={18} aria-hidden className="mt-0.5 shrink-0 text-[rgb(var(--kb-cobalt))]" />
                {tr(s)}
              </li>
            )}
          </ul>
        </div>
      </section>

      <PillarCrossLinks current="links" />

      <section aria-labelledby="sl-faq" className="mx-auto w-full max-w-4xl px-5 py-20 md:px-8">
        <SectionHeading id="sl-faq" title={tr('Questions')} align="center" />
        <div className="mt-10">
          <FaqList items={faqs} />
        </div>
        <p className="mt-6 text-center text-[13px] text-fg-subtle">{tr('Prototype: links, clicks and QR scans are recorded on this device only. Phishing screening uses a sample list until a screening service is connected.')}</p>
      </section>

      <ClosingCta title="Every link you share, accounted for." />
    </>);

}