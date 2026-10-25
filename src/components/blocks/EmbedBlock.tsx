import React from 'react';
import { CodeXmlIcon, ExternalLinkIcon } from 'lucide-react';
import type { BlockOf } from '../../types/page';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { VideoBlock } from './VideoBlock';
import { PageAction } from './PageAction';
import { parseEmbed } from '../../utils/embeds';
import { blockDefinitions } from '../../data/blockRegistry';
import { cardStyle, fontsFor } from './pageStyle';

/**
 * Embed (D170): sites on the safe list play in the same sandboxed frame as Video & embed.
 * Anything else becomes a link card — visitors are never exposed to untrusted code.
 */
export function EmbedBlock({ block, theme, mode }: BlockProps<'embed'>) {
  const c = block.content;
  if (!c.url.trim()) return mode === 'edit' ? <BlockPlaceholder icon={CodeXmlIcon} title="Paste a link to embed" hint="Spotify, SoundCloud, YouTube, Maps, Calendly and more" theme={theme} /> : null;
  const parsed = parseEmbed(c.url);
  if (parsed.ok) {
    const asVideo = { ...block, type: 'video', content: { ...blockDefinitions.video.defaults(), url: c.url, title: c.title } } as unknown as BlockOf<'video'>;
    return (
      <figure>
        <VideoBlock block={asVideo} theme={theme} mode={mode} />
        {c.caption && <figcaption className="mt-2 text-[13px]" style={{ color: theme.mutedText }}>{c.caption}</figcaption>}
      </figure>);

  }
  const host = (() => {
    try {
      return new URL(c.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();
  return (
    <div>
      <PageAction mode={mode} href={host ? c.url : ''} className="group flex items-center justify-between gap-4 p-5" style={cardStyle(theme)}>
        <span className="min-w-0">
          <span className="block text-[17px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title || host || 'Link'}</span>
          {host && <span className="mt-0.5 block text-[13px]" style={{ color: theme.mutedText }}>Opens {host}</span>}
        </span>
        <ExternalLinkIcon size={18} aria-hidden style={{ color: theme.text }} />
      </PageAction>
      {mode === 'edit' && <p className="mt-2 text-[12px]" style={{ color: theme.mutedText }}>Shown as a link card: {parsed.reason}</p>}
    </div>);

}