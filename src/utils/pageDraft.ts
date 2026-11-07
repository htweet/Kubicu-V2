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

/**
 * The draft as a page document, or null when it uses something this build does not know. For the private preview it is
 * kept out of search engines; `canvas` makes the owner's own editable page instead (its id and address, normal search
 * settings, which the owner controls as on any page).
 */
export function documentFromDraft(draft: ServerPageDraft, canvas?: {pageId: string;handle: string;}): PageDocument | null {
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
    id: canvas ? canvas.pageId : `draft_${draft.id}`,
    schemaVersion: 1,
    handle: canvas ? canvas.handle : '',
    title: spec.title,
    theme: { ...preset.theme },
    seo: canvas ? { title: spec.seo.title, description: spec.seo.description } : { title: spec.seo.title, description: spec.seo.description, noIndex: true },
    blocks,
    ...(canvas ? {} : { branding: { hideKubicuBadge: false, hideFromSearch: true } }),
    language: spec.language || 'en',
    updatedAt: canvas ? new Date().toISOString() : draft.updatedAt
  };
}

/** A fresh address for a page made from a draft: from its title, with a short random ending. */
export function handleFromTitle(title: string): string {
  const base = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 16) || 'page';
  return `${base}${Math.random().toString(36).slice(2, 6)}`;
}
