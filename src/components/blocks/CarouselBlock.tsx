import React, { useId, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, GalleryHorizontalIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { planAtLeast } from '../../data/plans';
import { accentOf, cardRadius, fontsFor, imageFrameStyle, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

const ratio = { wide: '16 / 9', square: '1 / 1', portrait: '4 / 5' } as const;

/**
 * Carousel (D170), WAI-ARIA carousel pattern: previous/next buttons, a "slide n of N" label, slide picker
 * buttons, arrow keys when focused. Never auto-advances. Free plan: slides stack as a simple list.
 */
export function CarouselBlock({ block, theme, mode }: BlockProps<'carousel'>) {
  // Controls and screen-reader labels follow the visitor's language (D505).
  const { t: tr } = useT();
  const c = block.content;
  const plan = useRenderPlan();
  const uid = useId().replace(/:/g, '');
  const [i, setI] = useState(0);
  const slides = c.slides.filter((s) => s.imageUrl || s.title.trim());
  if (slides.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={GalleryHorizontalIcon} title="Add slides" hint="A photo and a short line each" theme={theme} tall /> : null;
  const n = slides.length;
  const at = Math.min(i, n - 1);
  const radius = cardRadius(theme);
  const display = fontsFor(theme).display;
  const go = (k: number) => setI((k + n) % n);

  const slideBody = (s: (typeof slides)[number]) =>
  <>
      <div className="overflow-hidden" style={{ aspectRatio: ratio[c.aspect], borderRadius: radius, background: mix(accentOf(theme), 12, theme.background), ...imageFrameStyle(theme) }}>
        {s.imageUrl && <MediaImage src={s.imageUrl} alt={s.imageAlt} className="h-full w-full object-cover" />}
      </div>
      {(s.title || s.text) &&
    <div className="mt-4">
          {s.title && <h3 className="text-[20px] font-medium leading-snug" style={{ fontFamily: display, color: theme.text }}>{s.title}</h3>}
          {s.text && <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{s.text}</p>}
        </div>
    }
    </>;


  if (!planAtLeast(plan.id, 'creator') || n === 1) {
    return (
      <section>
        <SectionHeading theme={theme} title={c.title} />
        <ul className="flex flex-col gap-8">
          {slides.map((s) =>
          <li key={s.id}>{s.url ? <PageAction mode={mode} href={s.url} className="block">{slideBody(s)}</PageAction> : slideBody(s)}</li>
          )}
        </ul>
      </section>);

  }

  const btn = 'flex h-11 w-11 items-center justify-center rounded-full transition-[background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2';
  return (
    <section aria-roledescription={tr('carousel')} aria-label={c.title || tr('Slides')}>
      <SectionHeading theme={theme} title={c.title} />
      <div
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(at + 1);else
          if (e.key === 'ArrowLeft') go(at - 1);
        }}>
        
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none" style={{ transform: `translateX(-${at * 100}%)` }}>
            {slides.map((s, k) =>
            <div key={s.id} id={`${uid}-s${k}`} role="group" aria-roledescription={tr('slide')} aria-label={tr('{n} of {total}', { n: k + 1, total: n })} aria-hidden={k !== at} className="w-full shrink-0" style={{ visibility: k === at ? 'visible' : 'hidden' }}>
                {s.url ? <PageAction mode={mode} href={s.url} className="block">{slideBody(s)}</PageAction> : slideBody(s)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label={tr('Choose a slide')}>
            {slides.map((s, k) =>
            <button
              key={s.id}
              type="button"
              aria-label={`${tr('Show slide {n}', { n: k + 1 })}${s.title ? `: ${s.title}` : ''}`}
              aria-current={k === at ? 'true' : undefined}
              aria-controls={`${uid}-s${k}`}
              onClick={() => go(k)}
              className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2"
              style={{ ['--tw-ring-color' as string]: theme.text }}>
              
                <span aria-hidden className="block h-2 rounded-full transition-[width,background-color] duration-200 ease-out" style={{ width: k === at ? 20 : 8, background: k === at ? theme.text : mix(theme.text, 25) }} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label={tr('Previous slide')} onClick={() => go(at - 1)} className={btn} style={{ background: mix(theme.text, 8), color: theme.text, ['--tw-ring-color' as string]: theme.text }}>
              <ChevronLeftIcon size={18} aria-hidden />
            </button>
            <button type="button" aria-label={tr('Next slide')} onClick={() => go(at + 1)} className={btn} style={{ background: mix(theme.text, 8), color: theme.text, ['--tw-ring-color' as string]: theme.text }}>
              <ChevronRightIcon size={18} aria-hidden />
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {tr('Slide {n} of {total}', { n: at + 1, total: n })}
        </p>
      </div>
    </section>);

}