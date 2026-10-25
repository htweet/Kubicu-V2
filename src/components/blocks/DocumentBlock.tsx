import React from 'react';
import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';

/** Document (D170): cover, title, file type and pages, and one open button. No viewer is loaded, so it stays light on data. */
export function DocumentBlock({ block, theme, mode }: BlockProps<'document'>) {
  const c = block.content;
  if (!c.url.trim()) return mode === 'edit' ? <BlockPlaceholder icon={FileTextIcon} title="Add a document link" hint="A PDF in your files, Google Drive or Dropbox" theme={theme} /> : null;
  const host = (() => {
    try {
      return new URL(c.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();
  const meta = [c.fileType, c.pages && `${c.pages} pages`].filter(Boolean).join(' · ');
  return (
    <section className="flex gap-4 p-4 md:gap-5 md:p-5" style={cardStyle(theme)}>
      <div className="flex aspect-[3/4] w-20 shrink-0 items-center justify-center overflow-hidden rounded-[6px] md:w-24" style={{ background: mix(theme.text, 6), boxShadow: `0 0 0 1px ${mix(theme.text, 10)}` }}>
        {c.coverUrl ? <MediaImage src={c.coverUrl} alt={c.coverAlt} className="h-full w-full object-cover" /> : <FileTextIcon size={26} aria-hidden style={{ color: theme.mutedText }} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-[18px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title || 'Document'}</h3>
        {meta && <p className="mt-0.5 text-[13px] font-medium" style={{ color: theme.mutedText }}>{meta}</p>}
        {c.description && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{c.description}</p>}
        <div className="mt-auto pt-3">
          <PageAction mode={mode} href={c.url} ariaLabel={`Open ${c.title || 'document'}${host ? ` on ${host}` : ''} in a new tab`} className="inline-flex h-11 items-center gap-2 px-4 text-[14px] font-semibold" style={buttonStyle(theme, 'featured')}>
            Open <ExternalLinkIcon size={14} aria-hidden />
          </PageAction>
          {host && <span className="ml-3 text-[12px]" style={{ color: theme.mutedText }}>on {host}</span>}
        </div>
      </div>
    </section>);

}