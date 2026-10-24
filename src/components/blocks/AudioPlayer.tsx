import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { buttonRadius, mix } from './pageStyle';

interface AudioPlayerProps {
  src: string;
  title: string;
  theme: PageTheme;
  /** Data saver (D85): don't fetch the file until the visitor presses play. */
  deferLoad: boolean;
  allowDownload: boolean;
  fileName?: string;
  /** Called when the track ends, for playlists. */
  onEnded?: () => void;
  autoPlay?: boolean;
  inert?: boolean;
}

const fmt = (s: number) => Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';

/** A themed, keyboard-friendly audio player (D124). Native <audio> underneath for reliability. */
export function AudioPlayer({ src, title, theme: t, deferLoad, allowDownload, fileName, onEnded, autoPlay, inert }: AudioPlayerProps) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(!deferLoad);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setTime(0);
    if (autoPlay && ref.current && loaded) ref.current.play().catch(() => setPlaying(false));
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (inert) return;
    if (!loaded) {
      setLoaded(true);
      window.setTimeout(() => ref.current?.play().catch(() => setFailed(true)), 0);
      return;
    }
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setFailed(true));else
    a.pause();
  };

  const seek = (v: number) => {
    if (ref.current) ref.current.currentTime = v;
    setTime(v);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={`${playing ? 'Pause' : 'Play'} ${title || 'track'}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ background: t.accent, color: t.accentText }}>
          
          {playing ? <PauseIcon size={18} aria-hidden /> : <PlayIcon size={18} className="translate-x-px" aria-hidden />}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={time}
            disabled={!loaded || !duration || inert}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={`Position in ${title || 'track'}`}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            className="h-1.5 w-full cursor-pointer disabled:cursor-default"
            style={{ accentColor: t.accent }} />
          
          <div className="flex justify-between text-[11.5px] tabular-nums" style={{ color: t.mutedText }}>
            <span>{fmt(time)}</span>
            <span>{loaded ? fmt(duration) : deferLoad ? 'Tap play to load' : '–:––'}</span>
          </div>
        </div>
        {allowDownload && !inert &&
        <a
          href={src}
          download={fileName || title || 'track'}
          aria-label={`Download ${title || 'track'}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2"
          style={{ color: t.text, border: `1px solid ${mix(t.text, 16)}`, borderRadius: buttonRadius(t) }}>
          
            <DownloadIcon size={16} aria-hidden />
          </a>
        }
      </div>
      {failed &&
      <p role="alert" className="text-[12px]" style={{ color: t.mutedText }}>
          This track can’t play right now. Check your connection and try again.
        </p>
      }
      {loaded && !inert &&
      <audio
        ref={ref}
        src={src}
        preload={deferLoad ? 'none' : 'metadata'}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onError={() => setFailed(true)}
        className="hidden" />

      }
    </div>);

}