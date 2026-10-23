import React from 'react';
import { ChevronDownIcon, MapPinIcon, SparklesIcon } from 'lucide-react';
import type { HelpArticle } from '../../types/help';

/** One guide answer: a disclosure row with steps, where to find it and the plan it needs. */
export function HelpArticleItem({ article: a, open }: {article: HelpArticle;open?: boolean;}) {
  return (
    <li id={`help-${a.id}`} className="scroll-mt-28">
      <details className="kb-faq group" open={open}>
        <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-body font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {a.q}
          <ChevronDownIcon size={18} className="shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-180" aria-hidden />
        </summary>
        <div className="flex max-w-2xl flex-col gap-3 pb-5">
          <p className="text-label leading-relaxed text-fg-muted">{a.a}</p>
          {a.steps &&
          <ol className="flex flex-col gap-2">
              {a.steps.map((s, i) =>
            <li key={s} className="grid grid-cols-[24px_minmax(0,1fr)] items-baseline gap-2 text-label text-fg">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line-strong text-caption font-semibold tabular-nums text-fg-muted">{i + 1}</span>
                  {s}
                </li>
            )}
            </ol>
          }
          {(a.where || a.plan) &&
          <div className="flex flex-wrap gap-2 pt-1">
              {a.where &&
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-caption text-fg-muted">
                  <MapPinIcon size={13} aria-hidden /> {a.where}
                </span>
            }
              {a.plan &&
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-caption text-fg-muted">
                  <SparklesIcon size={13} aria-hidden /> {a.plan}
                </span>
            }
            </div>
          }
        </div>
      </details>
    </li>);

}