import React, { useState } from "react";
import { CalendarIcon, MapPinIcon, MusicIcon, PlayIcon, ShieldCheckIcon, VideoIcon, BoxIcon } from "lucide-react";
import { useDataSaver } from "../../contexts/DataSaverContext";
import { useT } from "../../contexts/LocaleContext";
import { BlockProps } from "./blockProps";
import { BlockPlaceholder } from "./BlockPlaceholder";
import { cardRadius } from "./pageStyle";
import { parseEmbed, EmbedFrame, EmbedInfo, EmbedKind } from "../../utils/embeds";
const KIND_ICON: Record<EmbedKind, BoxIcon> = {
  video: VideoIcon,
  audio: MusicIcon,
  map: MapPinIcon,
  scheduler: CalendarIcon
};

/** Video & embed block (D142): any link from the safe list, shown in a sandboxed frame on live pages. */
export function VideoBlock({
  block,
  theme,
  mode
}: BlockProps<'video'>) {
  const {
    url,
    title
  } = block.content;
  const embed = url ? parseEmbed(url) : null;
  if (!embed || !embed.ok) {
    return mode === 'edit' ? <BlockPlaceholder icon={VideoIcon} title={url ? 'This link can’t be embedded' : 'Nothing embedded yet'} hint={embed && !embed.ok ? embed.reason : 'Paste a YouTube, Vimeo, TikTok, Instagram, Spotify, Maps or Calendly link'} theme={theme} tall /> : null;
  }
  const radius = cardRadius(theme);
  if (mode === 'edit') return <EditPreview embed={embed} title={title} radius={radius} />;
  return <LiveEmbed embed={embed} title={title} radius={radius} />;
}
function Frame({
  frame,
  radius,
  children,
  dark = true





}: {frame: EmbedFrame;radius: number | string;children: React.ReactNode;dark?: boolean;}) {
  const style: React.CSSProperties = frame.type === 'ratio' ? {
    aspectRatio: frame.ratio,
    borderRadius: radius
  } : {
    height: frame.height,
    maxWidth: frame.maxWidth,
    borderRadius: radius
  };
  return <div className={`relative mx-auto w-full overflow-hidden ${dark ? 'bg-black' : 'bg-white'}`} style={style}>
      {children}
    </div>;
}

/** In the canvas the third-party frame isn't loaded, so clicks select the block instead of playing. */
function EditPreview({
  embed,
  title,
  radius




}: {embed: EmbedInfo;title: string;radius: number | string;}) {
  const Icon = KIND_ICON[embed.kind];
  return <Frame frame={embed.frame} radius={radius}>
      {embed.thumbnail && <img src={embed.thumbnail} alt="" className="h-full w-full object-cover opacity-90" />}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-white" aria-hidden>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70">
          {embed.kind === 'video' ? <PlayIcon size={20} className="translate-x-px" /> : <Icon size={20} />}
        </span>
        {!embed.thumbnail && <>
            <span className="text-[13px] font-semibold">{title || embed.name}</span>
            <span className="text-[11px] text-white/70">{embed.name} · shows on your live page</span>
          </>}
      </span>
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
        <ShieldCheckIcon size={11} aria-hidden />
        {embed.name}
      </span>
    </Frame>;
}
function LiveEmbed({
  embed,
  title,
  radius




}: {embed: EmbedInfo;title: string;radius: number | string;}) {
  const {
    on
  } = useDataSaver();
  const {
    t
  } = useT();
  const [load, setLoad] = useState(false);
  const Icon = KIND_ICON[embed.kind];
  const label = title || embed.name;
  if (on && !load) {
    return <Frame frame={embed.frame.type === 'fixed' ? {
      ...embed.frame,
      height: Math.min(embed.frame.height, 220)
    } : embed.frame} radius={radius}>
        <button type="button" onClick={() => setLoad(true)} className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15" aria-hidden>
            {embed.kind === 'video' ? <PlayIcon size={20} className="translate-x-px" /> : <Icon size={20} />}
          </span>
          <span className="text-[13px] font-semibold">{t(embed.kind === 'video' ? 'Play video: {title}' : 'Load {title}', {
            title: label
          })}</span>
          <span className="text-[11px] text-white/70">{t('Paused to save data — loads from {site}', {
            site: embed.name
          })}</span>
        </button>
      </Frame>;
  }
  const src = load && embed.provider === 'youtube' ? `${embed.src}&autoplay=1` : embed.src;
  return <Frame frame={embed.frame} radius={radius} dark={embed.kind === 'video'}>
      <iframe src={src} title={title || t('Embedded content from {site}', {
      site: embed.name
    })} loading="lazy" allow={embed.allow || undefined} sandbox={embed.sandbox} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen={embed.kind === 'video'} className="h-full w-full border-0" />
    </Frame>;
}