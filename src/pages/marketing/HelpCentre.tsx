import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BlocksIcon, BriefcaseIcon, CalendarIcon, GlobeIcon, LayoutTemplateIcon, LifeBuoyIcon, LineChartIcon, MessageSquareIcon, PaletteIcon, PuzzleIcon, RepeatIcon, RocketIcon, SearchIcon, ShieldCheckIcon, ShoppingBagIcon, SmartphoneIcon, SparklesIcon, TicketIcon, UserIcon, UsersIcon, WalletIcon, ZapIcon, BoxIcon } from "lucide-react";
import { HelpIcon } from "../../types/help";
import { helpGroups, helpTopics } from "../../data/helpTopics";
import { InfoHero } from "../../components/legal/InfoHero";
import { HelpArticleItem } from "../../components/help/HelpArticleItem";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
const icons: Record<HelpIcon, BoxIcon> = {
  rocket: RocketIcon,
  layout: LayoutTemplateIcon,
  blocks: BlocksIcon,
  palette: PaletteIcon,
  globe: GlobeIcon,
  bag: ShoppingBagIcon,
  wallet: WalletIcon,
  shield: ShieldCheckIcon,
  ticket: TicketIcon,
  calendar: CalendarIcon,
  repeat: RepeatIcon,
  users: UsersIcon,
  chart: LineChartIcon,
  zap: ZapIcon,
  puzzle: PuzzleIcon,
  briefcase: BriefcaseIcon,
  phone: SmartphoneIcon,
  user: UserIcon,
  lifebuoy: LifeBuoyIcon,
  sparkles: SparklesIcon
};

/** Help centre (D113b): a full user guide grouped by job, searchable, with a topic index. */
export function HelpCentre() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = useMemo(() => helpTopics.map((t) => ({
    ...t,
    articles: t.articles.filter((a) => !q || `${a.q} ${a.a} ${a.where ?? ''} ${(a.steps ?? []).join(' ')} ${t.title}`.toLowerCase().includes(q))
  })).filter((t) => t.articles.length > 0), [q]);
  const total = helpTopics.reduce((n, t) => n + t.articles.length, 0);
  const count = results.reduce((n, t) => n + t.articles.length, 0);
  return <>
      <InfoHero crumb="Company" title="Help centre" intro="A guide to everything in KUBICU — from claiming your link to checking guests in at the door. Can’t find it? A person will reply." />
      <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search help</span>
          <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search, e.g. refund, seats, payout, domain" className="h-12 w-full rounded-xl border border-line-strong bg-field pl-11 pr-4 text-body text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
        </label>
        <p className="mt-3 text-caption text-fg-subtle" aria-live="polite">
          {q ? `${count} answer${count === 1 ? '' : 's'}` : `${total} answers across ${helpTopics.length} topics`}
        </p>

        {!q && <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4" aria-label="Topics">
            {helpTopics.map((t) => {
          const Icon = icons[t.icon];
          return <li key={t.id} className="bg-raised">
                  <a href={`#topic-${t.id}`} className="flex h-full flex-col gap-2 p-5 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <Icon size={20} className="text-[rgb(var(--nm-3))]" aria-hidden />
                    <span className="text-label font-semibold text-fg">{t.title}</span>
                    <span className="text-caption leading-relaxed text-fg-muted">{t.summary}</span>
                    <span className="mt-auto pt-1 text-meta text-fg-subtle">{t.articles.length} answers</span>
                  </a>
                </li>;
        })}
          </ul>}

        {results.length === 0 ? <div className="mt-10">
            <EmptyState icon={SearchIcon} title="No answers match" description="Try a different word, or ask us directly." action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>} />
          </div> : <div className="mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="Guide contents" className="hidden lg:block">
              <div className="sticky top-24 flex flex-col gap-5">
                {helpGroups.map((g) => {
              const inGroup = results.filter((t) => t.group === g);
              if (!inGroup.length) return null;
              return <div key={g}>
                      <p className="text-caption font-semibold text-fg-subtle">{g}</p>
                      <ul className="mt-2 flex flex-col gap-1 border-l border-line">
                        {inGroup.map((t) => <li key={t.id}>
                            <a href={`#topic-${t.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-label text-fg-muted hover:border-fg hover:text-fg">
                              {t.title}
                            </a>
                          </li>)}
                      </ul>
                    </div>;
            })}
              </div>
            </nav>

            <div className="flex flex-col gap-14">
              {results.map((t) => {
            const Icon = icons[t.icon];
            return <section key={t.id} id={`topic-${t.id}`} aria-labelledby={`topic-h-${t.id}`} className="scroll-mt-24">
                    <div className="flex items-start gap-3">
                      <Icon size={22} className="mt-1 shrink-0 text-[rgb(var(--nm-3))]" aria-hidden />
                      <div>
                        <p className="text-caption text-fg-subtle">{t.group}</p>
                        <h2 id={`topic-h-${t.id}`} className="font-display text-[22px] font-semibold tracking-[-0.015em] text-fg">
                          {t.title}
                        </h2>
                        <p className="mt-1 text-label text-fg-muted">{t.summary}</p>
                      </div>
                    </div>
                    <ul className="mt-5 divide-y divide-line border-y border-line">
                      {t.articles.map((a) => <HelpArticleItem key={a.id} article={a} open={!!q && count <= 3} />)}
                    </ul>
                  </section>;
          })}
            </div>
          </div>}

        <div className="nm-frame mt-16 rounded-2xl">
          <div className="flex flex-col gap-4 rounded-[15px] bg-raised p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageSquareIcon size={20} className="mt-0.5 shrink-0 text-[rgb(var(--nm-3))]" aria-hidden />
              <div>
                <h2 className="text-heading font-semibold text-fg">Still stuck?</h2>
                <p className="mt-1 text-label text-fg-muted">Signed in? Use Help → Contact support in your workspace for the fastest reply.</p>
              </div>
            </div>
            <Link to="/about/contact" className="inline-flex h-10 items-center justify-center rounded-md border border-line-strong px-4 text-label font-medium text-fg hover:bg-sunken">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </>;
}