import React from 'react';
import type { PageTheme } from '../../types/page';
import type { ShopHeaderStyle } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { fontsFor, mix } from '../blocks/pageStyle';

interface ShopHeaderProps {
  theme: PageTheme;
  style: ShopHeaderStyle;
  title: string;
  intro: string;
  bannerUrl: string;
  bannerAlt: string;
  /** e.g. an automatic discount line. */
  offer: string | null;
  /** A collection is open: show its name, never the banner. */
  inCollection: boolean;
}

/** The top of the shop in the chosen header style (D196). "None" still keeps an accessible heading. */
export function ShopHeader({ theme, style, title, intro, bannerUrl, bannerAlt, offer, inCollection }: ShopHeaderProps) {
  const display = fontsFor(theme).display;
  const heading = (size: string) =>
  <h1 className={`${size} font-medium leading-tight tracking-[-0.015em]`} style={{ fontFamily: display, color: theme.text }}>
      {title}
    </h1>;

  const introEl = intro &&
  <p className="max-w-2xl text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>
      {intro}
    </p>;

  const offerEl = offer &&
  <p className="self-start rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: mix(theme.accent, 16, theme.background), color: theme.text }}>
      {offer} — applied at checkout
    </p>;


  if (style === 'none' && !inCollection) {
    return (
      <header className="flex flex-col gap-2">
        <h1 className="sr-only">{title}</h1>
        {offerEl}
      </header>);

  }

  if (style === 'split' && bannerUrl && !inCollection) {
    return (
      <header className="grid items-center gap-6 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
        <div className="order-2 flex flex-col gap-3 md:order-1">
          {heading('text-[30px] md:text-[44px]')}
          {introEl}
          {offerEl}
        </div>
        <MediaImage src={bannerUrl} alt={bannerAlt} className="order-1 aspect-[4/3] w-full rounded-lg object-cover md:order-2 md:aspect-[5/4]" />
      </header>);

  }

  return (
    <>
      {style === 'banner' && bannerUrl && !inCollection && <MediaImage src={bannerUrl} alt={bannerAlt} className="aspect-[16/7] w-full rounded-lg object-cover md:aspect-[16/5]" />}
      <header className="flex flex-col gap-2 pt-2">
        {heading('text-[28px] md:text-[34px]')}
        {introEl}
        {offerEl}
      </header>
    </>);

}