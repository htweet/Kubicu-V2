import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

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
      <div className="nm-fill mt-4 rounded-3xl px-6 py-10 md:px-12 md:py-14">
        <h1 className="max-w-3xl font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-[rgb(16_14_26)] md:text-[52px]">{title}</h1>
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