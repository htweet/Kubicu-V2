import type { BlockType } from '../types/page';
import type { ContainerType } from '../utils/containers';

/*
 * Block compatibility (D174). The canvas hierarchy is: Page → page blocks (including Section) →
 * containers (Section, Columns, Tabs) → content blocks → each block's own settings. Containers hold up
 * to 4 blocks, one level deep. These rules say which blocks may sit inside which container, and why not
 * when they can't. They are enforced when adding and moving blocks; an existing arrangement that breaks
 * them is never changed automatically — the Check tab explains it and offers "Move out".
 */

/** Blocks that only make sense on the page itself, with the reason shown to the user. */
export const pageLevelOnly: Partial<Record<BlockType, string>> = {
  section: 'Containers can’t go inside other containers.',
  columns: 'Containers can’t go inside other containers.',
  tabs: 'Containers can’t go inside other containers.',
  hero: 'A hero opens the page or a section at full width, so it stays on the page.',
  announcement: 'An announcement bar runs across the page, so it stays on the page.',
  anchorNav: 'Jump links point at page sections, so they sit on the page.',
  backToTop: 'Back to top belongs at the very end of the page.',
  membersOnly: 'Members-only hides the page blocks below it, so it can’t sit inside a container.',
  campaignSpotlight: 'A campaign spotlight is a page-level feature with its own schedule.',
};

/** Extra limits per container, on top of `pageLevelOnly`. */
const notIn: Record<ContainerType, Partial<Record<BlockType, string>>> = {
  section: {},
  columns: {
    comparison: 'A comparison table needs the full width to stay readable — put it on the page or in a Section.',
    productGrid: 'A product grid is already a grid; inside Columns its cards get too narrow. Use a Section instead.',
    menu: 'A full menu needs the width — put it on the page or in a Section or Tabs.',
    listings: 'Listings are already laid out as cards; inside Columns they get too narrow.',
    gallery: 'A gallery inside a column becomes thumbnails. Put it in a Section, or use a single Image here.',
    carousel: 'A carousel inside a column gets too small to swipe comfortably. Use a Section instead.',
    portfolio: 'A portfolio grid needs the width — use a Section or Tabs.',
    featureGrid: 'A feature grid is already columns; nesting it squeezes the cards. Use a Section.',
    team: 'Team portraits get too small inside a column. Use a Section.',
    figures: 'Figures already sit side by side; use a Section.',
    logoStrip: 'A logo strip runs edge to edge; use a Section.',
    agenda: 'An agenda reads best at full width; use a Section or Tabs.',
  },
  tabs: {
    spacer: 'Spacing inside a tab comes from the tab itself.',
    divider: 'Tabs already separate their contents.',
  },
};

export interface Fit {
  ok: boolean;
  reason?: string;
}

/** Can a block of `type` sit inside a container of `container`? */
export function fitsIn(type: BlockType, container: ContainerType): Fit {
  const page = pageLevelOnly[type];
  if (page) return { ok: false, reason: page };
  const extra = notIn[container][type];
  return extra ? { ok: false, reason: extra } : { ok: true };
}

/** Plain-words rule per container, for the inspector and the spec. */
export const containerRules: Record<ContainerType, string> = {
  section: 'Holds up to 4 blocks stacked under one heading, width and background. Anything except containers and page-level blocks.',
  columns: 'Each block is one column (2–4). Best for text, images, forms, single products, quotes and contact details. Grids, galleries and wide tables need a Section instead. Columns stack on phones.',
  tabs: 'Each block is one tab (up to 4). Becomes an accordion on phones. Spacers and dividers aren’t needed inside tabs.',
};
