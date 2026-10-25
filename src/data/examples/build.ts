import type { Block, BlockContentMap, BlockLayout, BlockStyle, BlockType, PageDocument, PageTheme } from '../../types/page';
import type { WorkspacePlan } from '../../types/plan';

export type ExampleGoal = 'sell' | 'book' | 'audience' | 'showcase' | 'events' | 'support';
export type ExampleStyle = 'light' | 'dark' | 'editorial' | 'bold';

export interface ExamplePage {
  id: string;
  /** Business type shown in filters. */
  category: string;
  name: string;
  city: string;
  bestFor: string;
  description: string;
  goals: ExampleGoal[];
  styles: ExampleStyle[];
  /** The plan this fictional page is on (drives gallery + badge). */
  plan: WorkspacePlan;
  doc: PageDocument;
  /** Elite Template Library (D154): paid, structurally distinct templates with their own register entry. */
  elite?: EliteMeta;
  /** Artwork collection (D158): classic single-column pages with an AI-generated background artwork. */
  artwork?: ArtworkMeta;
}

export interface ArtworkMeta {
  /** Example price in naira (test mode), never above ₦3,000. */
  priceNgn: number;
  /** Short name of the artwork style, e.g. "Aurora ribbons". */
  art: string;
}

export type EliteUseCase = 'creators' | 'media' | 'professionals' | 'commerce' | 'services' | 'events' | 'impact';
export type EliteGoal = 'audience' | 'enquiries' | 'sell' | 'bookings' | 'register';

export interface EliteMeta {
  /** 01–24, as in docs/TEMPLATE_REGISTER.md. */
  number: number;
  useCase: EliteUseCase;
  goal: EliteGoal;
  /** Example price in naira (test mode). */
  priceNgn: number;
  /** One line naming the structural concept, e.g. "Cover hero · media list · sticky Listen bar". */
  structure: string;
  /** Sections in order, as shown under "What's inside". */
  inside: string[];
  /** Honesty notes: what's sample, what needs a plan or module. */
  goodToKnow: string[];
}

const stamp = '2026-10-10T09:00:00.000Z';

/** Builds a block for sample content. Everything in examples is fictional and illustrative. */
export function b<K extends BlockType>(id: string, type: K, content: BlockContentMap[K], style: Partial<BlockStyle> = {}): Block {
  return {
    id,
    type,
    schemaVersion: 1,
    content,
    style: { align: 'left', emphasis: 'default', ...style },
    layout: { spacing: 'normal' },
    behaviour: { trackClicks: true, openInNewTab: true },
    visibility: { hidden: false },
    accessibility: { label: '' },
    createdAt: stamp,
    updatedAt: stamp
  } as unknown as Block;
}

/** Same as `b`, with layout-section options (D153). */
export function bl<K extends BlockType>(id: string, type: K, content: BlockContentMap[K], layout: Partial<BlockLayout> = {}, style: Partial<BlockStyle> = {}): Block {
  const block = b(id, type, content, style);
  return { ...block, layout: { ...block.layout, ...layout } } as Block;
}

export function doc(handle: string, title: string, seoDescription: string, theme: PageTheme, blocks: Block[]): PageDocument {
  return {
    id: `ex_${handle}`,
    schemaVersion: 1,
    handle,
    title,
    theme,
    seo: { title, description: seoDescription },
    blocks,
    updatedAt: stamp
  };
}

export function hours(open: string, close: string, closedDays: number[] = [0], overrides: Record<number, [string, string]> = {}) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: overrides[day]?.[0] ?? open,
    close: overrides[day]?.[1] ?? close,
    closed: closedDays.includes(day)
  }));
}