import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { Button } from '../../components/ui/Button';

const steps = [
{ title: 'Tell us about your business', text: 'A few sentences: what you sell or do, who it’s for, and how people reach you.' },
{ title: 'Answer up to four questions', text: 'Only what we can’t work out ourselves — your city, whether you take bookings, how you get paid.' },
{ title: 'Review the draft', text: 'A full page built from templates and your answers, with a “What we assumed” list. Keep all of it, some blocks, or none.' }];


const helpers = [
{ title: 'Rewrite a heading or button', text: 'Shorter, warmer or clearer — three options, your words stay until you pick one.' },
{ title: 'Describe a product', text: 'Written from the product’s real details: name, price, sizes, materials. Nothing added that you didn’t enter.' },
{ title: 'Draft FAQ answers', text: 'From your own settings — delivery areas, booking rules, refund policy — so answers match how you actually work.' },
{ title: 'Suggest the next block', text: 'After a services list, a booking button; after products, delivery and returns. Simple rules, always dismissible.' }];


const never = ['Prices or discounts', 'Reviews, ratings or testimonials', 'Qualifications or awards', 'Delivery promises or guarantees', 'Customer counts or sales figures'];

/** Public /ai page — what KUBICU's AI does and, just as plainly, what it won't (D191). */
export function AiFeatures() {
  const navigate = useNavigate();
  return (
    <>
      <InfoHero crumb="Product" title="AI that drafts, never decides" intro="KUBICU’s AI gets you from a blank page to a first draft in minutes. You review every word before anything goes live." />

      <section aria-labelledby="ai-setup-h" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <SectionHeading id="ai-setup-h" title={<>Page setup from a <span className="nm-text">short brief</span></>} />
          <p className="mt-4 max-w-md text-body leading-relaxed text-fg-muted">Labelled “AI preview” everywhere it appears, so you always know which words came from AI.</p>
          <p className="mt-4 max-w-md text-body leading-relaxed text-fg-muted">
            No account yet?{' '}
            <button type="button" onClick={() => navigate('/copilot')} className="inline-flex items-center gap-1 font-semibold text-fg underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Start with Copilot <ArrowRightIcon size={14} aria-hidden />
            </button>{' '}
            — chat in your browser, see a draft, and sign up only if you like it.
          </p>
        </div>
        <ol className="flex flex-col divide-y divide-line border-y border-line">
          {steps.map((s, i) =>
          <li key={s.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 py-5">
              <span className="nm-text font-display text-[28px] font-semibold leading-none">{i + 1}</span>
              <div>
                <h3 className="text-heading font-semibold text-fg">{s.title}</h3>
                <p className="mt-1 text-label leading-relaxed text-fg-muted">{s.text}</p>
              </div>
            </li>
          )}
        </ol>
      </section>

      <section aria-labelledby="ai-help-h" className="border-y border-line bg-raised/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <SectionHeading id="ai-help-h" title="Help on any block" />
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {helpers.map((h) =>
            <div key={h.title} className="border-t border-line pt-5">
                <h3 className="flex items-center gap-2 text-heading font-semibold text-fg">
                  <SparklesIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden /> {h.title}
                </h3>
                <p className="mt-2 text-label leading-relaxed text-fg-muted">{h.text}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="ai-never-h" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SectionHeading id="ai-never-h" title={<>What it will <span className="nm-text">never</span> invent</>} />
        <div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {never.map((n) =>
            <li key={n} className="border-b border-line pb-3 text-body text-fg">
                {n}
              </li>
            )}
          </ul>
          <p className="mt-6 text-label leading-relaxed text-fg-muted">Where your page needs one of these, the draft leaves a clearly marked gap like “[Add your price]”. The page can’t be published until you fill it in.</p>
        </div>
      </section>

      <section aria-labelledby="ai-plans-h" className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
          <div>
            <h2 id="ai-plans-h" className="text-heading font-semibold text-fg">AI credits</h2>
            <p className="mt-2 text-label leading-relaxed text-fg-muted">Every plan includes monthly AI credits, with more on higher plans. A meter in the app shows what’s left; when you run out, everything you’ve drafted stays.</p>
          </div>
          <div>
            <h2 className="text-heading font-semibold text-fg">Coming later</h2>
            <p className="mt-2 text-label leading-relaxed text-fg-muted">A FAQ assistant that answers visitors from your own information, and building a page by voice. Both are planned and not available yet.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-5 pb-16 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="max-w-lg text-body text-fg-muted">KUBICU is a design prototype today. AI drafting here is rule-based and runs without an AI provider.</p>
        <Button variant="brand" trailingIcon={ArrowRightIcon} onClick={() => navigate('/signup')}>
          Try it on your page
        </Button>
      </section>
    </>);

}