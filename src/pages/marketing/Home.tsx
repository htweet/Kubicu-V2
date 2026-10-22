import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, MessageCircleIcon, SignalLowIcon, BanknoteIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { examplePages, findExampleById } from '../../data/examples';
import { capabilityStatus } from '../../data/marketing';

const hero = ['adaeze-atelier', 'mama-put-kitchen', 'studio-nnamdi'].map((id) => findExampleById(id)!);
const strip = ['glow-by-halima', 'afrobeats-brunch', 'lagos-bookshelf', 'kemi-presets', 'fixright-plumbing', 'ife-sounds'].map((id) => findExampleById(id)!);
const mamaPut = findExampleById('mama-put-kitchen')!;

const journey = [
{ title: 'Tell us what you do', text: 'Pick a goal — sell, take bookings, show your work — and start from a layout built for it.' },
{ title: 'Arrange it on the canvas', text: 'Drag blocks, edit text in place, pick a theme. What you see is exactly what visitors get.' },
{ title: 'Publish and share', text: 'A publish check catches broken links first. Then share your kub.icu link on WhatsApp, Instagram or anywhere.' }];


const local = [
{ icon: MessageCircleIcon, title: 'WhatsApp ordering built in', text: 'Order buttons open a chat with the item and price already written, so customers don’t have to type it.' },
{ icon: BanknoteIcon, title: 'Naira first', text: 'Prices are shown in ₦. When a price isn’t set, visitors see “Price on request”, not a made-up number.' },
{ icon: SignalLowIcon, title: 'Light on data', text: 'Photos are resized, maps aren’t embedded, and pages stay readable on slow connections.' }];


export function Home() {
  const navigate = useNavigate();
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-fg md:text-[56px]">
            Your corner of the internet. Your whole business.
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-fg-muted">
            KUBICU turns one link into a page that sells, takes bookings and collects enquiries — designed on a real canvas, made for phones and for how business works in Nigeria.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" trailingIcon={ArrowRightIcon} onClick={() => navigate('/signup')}>
              Create your page — free
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/templates')}>
              See example pages
            </Button>
          </div>
          <p className="mt-4 text-caption text-fg-subtle">No card needed. Your page can be live in a few minutes.</p>
        </div>

        <div className="relative flex items-end justify-center gap-4 sm:gap-5" aria-label="Example KUBICU pages" role="img">
          <div className="hidden translate-y-6 sm:block">
            <TemplateThumb doc={hero[1].doc} width={180} height={370} />
          </div>
          <div className="relative z-10">
            <TemplateThumb doc={hero[0].doc} width={230} height={470} />
          </div>
          <div className="hidden translate-y-10 md:block">
            <TemplateThumb doc={hero[2].doc} width={180} height={370} />
          </div>
          <p className="absolute -bottom-10 left-0 right-0 text-center text-caption text-fg-subtle">Fictional example businesses, rendered live</p>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-line bg-raised">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 id="how-heading" className="max-w-xl font-display text-[30px] font-semibold leading-tight tracking-[-0.022em] text-fg">
            From idea to a page people can act on
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
            {journey.map((step, i) =>
            <li key={step.title} className="relative md:pr-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-label font-semibold text-fg">{i + 1}</span>
                  {i < journey.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-line md:block" />}
                </div>
                <h3 className="mt-4 text-heading font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 max-w-xs text-label leading-relaxed text-fg-muted">{step.text}</p>
              </li>
            )}
          </ol>
        </div>
      </section>

      <section aria-labelledby="local-heading" className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
        <div className="order-2 flex justify-center lg:order-1">
          <TemplateThumb doc={mamaPut.doc} width={260} height={520} />
        </div>
        <div className="order-1 lg:order-2">
          <h2 id="local-heading" className="max-w-lg font-display text-[30px] font-semibold leading-tight tracking-[-0.022em] text-fg">
            Built for how customers actually buy here
          </h2>
          <p className="mt-4 max-w-lg text-body text-fg-muted">
            Most sales still start in a chat. KUBICU makes that chat easier to start and gives you a page you’re proud to send.
          </p>
          <ul className="mt-10 flex flex-col divide-y divide-line border-y border-line">
            {local.map((item) =>
            <li key={item.title} className="flex gap-4 py-5">
                <item.icon size={20} className="mt-0.5 shrink-0 text-action" aria-hidden />
                <div>
                  <h3 className="text-heading font-semibold text-fg">{item.title}</h3>
                  <p className="mt-1 max-w-md text-label leading-relaxed text-fg-muted">{item.text}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section aria-labelledby="examples-heading" className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="examples-heading" className="font-display text-[30px] font-semibold leading-tight tracking-[-0.022em] text-fg">
                One platform, very different pages
              </h2>
              <p className="mt-2 text-label text-fg-muted">Every example is a fictional business. Open one to see the full page, or start from its layout.</p>
            </div>
            <Link to="/templates" className="inline-flex items-center gap-1.5 text-label font-semibold text-action hover:underline">
              All {examplePages.length} templates <ArrowRightIcon size={15} aria-hidden />
            </Link>
          </div>
          <ul className="-mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
            {strip.map((e) =>
            <li key={e.id} className="shrink-0 snap-start">
                <Link to={`/p/${e.doc.handle}`} className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <span className="block transition-transform duration-150 ease-out group-hover:-translate-y-1">
                    <TemplateThumb doc={e.doc} width={160} height={300} />
                  </span>
                  <span className="mt-3 block text-label font-semibold text-fg">{e.category}</span>
                  <span className="block text-caption text-fg-subtle">{e.name}</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section aria-labelledby="status-heading" className="border-t border-line bg-raised">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <h2 id="status-heading" className="font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-fg">
              What’s ready, and what’s coming
            </h2>
            <p className="mt-3 max-w-sm text-label text-fg-muted">We’d rather tell you plainly than let you discover it after signing up.</p>
          </div>
          <table className="w-full text-left text-label">
            <caption className="sr-only">Feature availability</caption>
            <thead>
              <tr className="border-b border-line text-caption text-fg-subtle">
                <th scope="col" className="pb-2 font-medium">Capability</th>
                <th scope="col" className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {capabilityStatus.map((c) =>
              <tr key={c.name} className="border-b border-line">
                  <th scope="row" className="py-3 pr-4 font-medium text-fg">
                    {c.name}
                    <span className="block text-caption font-normal text-fg-subtle">{c.detail}</span>
                  </th>
                  <td className="py-3 text-right">
                    <span className={c.ready ? 'font-semibold text-success' : 'text-fg-muted'}>{c.status}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 text-center md:px-8">
        <h2 className="mx-auto max-w-xl font-display text-[32px] font-semibold leading-tight tracking-[-0.025em] text-fg">Start with one link. Grow into a whole business.</h2>
        <div className="mt-8 flex justify-center">
          <Button size="lg" trailingIcon={ArrowRightIcon} onClick={() => navigate('/signup')}>
            Create your page — free
          </Button>
        </div>
      </section>
    </>);

}