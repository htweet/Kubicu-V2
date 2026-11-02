import React, { useState } from 'react';
import { MediaImage } from '../media/MediaImage';
import { ChevronLeftIcon, ChevronRightIcon, ImagesIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle } from './BlockTitle';
import { PageOverlay } from './PageOverlay';
import { cardRadius } from './pageStyle';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { planAtLeast } from '../../data/plans';
import { useT } from '../../contexts/LocaleContext';

/** Photo gallery and viewer. Controls and labels follow the visitor's language (D505); photo descriptions stay as written. */
export function GalleryBlock({ block, theme, mode }: BlockProps<'gallery'>) {
  const { t: tr } = useT();
  const c = block.content;
  const plan = useRenderPlan();
  const [viewing, setViewing] = useState<number | null>(null);
  const images = c.images.filter((i) => i.url);

  if (images.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={ImagesIcon} title="Add photos" hint="Upload or paste up to 12 photos in the inspector" theme={theme} tall /> : null;
  }

  // Free plan: the gallery gracefully shows its first photo (D33).
  const unlocked = planAtLeast(plan.id, 'creator');
  const shown = unlocked ? images : images.slice(0, 1);
  const radius = Math.max(cardRadius(theme) - 4, 4);
  const interactive = mode === 'live';

  const open = (i: number) => interactive && setViewing(i);
  const Tile = ({ index, className }: {index: number;className: string;}) => {
    const img = shown[index];
    const content = <MediaImage src={img.url} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />;
    return interactive ?
    <button type="button" onClick={() => open(index)} aria-label={`${tr('View photo {n} of {total}', { n: index + 1, total: shown.length })}${img.alt ? `: ${img.alt}` : ''}`} className={className} style={{ borderRadius: radius, overflow: 'hidden' }}>
        {content}
      </button> :

    <div className={className} style={{ borderRadius: radius, overflow: 'hidden' }}>
        {content}
      </div>;

  };

  const step = (d: number) => setViewing((v) => v === null ? v : (v + d + shown.length) % shown.length);

  return (
    <section>
      {c.title && <BlockTitle theme={theme}>{c.title}</BlockTitle>}
      {c.layout === 'carousel' && shown.length > 1 ?
      <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" aria-label={tr('Photos: {n} — swipe to see more', { n: shown.length })} tabIndex={0}>
          {shown.map((img, i) =>
        <Tile key={img.id} index={i} className="aspect-[4/5] w-[78%] shrink-0 snap-start" />
        )}
        </div> :
      c.layout === 'masonry' && shown.length > 1 ?
      // Masonry (D171): natural heights in columns, read top-to-bottom; tiles never split across columns.
      <div className="columns-2 gap-2 md:columns-3">
          {shown.map((img, i) =>
        <Tile key={img.id} index={i} className="mb-2 block w-full break-inside-avoid [&_img]:h-auto" />
        )}
        </div> :

      <div className="grid grid-cols-2 gap-2">
          {shown.map((img, i) =>
        <Tile key={img.id} index={i} className={shown.length % 2 === 1 && i === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'} />
        )}
        </div>
      }
      {!unlocked && mode === 'edit' && images.length > 1 &&
      <p className="mt-2 text-[12px]" style={{ color: theme.mutedText }}>
          {tr('Free plan shows the first photo only. Creator plan and up show all of them ({n}).', { n: images.length })}
        </p>
      }

      {interactive &&
      <PageOverlay
        open={viewing !== null}
        onClose={() => setViewing(null)}
        theme={theme}
        variant="viewer"
        label={tr('Photo viewer')}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}>
        
          {viewing !== null &&
        <div className="flex h-full w-full flex-col items-center justify-center px-4 py-16">
              <MediaImage src={shown[viewing].url} alt={shown[viewing].alt} className="max-h-full max-w-full object-contain" />
              <p className="mt-4 text-center text-[13px] text-white/80" aria-live="polite">
                {viewing + 1} / {shown.length}
                {shown[viewing].alt ? ` · ${shown[viewing].alt}` : ''}
              </p>
              {shown.length > 1 &&
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
                  <button type="button" onClick={() => step(-1)} aria-label={tr('Previous photo')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
                    <ChevronLeftIcon size={20} aria-hidden />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={tr('Next photo')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
                    <ChevronRightIcon size={20} aria-hidden />
                  </button>
                </div>
          }
            </div>
        }
        </PageOverlay>
      }
    </section>);

}