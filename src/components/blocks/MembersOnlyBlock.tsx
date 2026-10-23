import React from 'react';
import { LockKeyholeIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { cardRadius, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { ruleLabel } from '../../utils/members';

/**
 * Members-only section (D110). In the canvas it marks where members-only content starts.
 * On the live page, PublicPage swaps it for the sign-in card or the members strip.
 */
export function MembersOnlyBlock({ block, theme: t, mode }: BlockProps<'membersOnly'>) {
  const catalog = useCatalog();
  if (mode !== 'edit') return null;
  const c = block.content;
  const scope = c.covers === 0 ? 'Everything below this is for members' : `The next ${c.covers} block${c.covers === 1 ? '' : 's'} ${c.covers === 1 ? 'is' : 'are'} for members`;
  return (
    <div className="flex items-start gap-3 px-4 py-3.5" style={{ background: mix(t.text, 5), borderRadius: cardRadius(t), border: `1px dashed ${mix(t.text, 30)}`, color: t.text }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: mix(t.text, 10) }}>
        <LockKeyholeIcon size={16} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium" style={{ fontFamily: fontsFor(t).display }}>
          {c.title || 'For members'}
        </span>
        <span className="block text-[12.5px]" style={{ color: t.mutedText }}>
          {scope} · {ruleLabel(catalog, c)}
        </span>
        <span className="mt-1 block text-[12.5px]" style={{ color: t.mutedText }}>
          Visitors see your teaser and a sign-in button instead.
        </span>
      </span>
    </div>);

}