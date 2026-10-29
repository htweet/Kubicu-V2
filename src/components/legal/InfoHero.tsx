import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { KbShape } from '../marketing/home/KbShape';

interface InfoHeroProps {
  crumb: string;
  title: string;
  intro: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Title band for legal, trust and company pages: gradient panel with a dark display title (D78). */
export function InfoHero({ crumb, title, intro, meta, actions }: InfoHeroProps) {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-caption text-fg-subtle">
        <Link to="/" className="hover:text-fg">
          KUBICU
        </Link>
        <ChevronRightIcon size={12} aria-hidden />
        <span>{crumb}</span>
      </nav>
      <div className="nm-fill relative mt-4 overflow-hidden rounded-[36px] px-6 py-12 md:px-12 md:py-16">
        <KbShape kind="asterisk" color="rgb(var(--kb-forest, 18 56 40))" size={72} motion="spin" className="absolute -right-3 -top-3 hidden opacity-90 sm:block" />
        <h1 className="kb-display relative max-w-3xl text-[40px] leading-[0.98] text-[rgb(var(--kb-forest,18_56_40))] md:text-[64px]">{title}</h1>
      </div>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <p className="text-[17px] leading-relaxed text-fg-muted">{intro}</p>
          {meta && <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-subtle">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </header>);

}