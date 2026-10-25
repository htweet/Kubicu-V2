import React from 'react';
import { ArrowRightIcon, PanelTopIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import type { PageTheme, RenderMode } from '../../types/page';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { buttonStyle, cardRadius, cardStyle, fontsFor, mix } from './pageStyle';
import { cn } from '../../utils/cn';

const focalPos = { center: '50% 50%', top: '50% 20%', bottom: '50% 80%' } as const;
const softShadow = '0 1px 2px rgba(0,0,0,0.05), 0 24px 48px -20px rgba(0,0,0,0.28)';
const accentOf = (t: PageTheme) => t.accent === t.text ? t.mutedText : t.accent;

/**
 * Six designed openings (D153, refined in D157). Each lays itself out from its own width,
 * so it works in the canvas and on any screen. Large display type, generous space, photography at full strength.
 */
export function HeroBlock({ block, theme, mode }: BlockProps<'hero'>) {
  const c = block.content;
  if (!c.title.trim() && !c.imageUrl) {
    return mode === 'edit' ? <BlockPlaceholder icon={PanelTopIcon} title="Add a headline" hint="Pick a hero layout and write one clear line" theme={theme} tall /> : null;
  }
  const display = fontsFor(theme).display;
  const radius = cardRadius(theme);
  const edge = block.layout.width === 'full';
  const img = (className = '', style?: React.CSSProperties) =>
  c.imageUrl ? <MediaImage src={c.imageUrl} alt={c.imageAlt} className={cn('block h-full w-full object-cover', className)} style={{ objectPosition: focalPos[c.focal], ...style }} /> : null;
  const eyebrow = (color = theme.mutedText) =>
  c.eyebrow ?
  <p className="flex items-center gap-3 text-[13px] font-semibold tracking-[0.01em] md:text-[14px]" style={{ color }}>
        <span aria-hidden className="h-px w-8" style={{ background: 'currentColor', opacity: 0.6 }} />
        {c.eyebrow}
      </p> :
  null;

  switch (c.variant) {
    case 'portrait':
      // A tall arched portrait above a confident name — reads as a personal brand, not an avatar in a list.
      return (
        <section className="flex flex-col items-center pb-4 pt-8 text-center md:pt-12">
          {c.imageUrl &&
          <div className="relative w-[min(78%,300px)]">
              {/* A thin offset arch outline in the accent colour frames the portrait (D160). */}
              <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3" style={{ borderRadius: '999px 999px 28px 28px', border: `1.5px solid ${accentOf(theme)}` }} />
              <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderRadius: '999px 999px 28px 28px', background: mix(theme.text, 8, theme.background), boxShadow: softShadow }}>
                {img()}
              </div>
            </div>
          }
          {c.eyebrow && <p className="mt-8 text-[13px] font-semibold tracking-[0.01em] md:text-[14px]" style={{ color: theme.mutedText }}>{c.eyebrow}</p>}
          <h1 className={cn('break-words text-[clamp(2.5rem,9cqw,4rem)] font-medium leading-[0.98] tracking-[-0.035em]', c.eyebrow ? 'mt-3' : 'mt-8')} style={{ fontFamily: display, color: theme.text }}>
            {c.title}
          </h1>
          {c.subtitle && <p className="mt-5 max-w-[32ch] text-[17px] leading-relaxed md:text-[19px]" style={{ color: theme.mutedText }}>{c.subtitle}</p>}
          <Actions c={c} theme={theme} mode={mode} center />
          {c.meta && <p className="mt-5 text-[13px]" style={{ color: theme.mutedText }}>{c.meta}</p>}
        </section>);


    case 'cover':
      // Photograph at full strength; an even 52% black veil keeps white display type readable on any image.
      return (
        <section className="relative isolate overflow-hidden" style={{ borderRadius: edge ? 0 : radius, background: '#111' }}>
          <div className="absolute inset-0 -z-10">{img()}</div>
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'rgba(0,0,0,0.52)' }} />
          <div className={cn('flex min-h-[560px] flex-col justify-end px-6 pb-10 pt-32 text-white sm:min-h-[620px] md:min-h-[720px] md:px-12 md:pb-16', edge && 'mx-auto w-full max-w-[1120px] md:px-5')}>
            <div className="max-w-[46rem]">
              {eyebrow('rgba(255,255,255,0.9)')}
              <h1 className={cn('break-words text-[clamp(2.5rem,8cqw,6rem)] font-medium leading-[0.95] tracking-[-0.035em]', c.eyebrow && 'mt-5')} style={{ fontFamily: display }}>
                {c.title}
              </h1>
              {c.subtitle && <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed md:text-[20px]" style={{ color: 'rgba(255,255,255,0.92)' }}>{c.subtitle}</p>}
              <Actions c={c} theme={{ ...theme, accent: '#FFFFFF', accentText: '#111111', text: '#FFFFFF', surface: 'transparent', buttonStyle: 'outline' }} mode={mode} />
              {c.meta && <p className="mt-6 text-[14px]" style={{ color: 'rgba(255,255,255,0.86)' }}>{c.meta}</p>}
            </div>
          </div>
        </section>);


    case 'masthead':
      // A magazine nameplate: oversized title between rules, the dateline above.
      return (
        <section className="pb-6 pt-6 md:pt-10">
          {(c.eyebrow || c.meta) &&
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3 text-[13px] font-medium md:text-[14px]" style={{ color: theme.mutedText, borderBottom: `1px solid ${mix(theme.text, 18)}` }}>
              <span>{c.eyebrow}</span>
              <span>{c.meta}</span>
            </div>
          }
          <h1 className="break-words pt-6 text-[clamp(2.75rem,11cqw,8.5rem)] font-medium leading-[0.9] tracking-[-0.045em] md:pt-8" style={{ fontFamily: display, color: theme.text }}>
            {c.title}
          </h1>
          <div className="mt-8 grid gap-6 pt-6 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12" style={{ borderTop: `2px solid ${theme.text}` }}>
            {c.subtitle && <p className="max-w-[48ch] text-[18px] leading-relaxed md:text-[21px]" style={{ color: theme.text }}>{c.subtitle}</p>}
            <Actions c={c} theme={theme} mode={mode} tight />
          </div>
          {c.imageUrl && <div className="mt-10 aspect-[16/9] w-full overflow-hidden" style={{ borderRadius: radius }}>{img()}</div>}
        </section>);


    case 'poster':
      // Gig-poster energy: huge stacked title, the date line set big, photo filling the other half.
      return (
        <section className="overflow-hidden" style={theme.material ? { ...cardStyle(theme), borderRadius: edge ? 0 : radius } : { background: theme.surface, borderRadius: edge ? 0 : radius, border: `1px solid ${mix(theme.text, 10)}`, boxShadow: edge ? undefined : softShadow }}>
          <div className="flex flex-wrap">
            <div className="flex min-w-0 flex-[1_1_340px] flex-col justify-between gap-12 p-7 md:p-12">
              <div>
                {eyebrow(theme.accent)}
                <h1 className={cn('break-words text-[clamp(2.5rem,9cqw,6.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.03em]', c.eyebrow && 'mt-6')} style={{ fontFamily: display, color: theme.text }}>
                  {c.title}
                </h1>
              </div>
              <div>
                {c.meta && <p className="text-[20px] font-semibold leading-snug md:text-[24px]" style={{ color: theme.text, fontFamily: display }}>{c.meta}</p>}
                {c.subtitle && <p className="mt-3 max-w-[40ch] text-[16px] leading-relaxed" style={{ color: theme.mutedText }}>{c.subtitle}</p>}
                <Actions c={c} theme={theme} mode={mode} />
              </div>
            </div>
            {c.imageUrl && <div className="aspect-[4/5] min-w-0 flex-[1_1_320px] md:aspect-auto md:min-h-[600px]">{img()}</div>}
          </div>
        </section>);


    case 'product':
      // The product on a soft stage, with name, price and action beside it.
      return (
        <section className="grid items-center gap-x-14 gap-y-8 py-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
          <div className="relative aspect-square overflow-hidden" style={{ background: mix(accentOf(theme), 12, theme.background), borderRadius: radius, boxShadow: softShadow }}>
            {img() ?? <span aria-hidden className="absolute inset-0 flex items-center justify-center text-[clamp(3rem,10cqw,6rem)] font-medium" style={{ fontFamily: display, color: mix(theme.text, 30, theme.background) }}>{c.title.slice(0, 1)}</span>}
          </div>
          <div className="min-w-0">
            {eyebrow()}
            <h1 className={cn('break-words text-[clamp(2.25rem,5cqw,3.75rem)] font-medium leading-[1] tracking-[-0.03em]', c.eyebrow && 'mt-5')} style={{ fontFamily: display, color: theme.text }}>
              {c.title}
            </h1>
            {c.meta && <p className="mt-5 text-[22px] font-semibold tabular-nums" style={{ color: theme.text }}>{c.meta}</p>}
            {c.subtitle && <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed" style={{ color: theme.mutedText }}>{c.subtitle}</p>}
            <Actions c={c} theme={theme} mode={mode} full />
          </div>
        </section>);


    default:
      // split — headline and photo share the opening; a caption chip sits on the photo.
      return (
        <section className="grid items-center gap-x-14 gap-y-10 py-4 md:py-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
          <div className="min-w-0">
            {eyebrow()}
            <h1 className={cn('break-words text-[clamp(2.5rem,5.6cqw,4.5rem)] font-medium leading-[0.98] tracking-[-0.035em]', c.eyebrow && 'mt-6')} style={{ fontFamily: display, color: theme.text }}>
              {c.title}
            </h1>
            {c.subtitle && <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed md:text-[19px]" style={{ color: theme.mutedText }}>{c.subtitle}</p>}
            <Actions c={c} theme={theme} mode={mode} />
          </div>
          {c.imageUrl &&
          <div className="relative w-full md:justify-self-end" style={{ maxWidth: 520 }}>
              {/* Offset accent panel behind the photo gives the opening depth without decoration (D160). */}
              <span aria-hidden className="absolute -bottom-4 -right-4 left-6 top-6 hidden sm:block" style={{ borderRadius: radius, background: mix(accentOf(theme), 22, theme.background) }} />
            <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderRadius: radius, boxShadow: softShadow }}>
              {img()}
              {c.meta &&
              <span className="absolute bottom-4 left-4 right-4 inline-flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 px-4 py-2.5 text-[13px] font-semibold" style={{ background: theme.background, color: theme.text, borderRadius: Math.min(radius, 999) }}>
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: theme.accent }} />
                  {c.meta}
                </span>
              }
            </div>
            </div>
          }
          {!c.imageUrl && c.meta && <p className="text-[14px]" style={{ color: theme.mutedText }}>{c.meta}</p>}
        </section>);

  }
}

function Actions({ c, theme, mode, center, full, tight }: {c: BlockProps<'hero'>['block']['content'];theme: PageTheme;mode: RenderMode;center?: boolean;full?: boolean;tight?: boolean;}) {
  if (!c.primaryLabel && !c.secondaryLabel) return null;
  return (
    <div className={cn('flex flex-wrap gap-3', tight ? '' : 'mt-9', center && 'justify-center')}>
      {c.primaryLabel &&
      <PageAction mode={mode} href={c.primaryUrl} newTab={!c.primaryUrl.startsWith('#')} className={cn('group inline-flex min-h-[52px] items-center justify-center gap-2 px-7 text-[15px] font-semibold', full && 'w-full sm:w-auto')} style={buttonStyle(theme, 'featured')}>
          {c.primaryLabel}
          <ArrowRightIcon size={16} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
        </PageAction>
      }
      {c.secondaryLabel &&
      <PageAction mode={mode} href={c.secondaryUrl} newTab={!c.secondaryUrl.startsWith('#')} className="inline-flex min-h-[52px] items-center justify-center px-7 text-[15px] font-semibold" style={buttonStyle(theme, 'default')}>
          {c.secondaryLabel}
        </PageAction>
      }
    </div>);

}