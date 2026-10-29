import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, Link2Icon, PuzzleIcon, UserRoundIcon, UsersIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { cn } from '../../utils/cn';

export type PillarId = 'creators' | 'marketplace' | 'links' | 'audience';

const pillars: {id: PillarId;title: string;text: string;to: string;icon: typeof Link2Icon;bg: string;fg: string;}[] = [
{ id: 'creators', title: 'Creator pages', text: 'One page for your links, work, products and enquiries.', to: '/for/creators', icon: UserRoundIcon, bg: 'rgb(var(--kb-pink))', fg: 'rgb(var(--kb-plum))' },
{ id: 'links', title: 'Short links & QR', text: 'A trackable link for every post, poster and ad.', to: '/tools/short-links', icon: Link2Icon, bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' },
{ id: 'audience', title: 'Audience Manager', text: 'Everyone who signs up, books or buys — with consent.', to: '/features/audience-manager', icon: UsersIcon, bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))' },
{ id: 'marketplace', title: 'Marketplace', text: 'Apps, templates, themes and kits that plug in.', to: '/marketplace', icon: PuzzleIcon, bg: 'rgb(var(--kb-cobalt))', fg: '#ffffff' }];


/**
 * "Works together" strip (D268): the other three pillars, in journey order — a page, a link to share it,
 * the people it brings in, and what you plug in.
 */
export function PillarCrossLinks({ current, title = 'Works together' }: {current?: PillarId;title?: string;}) {
  const shown = pillars.filter((p) => p.id !== current);
  return (
    <section aria-labelledby="pillars-h" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
      <SectionHeading id="pillars-h" title={title} lead="One page, one set of contacts, one set of numbers — so each part makes the others more useful." />
      <ul className={cn('mt-10 grid gap-4', shown.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
        {shown.map((p) =>
        <li key={p.id}>
            <Link
            to={p.to}
            style={{ backgroundColor: p.bg, color: p.fg }}
            className="group flex h-full min-h-[220px] flex-col rounded-[28px] p-6 transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
            
              <p.icon size={26} strokeWidth={2.1} aria-hidden />
              <h3 className="kb-display mt-auto pt-10 text-[28px] leading-[1.02]">{p.title}</h3>
              <p className="mt-2 text-[15px] font-medium leading-snug opacity-90">{p.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold">
                Explore <ArrowRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        )}
      </ul>
    </section>);

}