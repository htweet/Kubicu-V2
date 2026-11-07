import type { Block, BlockLayout, PageDocument, PageTheme } from '../types/page';
import { mix } from '../components/blocks/pageStyle';

/** Layout sections (D153): widths, side-by-side pairs and section backgrounds, all defaulting to today's single column. */

export type LayoutWidth = NonNullable<BlockLayout['width']>;
export type PairRatio = NonNullable<BlockLayout['pair']>;

export const contentWidthPx: Record<NonNullable<NonNullable<PageDocument['layout']>['contentWidth']>, number> = {
  narrow: 480,
  standard: 560,
  wide: 760,
};

export const WIDE_PX = 1120;

export const pairColumns: Record<PairRatio, string> = {
  equal: 'minmax(0,1fr) minmax(0,1fr)',
  'wide-first': 'minmax(0,3fr) minmax(0,2fr)',
  'narrow-first': 'minmax(0,2fr) minmax(0,3fr)',
};

export const widthOf = (b: Pick<Block, 'layout'>): LayoutWidth => b.layout.width ?? 'column';

export function pageContentWidth(doc: Pick<PageDocument, 'layout'>): number {
  return contentWidthPx[doc.layout?.contentWidth ?? 'standard'];
}

/** True when the page uses any layout-section option, so renderers know to lay out rows. */
export function usesLayout(blocks: Block[], doc?: Pick<PageDocument, 'layout'>): boolean {
  return (
    (doc?.layout?.contentWidth ?? 'standard') !== 'standard' ||
    blocks.some((b) => (b.layout.width ?? 'column') !== 'column' || !!b.layout.pair || (b.layout.background ?? 'none') !== 'none')
  );
}

export interface LayoutRowOf<T> {
  key: string;
  items: T[];
  width: LayoutWidth;
  background: NonNullable<BlockLayout['background']>;
  ratio: PairRatio | null;
  /** The first item shows second on phones. */
  firstSecondOnPhone: boolean;
}

/**
 * Groups a flat list into rows. A block with `pair` sits beside the next item.
 * Pairs are at least Wide so two blocks never squeeze into the reading column.
 */
export function layoutRows<T>(items: T[], blockOf: (item: T) => Block | null, keyOf: (item: T) => string): LayoutRowOf<T>[] {
  const rows: LayoutRowOf<T>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const b = blockOf(item);
    const next = items[i + 1];
    const nextBlock = next ? blockOf(next) : null;
    const width = b ? widthOf(b) : 'column';
    const background = b?.layout.background ?? 'none';
    if (b?.layout.pair && next && nextBlock) {
      rows.push({
        key: keyOf(item),
        items: [item, next],
        width: width === 'column' ? 'wide' : width,
        background,
        ratio: b.layout.pair,
        firstSecondOnPhone: !!b.layout.phoneSecond,
      });
      i++;
      continue;
    }
    rows.push({ key: keyOf(item), items: [item], width, background, ratio: null, firstSecondOnPhone: false });
  }
  return rows;
}

/**
 * Whether row i shares its section background with the row above / below (D216).
 * Matching tinted or inverted rows that touch read as one band, so their shared edge drops the band padding.
 */
export function bandJoins<T extends { background: NonNullable<BlockLayout['background']> }>(rows: T[], i: number): { joinPrev: boolean; joinNext: boolean } {
  const bg = rows[i]?.background ?? 'none';
  if (bg === 'none') return { joinPrev: false, joinNext: false };
  return { joinPrev: rows[i - 1]?.background === bg, joinNext: rows[i + 1]?.background === bg };
}

/** A section background taken from the theme, so it works in every theme. Inverted swaps text and background. */
export function sectionTheme(theme: PageTheme, background: NonNullable<BlockLayout['background']>): PageTheme {
  if (background === 'tint') return { ...theme, background: mix(theme.text, 5, theme.background), surface: theme.background };
  if (background === 'invert') {
    // Signature material (D161): inverted sections keep shape, type and depth but drop glass, gradients and custom borders,
    // which were tuned for the other polarity.
    const m = theme.material;
    return {
      ...theme,
      background: theme.text,
      surface: mix(theme.background, 8, theme.text),
      text: theme.background,
      mutedText: mix(theme.background, 74, theme.text),
      accent: theme.background,
      accentText: theme.text,
      material: m
        ? { ...m, surfaceFinish: m.surfaceFinish === 'glass' ? 'matte' : m.surfaceFinish, border: undefined, subtleText: undefined, buttonFinish: 'solid', buttonGradient: undefined, shadow: m.shadow === 'glow' ? 'soft' : m.shadow, backdrop: undefined }
        : undefined,
    };
  }
  return theme;
}
