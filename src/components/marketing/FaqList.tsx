import React from 'react';
import { PlusIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { localiseAmounts } from '../../utils/currency';

/**
 * Website FAQ (D260): large rounded rows; the plus turns into a cross when open. Native disclosure for keyboard and screen readers.
 * Questions and answers pass through the translator (D319), so every page using this list picks up drafts where they exist.
 */
export function FaqList({ items }: {items: {q: string;a: string;}[];}) {
  const { t: tr } = useT();
  return (
    <ul className="flex flex-col gap-3">
      {items.map((f) =>
      <li key={f.q}>
          <details className="kb-faq group rounded-[24px] bg-raised shadow-1 transition-colors duration-150 open:bg-fg open:text-canvas">
            <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-4 rounded-[24px] px-6 py-4 text-[17px] font-bold text-fg group-open:text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:text-[19px]">
              {localiseAmounts(tr(f.q))}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-fg transition-transform duration-200 ease-out group-open:rotate-45 group-open:bg-[rgb(var(--kb-lime,214_241_90))] group-open:text-[rgb(20_20_18)]">
                <PlusIcon size={18} strokeWidth={2.5} aria-hidden />
              </span>
            </summary>
            <p className="max-w-2xl px-6 pb-6 text-[15px] leading-relaxed text-canvas/85">{localiseAmounts(tr(f.a))}</p>
          </details>
        </li>
      )}
    </ul>);

}