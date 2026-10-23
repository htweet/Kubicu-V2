import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CalendarCheckIcon, LineChartIcon, ShoppingBagIcon, TicketIcon, UsersIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FaqList } from '../../components/marketing/FaqList';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { HandleClaim } from '../../components/marketing/HandleClaim';
import { examplePages, findExampleById } from '../../data/examples';
import { businessTypes, capabilityStatus, homeFaq, howItWorks, localFeatures } from '../../data/marketing';
import { cn } from '../../utils/cn';

const hero = ['adaeze-atelier', 'mama-put-kitchen', 'studio-nnamdi'].map((id) => findExampleById(id)!);
const strip = ['glow-by-halima', 'afrobeats-brunch', 'lagos-bookshelf', 'kemi-presets', 'fixright-plumbing', 'ife-sounds'].map((id) => findExampleById(id)!);
const mamaPut = findExampleById('mama-put-kitchen')!;
const brunch = findExampleById('afrobeats-brunch')!;

const showcase = [
{ icon: ShoppingBagIcon, title: 'Sell', text: 'Products, stock, checkout, discounts and subscriptions — orders and refunds in one place.' },
{ icon: CalendarCheckIcon, title: 'Book', text: 'Services with availability, deposits and a page for customers to reschedule.' },
{ icon: TicketIcon, title: 'Run events', text: 'Ticket types with seat limits, QR tickets and a check-in screen for the door.' },
{ icon: UsersIcon, title: 'Sell together', text: 'Campaign pages for launches and DealRooms for group buys with real progress.' },
{ icon: LineChartIcon, title: 'See what works', text: 'Visits, sources and drop-off — with suggestions that show their evidence.' }];


export function Home() {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-28 lg:pt-24">
          <div className="max-w-xl">
            <h1 id="hero-heading" className="font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.035em] text-fg md:text-[64px]">
              Your corner of the internet.{' '}
              <span className="nm-text nm-text-drift">Your whole business.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[18px] leading-relaxed text-fg-muted">
              One link that sells, takes bookings, sells tickets and collects enquiries — designed on a real canvas, made for phones and for how business works in Nigeria.
            </p>
            <div className="mt-9">
              <HandleClaim />
            </div>
            <Link
              to="/templates"
              className="mt-5 inline-flex items-center gap-1.5 text-label font-semibold text-fg underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
              Or browse example pages <ArrowRightIcon size={15} aria-hidden />
            </Link>
          </div>

          <figure className="relative">
            <div className="nm-frame nm-glow rounded-[28px]">
              <div className="dot-stage flex items-end justify-center gap-4 overflow-hidden rounded-[27px] px-4 pb-0 pt-10 sm:gap-5" role="img" aria-label="Three example KUBICU pages">
                <div className="hidden translate-y-8 sm:block">
                  <TemplateThumb doc={hero[1].doc} width={170} height={350} />
                </div>
                <div className="relative z-10 translate-y-2">
                  <TemplateThumb doc={hero[0].doc} width={220} height={450} />
                </div>
                <div className="hidden translate-y-12 md:block">
                  <TemplateThumb doc={hero[2].doc} width={170} height={350} />
                </div>
              </div>
            </div>
            <figcaption className="mt-4 text-center text-caption text-fg-subtle">Fictional example businesses, rendered live</figcaption>
          </figure>
        </div>
      </section>

      {/* Business types */}
      <section aria-label="Who KUBICU is for" className="border-y border-line bg-raised/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:gap-8 md:px-8">
          <p className="shrink-0 text-label font-semibold text-fg">Made for</p>
          <ul className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {businessTypes.map((t) =>
            <li key={t} className="shrink-0 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-label text-fg-muted">
                {t}
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading id="how-heading" title="From idea to a page people can act on" lead="Three steps. Most people publish their first page in under ten minutes." />
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
          {howItWorks.map((step, i) =>
          <li key={step.title} className="relative md:pr-10">
              <div className="flex items-center gap-3">
                <span className="nm-fill flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[18px] font-semibold text-[rgb(16_14_26)]">{i + 1}</span>
                {i < howItWorks.length - 1 && <span aria-hidden className="nm-rule hidden flex-1 md:block" />}
              </div>
              <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.01em] text-fg">{step.title}</h3>
              <p className="mt-2 max-w-xs text-body leading-relaxed text-fg-muted">{step.text}</p>
            </li>
          )}
        </ol>
      </section>

      {/* Feature showcase — canvas leads */}
      <section aria-labelledby="features-heading" className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
        <SectionHeading id="features-heading" title={<>One page. <span className="nm-text">Everything behind it.</span></>} lead="Start with a link-in-bio. Grow into a shop, a booking desk and a box office without changing tools." />
        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
          <article className="nm-frame rounded-2xl lg:col-span-2 lg:row-span-2">
            <div className="grid h-full gap-6 rounded-[15px] bg-raised p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end md:p-8">
              <div className="flex h-full flex-col">
                <h3 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg">A real canvas, not a form</h3>
                <p className="mt-3 max-w-sm text-body leading-relaxed text-fg-muted">
                  27 blocks, themes and multi-page sites. Edit text in place, reorder with drag or keyboard, preview as any visitor — and a publish check catches problems first.
                </p>
                <ul className="mt-6 flex flex-col gap-2 text-label text-fg-muted">
                  <li>Version history and scheduled publishing</li>
                  <li>Media library with alt text</li>
                  <li>Show blocks by where visitors came from</li>
                </ul>
                <Link to="/templates" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-label font-semibold text-fg hover:underline">
                  Browse templates <ArrowRightIcon size={15} aria-hidden />
                </Link>
              </div>
              <div className="hidden justify-center sm:flex">
                <TemplateThumb doc={brunch.doc} width={200} height={400} />
              </div>
            </div>
          </article>
          {showcase.slice(0, 2).map((f) =>
          <FeatureCard key={f.title} {...f} />
          )}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {showcase.slice(2).map((f) =>
          <FeatureCard key={f.title} {...f} />
          )}
        </div>
      </section>

      {/* Built for Nigeria */}
      <section aria-labelledby="local-heading" className="border-y border-line bg-raised/60">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
          <div>
            <SectionHeading id="local-heading" title={<>Built for how customers <span className="nm-text">actually buy here</span></>} lead="Most sales still start in a chat. KUBICU makes that chat easier to start and gives you a page you’re proud to send." />
            <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
              {localFeatures.map((item) =>
              <li key={item.title} className="flex gap-4 border-t border-line py-5">
                  <item.icon size={22} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[rgb(var(--nm-1))]" aria-hidden />
                  <div>
                    <h3 className="text-heading font-semibold text-fg">{item.title}</h3>
                    <p className="mt-1 text-label leading-relaxed text-fg-muted">{item.text}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="nm-glow rounded-[24px]">
              <TemplateThumb doc={mamaPut.doc} width={250} height={500} />
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section aria-labelledby="examples-heading" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          id="examples-heading"
          title="One platform, very different pages"
          lead="Every example is a fictional business. Open one to see the full page, or start from its layout."
          action={
          <Link to="/templates" className="inline-flex items-center gap-1.5 text-label font-semibold text-fg hover:underline">
              All {examplePages.length} templates <ArrowRightIcon size={15} aria-hidden />
            </Link>
          } />
        
        <ul className="scroll-quiet -mx-5 mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
          {strip.map((e) =>
          <li key={e.id} className="shrink-0 snap-start">
              <Link to={`/p/${e.doc.handle}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <span className="nm-edge block rounded-[14px]">
                  <span className="block overflow-hidden rounded-[13px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                    <TemplateThumb doc={e.doc} width={160} height={300} />
                  </span>
                </span>
                <span className="mt-3 block text-label font-semibold text-fg">{e.category}</span>
                <span className="block text-caption text-fg-subtle">{e.name}</span>
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* Status */}
      <section aria-labelledby="status-heading" className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div>
            <SectionHeading id="status-heading" title="What’s ready, and what’s coming" lead="We’d rather tell you plainly than let you discover it after signing up." />
            <Link to="/about/roadmap" className="mt-6 inline-flex items-center gap-1.5 text-label font-semibold text-fg hover:underline">
              Full roadmap <ArrowRightIcon size={15} aria-hidden />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-raised">
            <table className="w-full text-left text-label">
              <caption className="sr-only">Feature availability</caption>
              <thead>
                <tr className="border-b border-line text-caption text-fg-subtle">
                  <th scope="col" className="px-5 py-3 font-medium">Capability</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {capabilityStatus.map((c) =>
                <tr key={c.name} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-4 font-medium text-fg">
                      {c.name}
                      <span className="mt-0.5 block text-caption font-normal text-fg-subtle">{c.detail}</span>
                    </th>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className={cn('inline-flex items-center gap-1.5 text-caption font-semibold', c.ready ? 'text-success' : c.status === 'Preview' ? 'text-warning' : 'text-fg-muted')}>
                        <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', c.ready ? 'bg-success' : c.status === 'Preview' ? 'bg-warning' : 'bg-fg-subtle')} />
                        {c.status}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <SectionHeading id="faq-heading" title="Questions, answered" />
          <FaqList items={homeFaq} />
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-heading" className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
        <div className="nm-fill flex flex-col items-start gap-6 rounded-3xl px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
          <h2 id="cta-heading" className="max-w-xl font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-[rgb(16_14_26)] md:text-[38px]">
            Start with one link. Grow into a whole business.
          </h2>
          <Button size="lg" trailingIcon={ArrowRightIcon} className="bg-[rgb(16_14_26)] text-[rgb(243_238_230)] hover:bg-[rgb(30_27_45)]" onClick={() => navigate('/signup')}>
            Create your page — free
          </Button>
        </div>
      </section>
    </>);

}

function FeatureCard({ icon: Icon, title, text }: {icon: typeof ShoppingBagIcon;title: string;text: string;}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-raised p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sunken">
        <Icon size={20} strokeWidth={2.2} className="text-[rgb(var(--nm-1))]" aria-hidden />
      </span>
      <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-fg">{title}</h3>
      <p className="mt-2 text-label leading-relaxed text-fg-muted">{text}</p>
    </article>);

}