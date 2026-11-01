import React, { useRef, useState } from 'react';
import { ArrowRightLeftIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { MediaImage } from '../media/MediaImage';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { planAtLeast } from '../../data/plans';
import { buttonStyle, cardRadius, imageFrameStyle } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/**
 * Before & after (D169). Three ways to compare, so no one depends on dragging: drag the handle,
 * use arrow keys on the slider (role="slider"), or tap the Before / After buttons. Free plan: side by side.
 */
export function BeforeAfterBlock({ block, theme, mode }: BlockProps<'beforeAfter'>) {
  // Screen-reader wording follows the visitor's language (D509); the seller's Before/After labels stay as written.
  const { t: tr } = useT();
  const c = block.content;
  const plan = useRenderPlan();
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  if (!c.beforeUrl || !c.afterUrl) return mode === 'edit' ? <BlockPlaceholder icon={ArrowRightLeftIcon} title="Add a before and an after photo" hint="Same angle and crop compare best" theme={theme} tall /> : null;
  const radius = cardRadius(theme);
  const unlocked = planAtLeast(plan.id, 'creator');

  if (!unlocked) {
    return (
      <figure>
        <SectionHeading theme={theme} title={c.title} />
        <div className="grid grid-cols-2 gap-3">
          {[
          [c.beforeUrl, c.beforeAlt, c.beforeLabel],
          [c.afterUrl, c.afterAlt, c.afterLabel]].
          map(([src, alt, label]) =>
          <div key={label}>
              <MediaImage src={src} alt={alt} className="aspect-[4/5] w-full object-cover" style={{ borderRadius: radius }} />
              <p className="mt-2 text-[13px] font-semibold" style={{ color: theme.text }}>{label}</p>
            </div>
          )}
        </div>
        {c.caption && <figcaption className="mt-3 text-[14px]" style={{ color: theme.mutedText }}>{c.caption}</figcaption>}
      </figure>);

  }

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, (clientX - r.left) / r.width * 100)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPos((p) => Math.max(0, p - step));else
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPos((p) => Math.min(100, p + step));else
    if (e.key === 'Home') setPos(0);else
    if (e.key === 'End') setPos(100);else
    return;
    e.preventDefault();
  };
  const interactive = mode === 'live' || mode === 'edit';

  return (
    <figure>
      <SectionHeading theme={theme} title={c.title} />
      <div
        ref={box}
        className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden"
        style={{ borderRadius: radius, ...imageFrameStyle(theme) }}
        onPointerDown={(e) => {
          if (!interactive) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => e.buttons === 1 && fromPointer(e.clientX)}>
        
        <MediaImage src={c.afterUrl} alt={c.afterAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <MediaImage src={c.beforeUrl} alt={c.beforeAlt} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-semibold text-white">{c.beforeLabel}</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-semibold text-white">{c.afterLabel}</span>
        <div
          role="slider"
          tabIndex={0}
          aria-label={tr('Compare: {a} and {b}', { a: c.beforeLabel, b: c.afterLabel })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${c.beforeLabel}: ${Math.round(pos)}%`}
          onKeyDown={onKey}
          className="absolute inset-y-0 -ml-5 flex w-10 cursor-ew-resize items-center justify-center focus-visible:outline-none [&:focus-visible>span]:ring-4 [&:focus-visible>span]:ring-white/70"
          style={{ left: `${pos}%` }}>
          
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow" />
          <span aria-hidden className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
            <ArrowRightLeftIcon size={16} />
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {c.caption ? <figcaption className="text-[14px]" style={{ color: theme.mutedText }}>{c.caption}</figcaption> : <span />}
        <div className="flex gap-2" role="group" aria-label={tr('Show')}>
          <button type="button" onClick={() => setPos(100)} aria-pressed={pos === 100} className="h-10 px-4 text-[13px] font-semibold" style={buttonStyle(theme, pos === 100 ? 'featured' : 'default')}>
            {c.beforeLabel}
          </button>
          <button type="button" onClick={() => setPos(0)} aria-pressed={pos === 0} className="h-10 px-4 text-[13px] font-semibold" style={buttonStyle(theme, pos === 0 ? 'featured' : 'default')}>
            {c.afterLabel}
          </button>
        </div>
      </div>
    </figure>);

}