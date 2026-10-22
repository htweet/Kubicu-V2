import type { Block, BlockContentMap, BlockStyle, BlockType, PageDocument, PageTheme } from '../../types/page';
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