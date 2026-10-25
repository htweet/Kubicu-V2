import React, { useRef } from 'react';
import { ChevronDownIcon, NavigationIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { useElementWidth } from '../../hooks/useElementWidth';
import { buttonRadius, fontsFor, inputStyle, mix } from './pageStyle';

/**
 * Jump links (D169): a row of section links on wide screens; a native "Jump to" menu when narrow,
 * so phones never get a cramped sideways strip. Links target the blocks' own anchors (#b-{id}).
 */
export function AnchorNavBlock({ block, theme, mode }: BlockProps<'anchorNav'>) {
  const c = block.content;
  const ref = useRef<HTMLElement>(null);
  const width = useElementWidth(ref);
  const items = c.items.filter((i) => i.label.trim() && i.blockId);
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={NavigationIcon} title="Choose sections to link to" hint="Pick blocks on this page in the inspector" theme={theme} /> : null;
  const jump = (blockId: string) => {
    if (mode !== 'live') return;
    const el = document.getElementById(`b-${blockId}`);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  const narrow = width > 0 && width < 520;
  return (
    <nav ref={ref} aria-label={c.title || 'On this page'}>
      {c.title && <p className="mb-2 text-[13px] font-semibold" style={{ color: theme.mutedText, fontFamily: fontsFor(theme).body }}>{c.title}</p>}
      {narrow ?
      <div className="relative">
          <label htmlFor={`${block.id}-jump`} className="sr-only">Jump to a section</label>
          <select
          id={`${block.id}-jump`}
          value=""
          onChange={(e) => e.target.value && jump(e.target.value)}
          className="h-12 w-full appearance-none px-4 pr-10 text-[15px] font-medium"
          style={inputStyle(theme)}>
          
            <option value="">Jump to…</option>
            {items.map((i) =>
          <option key={i.id} value={i.blockId}>{i.label}</option>
          )}
          </select>
          <ChevronDownIcon size={16} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: theme.mutedText }} />
        </div> :

      <ul className="flex flex-wrap gap-2">
          {items.map((i) =>
        <li key={i.id}>
              <a
            href={`#b-${i.blockId}`}
            onClick={(e) => {
              e.preventDefault();
              jump(i.blockId);
            }}
            className="inline-flex h-10 items-center px-4 text-[14px] font-medium transition-[background-color] duration-150 ease-out"
            style={{ color: theme.text, background: mix(theme.text, 6), borderRadius: buttonRadius(theme) }}>
            
                {i.label}
              </a>
            </li>
        )}
        </ul>
      }
    </nav>);

}