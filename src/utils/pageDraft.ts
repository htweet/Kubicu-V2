import { pageThemePresets } from '../data/pageThemes';
import type { Block, BlockContentMap, BlockType, PageDocument } from '../types/page';
import { createBlock } from './blocks';

/**
 * Server page drafts (Gajae-Code proof of concept P5/P6; AI-Engine post-m2-review/15 §10–11).
 *
 * An AI agent saves a Page Draft Specification on the Kubicu Platform API. The server has already validated it:
 * every block's content is exactly this app's `BlockContentMap[type]`, and the theme is one of this app's presets.
 * Here it becomes a normal `PageDocument` with this app's own `createBlock`, so it renders, and later opens in the
 * Canvas, like any other page. Anything this build does not know is refused rather than guessed.
 */
export const DRAFT_BLOCK_TYPES = ['profile', 'heading', 'text', 'link', 'social', 'whatsapp', 'contact', 'faq', 'hero', 'cta', 'quote'] as const satisfies readonly BlockType[];
type DraftBlockType = (typeof DRAFT_BLOCK_TYPES)[number];

export interface DraftMissingInformation {
  field: string;
  reason: string;
  requiredBeforePublish: boolean;
}

export interface PageDraftSpec {
  schemaVersion: '1.0';
  title: string;
  themeKey: string;
  language: string;
  seo: { title: string; description: string };
  blocks: { [K in DraftBlockType]: { type: K; content: BlockContentMap[K] } }[DraftBlockType][];
  missingInformation: DraftMissingInformation[];
}

/** A draft as GET /v1/workspaces/{ws}/page-drafts/{id} returns it. */
export interface ServerPageDraft {
  id: string;
  title: string;
  version: number;
  runId: string | null;
  updatedAt: string;
  spec: PageDraftSpec;
}

const KNOWN = new Set<string>(DRAFT_BLOCK_TYPES);

/** The draft as a page document, or null when it uses something this build does not know. */
export function documentFromDraft(draft: ServerPageDraft): PageDocument | null {
  const spec = draft.spec;
  if (spec?.schemaVersion !== '1.0' || !Array.isArray(spec.blocks)) return null;
  const preset = pageThemePresets.find((p) => p.id === spec.themeKey);
  if (!preset) return null;
  const blocks: Block[] = [];
  for (const b of spec.blocks) {
    if (!KNOWN.has(b.type)) return null;
    const block = createBlock(b.type);
    blocks.push({ ...block, content: { ...block.content, ...b.content } } as Block);
  }
  return {
    id: `draft_${draft.id}`,
    schemaVersion: 1,
    handle: '',
    title: spec.title,
    theme: { ...preset.theme },
    seo: { title: spec.seo.title, description: spec.seo.description, noIndex: true },
    blocks,
    branding: { hideKubicuBadge: false, hideFromSearch: true },
    language: spec.language || 'en',
    updatedAt: draft.updatedAt
  };
}
