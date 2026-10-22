import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { cardStyle, fontsFor, mix } from './pageStyle';

export function FaqBlock({ block, theme }: BlockProps<'faq'>) {
  const { title, items } = block.content;
  const filled = items.filter((i) => i.question.trim());
  return (
    <section className="flex flex-col gap-3">
      {title &&
      <h2 className="text-[20px] font-medium tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title}
        </h2>
      }
      <div className="overflow-hidden" style={cardStyle(theme)}>
        {filled.length === 0 ?
        <p className="px-4 py-4 text-[14px]" style={{ color: theme.mutedText }}>
            Add your first question in the inspector.
          </p> :

        filled.map((item, i) =>
        <details
          key={item.id}
          className="kb-faq group"
          style={i > 0 ? { borderTop: `1px solid ${mix(theme.text, 8)}` } : undefined}>
          
              <summary
            className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[14.5px] font-medium"
            style={{ color: theme.text }}>
            
                {item.question}
                <ChevronDownIcon
              size={16}
              className="shrink-0 transition-transform duration-200 ease-out group-open:rotate-180"
              style={{ color: theme.mutedText }}
              aria-hidden />
            
              </summary>
              <p className="px-4 pb-4 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
                {item.answer || 'Answer coming soon.'}
              </p>
            </details>
        )
        }
      </div>
    </section>);

}