import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

/** Website FAQ: native disclosure rows separated by hairlines. */
export function FaqList({ items }: {items: {q: string;a: string;}[];}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((f) =>
      <li key={f.q}>
          <details className="kb-faq group">
            <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-body font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              {f.q}
              <ChevronDownIcon size={18} className="shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="max-w-2xl pb-5 text-label leading-relaxed text-fg-muted">{f.a}</p>
          </details>
        </li>
      )}
    </ul>);

}