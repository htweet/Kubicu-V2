import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { fontsFor, mix } from './pageStyle';

/** Policies & assurance (D169): two-column on wide screens, each promise in the owner's own words. Empty items never show. */
export function PoliciesBlock({ block, theme, mode }: BlockProps<'policies'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim() && i.text.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={ShieldCheckIcon} title="Write your policies" hint="Delivery, returns, support — each needs a title and your own words" theme={theme} /> : null;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <dl className="grid gap-x-10 gap-y-0 md:grid-cols-2">
        {items.map((i) =>
        <div key={i.id} className="py-5" style={{ borderTop: `1px solid ${mix(theme.text, 10)}` }}>
            <dt className="text-[17px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{i.title}</dt>
            <dd className="mt-2 whitespace-pre-line text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</dd>
          </div>
        )}
      </dl>
    </section>);

}