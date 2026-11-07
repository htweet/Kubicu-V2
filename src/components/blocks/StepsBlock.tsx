import React from 'react';
import { ListOrderedIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { fontsFor, mix } from './pageStyle';

/**
 * A numbered process or timeline (D153, refined in D157) — numbers only because the order matters.
 * Columns side by side when there's room, each opened by a large display numeral over a rule.
 */
export function StepsBlock({ block, theme, mode }: BlockProps<'steps'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={ListOrderedIcon} title="Add steps" hint="Three to five steps read best" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  const accent = theme.accent === theme.text ? theme.mutedText : theme.accent;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <ol className="grid gap-x-8 gap-y-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
        {items.map((i, n) => (
          <li key={i.id} className="relative flex flex-col pt-6" style={{ borderTop: `1px solid ${mix(theme.text, 22)}` }}>
            <span aria-hidden className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full" style={{ background: accent }} />
            <span aria-hidden className="text-[44px] font-medium leading-none tracking-[-0.04em] tabular-nums md:text-[56px]" style={{ fontFamily: display, color: mix(accent, 70, theme.background) }}>
              {String(n + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-5 text-[19px] font-medium leading-snug md:text-[20px]" style={{ color: theme.text }}>
              <span className="sr-only">Step {n + 1}: </span>
              {i.title}
            </h3>
            {i.text && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
