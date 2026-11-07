import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ImageIcon, ListOrderedIcon } from 'lucide-react';
import type { HelpArticle } from '../../types/help';
import { helpArticleHref, shotFor } from '../../utils/help';
import { useT } from '../../contexts/LocaleContext';

/** One guide answer in the list: the question, a one-line answer, and what the full guide contains. Labels translated in D332; the guide text is English for now. */
export function HelpArticleRow({ article: a }: { article: HelpArticle }) {
  const { t: tr } = useT();
  const steps = a.steps?.length ?? 0;
  const picture = !!shotFor(a);
  return (
    <li id={`help-${a.id}`} className="scroll-mt-28">
      <Link
        to={helpArticleHref(a.id)}
        className="group flex items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-fg group-hover:underline group-hover:underline-offset-4">{a.q}</span>
          <span className="mt-1 line-clamp-1 block text-label text-fg-muted">{a.a}</span>
          {(steps > 0 || picture) && (
            <span className="mt-1.5 flex flex-wrap gap-3 text-caption text-fg-subtle">
              {steps > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ListOrderedIcon size={13} aria-hidden /> {tr('Steps: {n}', { n: steps })}
                </span>
              )}
              {picture && (
                <span className="inline-flex items-center gap-1">
                  <ImageIcon size={13} aria-hidden /> {tr('Picture')}
                </span>
              )}
            </span>
          )}
        </span>
        <ChevronRightIcon size={18} className="shrink-0 text-fg-subtle transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}
