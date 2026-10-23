import React, { useState } from 'react';
import { PlayIcon, VideoIcon } from 'lucide-react';
import { useDataSaver } from '../../contexts/DataSaverContext';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cardRadius } from './pageStyle';
import { getYouTubeId } from '../../utils/video';

export function VideoBlock({ block, theme, mode }: BlockProps<'video'>) {
  const { url, title } = block.content;
  const id = getYouTubeId(url);
  if (!id) {
    return mode === 'edit' ?
    <BlockPlaceholder
      icon={VideoIcon}
      title={url ? 'This link isn’t supported' : 'No video yet'}
      hint="Paste a YouTube link — other providers are coming"
      theme={theme}
      tall /> :

    null;
  }
  const radius = cardRadius(theme);
  if (mode === 'edit') {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black" style={{ borderRadius: radius }}>
        <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-90" />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white">
            <PlayIcon size={20} className="translate-x-px" />
          </span>
        </span>
      </div>);

  }
  return <LiveVideo id={id} title={title} radius={radius} />;
}

function LiveVideo({ id, title, radius }: {id: string;title: string;radius: number | string;}) {
  const { on } = useDataSaver();
  const [play, setPlay] = useState(false);
  if (on && !play) {
    return (
      <button
        type="button"
        onClick={() => setPlay(true)}
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{ borderRadius: radius }}>
        
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15" aria-hidden>
          <PlayIcon size={20} className="translate-x-px" />
        </span>
        <span className="text-[13px] font-semibold">Play video{title ? `: ${title}` : ''}</span>
        <span className="text-[11px] text-white/70">Paused to save data — uses several MB</span>
      </button>);

  }
  return (
    <div className="aspect-video w-full overflow-hidden bg-black" style={{ borderRadius: radius }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}${play ? '?autoplay=1' : ''}`}
        title={title || 'Embedded video'}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full" />
      
    </div>);

}