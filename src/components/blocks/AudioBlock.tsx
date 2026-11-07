import React, { useState } from 'react';
import { MusicIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { MediaImage } from '../media/MediaImage';
import { AudioPlayer } from './AudioPlayer';
import { cardStyle, fontsFor, mix } from './pageStyle';
import { useDataSaver } from '../../contexts/DataSaverContext';

/** One track, voice note or episode (D124). */
export function AudioBlock({ block, theme: t, mode }: BlockProps<'audio'>) {
  const c = block.content;
  const { on } = useDataSaver();
  const [showTranscript, setShowTranscript] = useState(false);
  if (!c.url) {
    return mode === 'edit' ? <BlockPlaceholder icon={MusicIcon} title="No track yet" hint="Paste a link to an audio file or upload a short one" theme={t} /> : null;
  }
  return (
    <article className="flex flex-col gap-3 p-4" style={cardStyle(t)}>
      <div className="flex items-center gap-3">
        {c.coverUrl ? (
          <MediaImage src={c.coverUrl} alt={c.coverAlt} loading="lazy" className="h-16 w-16 shrink-0 rounded-md object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md" style={{ background: mix(t.text, 6), color: t.mutedText }}>
            <MusicIcon size={22} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-medium leading-snug" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
            {c.title || 'Untitled track'}
          </h3>
          {c.artist && <p className="truncate text-[13px]" style={{ color: t.mutedText }}>{c.artist}</p>}
        </div>
      </div>
      <AudioPlayer src={c.url} title={c.title} theme={t} deferLoad={on} allowDownload={c.allowDownload} fileName={c.fileName} inert={mode === 'edit'} />
      {c.transcript.trim() && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            aria-expanded={showTranscript}
            className="text-[13px] font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: t.text }}
          >
            {showTranscript ? 'Hide transcript' : 'Read transcript'}
          </button>
          {showTranscript && <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed" style={{ color: t.mutedText }}>{c.transcript}</p>}
        </div>
      )}
    </article>
  );
}
