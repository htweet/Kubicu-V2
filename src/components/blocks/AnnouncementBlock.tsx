import React from 'react';
import { ArrowRightIcon, MegaphoneIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { accentOf, cardRadius, mix } from './pageStyle';

/** Announcement bar (D169): one line, an optional link, three tones taken from the theme. */
export function AnnouncementBlock({ block, theme, mode }: BlockProps<'announcement'>) {
  const c = block.content;
  if (!c.text.trim()) return mode === 'edit' ? <BlockPlaceholder icon={MegaphoneIcon} title="Write your announcement" hint="One short line works best" theme={theme} /> : null;
  const tone =
  c.tone === 'invert' ?
  { background: theme.text, color: theme.background } :
  c.tone === 'accent' ?
  { background: mix(accentOf(theme), 14, theme.background), color: theme.text } :
  { background: mix(theme.text, 5, theme.background), color: theme.text };
  const inner =
  <>
      <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug">{c.text}</span>
      {c.linkLabel && c.url &&
    <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold underline-offset-4 group-hover:underline">
          {c.linkLabel} <ArrowRightIcon size={14} aria-hidden />
        </span>
    }
    </>;

  const cls = 'group flex min-h-[48px] w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center';
  const style = { ...tone, borderRadius: Math.min(cardRadius(theme), 14) };
  return (
    <aside aria-label="Announcement">
      {c.url ?
      <PageAction mode={mode} href={c.url} className={cls} style={style}>
          {inner}
        </PageAction> :

      <div className={cls} style={style}>
          {inner}
        </div>
      }
    </aside>);

}