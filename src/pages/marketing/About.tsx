import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { Button } from '../../components/ui/Button';
import { useT } from '../../contexts/LocaleContext';

const beliefs = [
{ title: 'Phones first', text: 'Most of our sellers and their customers are on a phone, often on a slow connection. Everything is designed for that first.' },
{ title: 'Honest by default', text: 'No invented counts, reviews or urgency. If something isn’t ready, we say so.' },
{ title: 'Grow without switching', text: 'Start with one link. Add a shop, bookings, tickets and a team in the same place, when you need them.' }];


const story = [
'Most sales here start in a chat. Sellers juggle a bio link, a spreadsheet of orders, bank alerts and a notebook of bookings. Website builders are built for a different market, priced in dollars and heavy on data.',
'KUBICU brings it into one place: a page you design on a real canvas, with orders, bookings, tickets and customers behind it — priced in naira, light on data and honest about what it does.'];


/** /about/about. Translated in D331. */
export function About() {
  const { t: tr } = useT();
  const navigate = useNavigate();
  return (
    <>
      <InfoHero crumb="Company" title="About KUBICU" intro="We’re building the simplest way for African creators and small businesses — in Nigeria, Kenya, Ghana, South Africa and beyond — to sell, book and grow from one link." />
      <section aria-labelledby="story-h" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SectionHeading
          id="story-h"
          title={
          <>
              {tr('Why we')} <span className="nm-text">{tr('started')}</span>
            </>
          } />
        
        <div className="flex flex-col gap-5 text-body leading-relaxed text-fg-muted">
          {story.map((p) =>
          <p key={p}>{tr(p)}</p>
          )}
        </div>
      </section>
      <section aria-labelledby="beliefs-h" className="border-y border-line bg-raised/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <SectionHeading id="beliefs-h" title={tr('What we believe')} />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {beliefs.map((b, i) =>
            <li key={b.title} className="border-t border-line pt-5">
                <span className="nm-text font-display text-[28px] font-semibold">{i + 1}</span>
                <h3 className="mt-2 text-heading font-semibold text-fg">{tr(b.title)}</h3>
                <p className="mt-2 text-label leading-relaxed text-fg-muted">{tr(b.text)}</p>
              </li>
            )}
          </ol>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="max-w-lg text-body text-fg-muted">{tr('KUBICU is a design prototype today. Example businesses on this site are fictional.')}</p>
        <Button variant="brand" trailingIcon={ArrowRightIcon} onClick={() => navigate('/signup')}>
          {tr('Create your page')}
        </Button>
      </section>
    </>);

}